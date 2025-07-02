import { NextResponse } from 'next/server';
import whois from 'whois-json';
import SSLVerifier from 'ssl-verifier';
import { parseDomainDetails, extractHostnames, checkDNSSEC } from '@/app/utils/domainUtils';
import { analyzeSecurityHeaders, checkSecurityProtocols } from '@/app/utils/securityUtils';
import { detectTechStack } from '@/app/utils/techDetect';
import fetch, { Headers } from 'node-fetch';
import { URL } from 'url';
import dns from 'dns/promises';
import { setTimeout as delay } from 'timers/promises';

export const dynamic = 'force-dynamic'; // Ensure dynamic API route

// Multi-resolver DNS lookup helper
const resolvers = [
  null, // system default
  '8.8.8.8', // Google
  '1.1.1.1', // Cloudflare
  '9.9.9.9', // Quad9
];

async function multiResolverLookup(domain: string, type: string) {
  const originalServers = dns.getServers();
  const results = new Set<string>();
  for (const resolver of resolvers) {
    try {
      if (resolver) dns.setServers([resolver]);
      else dns.setServers(originalServers);
      const recordsRaw = await dns.resolve(domain, type);
      const records: any[] = Array.isArray(recordsRaw) ? recordsRaw : [recordsRaw];
      records.forEach((r: any) => results.add(JSON.stringify(r)));
    } catch (e) {
      // Ignore errors, try next resolver
    }
  }
  dns.setServers(originalServers); // Restore
  return Array.from(results).map(r => {
    try { return JSON.parse(r); } catch { return r; }
  });
}

// Google DNS over HTTPS fallback
async function fetchFromGoogleDNS(domain: string, type: string) {
  const url = `https://dns.google/resolve?name=${domain}&type=${type}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.Answer) return [];
    return data.Answer.map((ans: any) => ans.data);
  } catch {
    return [];
  }
}

// Unified DNS record fetcher
async function getDNSRecords(domain: string, type: string) {
  let records: any[] = await multiResolverLookup(domain, type);
  if (!records.length) {
    records = await fetchFromGoogleDNS(domain, type);
  }
  // Deduplicate
  return Array.from(new Set(records.map(r => typeof r === 'string' ? r : JSON.stringify(r))))
    .map(r => { try { return JSON.parse(r as string); } catch { return r; } });
}

// Helper: Extract emails from text using regex
function extractEmails(text: string): string[] {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return Array.from(new Set((text.match(emailRegex) || []).map(e => e.trim().toLowerCase())));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  
  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  try {
    // Domain parsing
    const domainDetails = parseDomainDetails(domain);

    // --- PARALLEL NETWORK REQUESTS ---
    // Helper for timeout
    const withTimeout = async (promise: Promise<any>, ms: number, fallback: any) => {
      return Promise.race([
        promise,
        delay(ms).then(() => fallback)
      ]);
    };

    // WHOIS
    const whoisPromise = withTimeout(
      whois(domainDetails.hostname, { follow: 3 }).catch(() => ({})),
      3500,
      {}
    );

    // DNS (all types)
    const allDnsTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'SRV', 'PTR', 'SPF', 'NAPTR', 'CAA', 'CERT', 'DNSKEY', 'DS', 'LOC', 'NAPTR', 'SMIMEA', 'SSHFP', 'TLSA', 'URI'];
    const dnsPromise = (async () => {
      const rawDns: Record<string, any> = {};
      await Promise.all(
        allDnsTypes.map(async (type) => {
          rawDns[type] = await withTimeout(getDNSRecords(domain, type), 2500, []);
        })
      );
      return rawDns;
    })();

    // DNSSEC
    const dnssecPromise = withTimeout(checkDNSSEC(domain), 2000, null);

    // SSL/TLS
    const sslPromise = withTimeout(
      (async () => {
        let sslInfo: any = {};
        try {
          sslInfo = await SSLVerifier.Info(`https://${domainDetails.hostname}`);
          if (!sslInfo.chain || !Array.isArray(sslInfo.chain)) sslInfo.chain = [];
          if (sslInfo.chain.length === 0 && sslInfo.cert) sslInfo.chain.push(sslInfo.cert);
        } catch {
          sslInfo = { valid: false, error: 'Failed to retrieve SSL information', chain: [] };
        }
        return sslInfo;
      })(),
      3500,
      { valid: false, error: 'SSL timeout', chain: [] }
    );

    // Homepage fetch
    const homepagePromise = withTimeout(
      (async () => {
        try {
          const homepageUrl = `https://${domainDetails.hostname}`;
          const response = await fetch(homepageUrl);
          const html = await response.text();
          return { html, responseHeaders: response.headers };
        } catch {
          return { html: '', responseHeaders: new Headers() };
        }
      })(),
      3500,
      { html: '', responseHeaders: new Headers() }
    );

    // Subdomains from crt.sh
    const subdomainsPromise = withTimeout(
      (async () => {
        try {
          const subdomainsRes = await fetch(`https://crt.sh/?q=%.${domain}&output=json`);
          let subdomainsData: any = [];
          try { subdomainsData = await subdomainsRes.json(); } catch { subdomainsData = []; }
          const subdomains: string[] = [];
          if (Array.isArray(subdomainsData)) {
            subdomainsData.forEach((entry: any) => {
              if (entry.name_value) {
                entry.name_value.split('\n').forEach((name: string) => {
                  const cleanName = name.trim().replace('*.', '');
                  if (cleanName.endsWith(domain) && cleanName !== domain) {
                    subdomains.push(cleanName);
                  }
                });
              }
            });
          }
          return [...new Set(subdomains)].sort();
        } catch {
          return [];
        }
      })(),
      3500,
      []
    );

    // Threat intelligence (URLhaus)
    const urlhausPromise = withTimeout(
      (async () => {
        try {
          const urlhausRes = await fetch(`https://urlhaus-api.abuse.ch/v1/host/${domain}/`);
          return urlhausRes.ok ? await urlhausRes.json() : null;
        } catch {
          return null;
        }
      })(),
      2500,
      null
    );

    // Vulnerabilities
    const vulnPromise = withTimeout(
      (async () => {
        try {
          const vulnRes = await fetch(`https://vulners.com/api/v3/search/lucene/?query=domain:${domain}`);
          const vulnData = vulnRes.ok ? await vulnRes.json() : null;
          return vulnData?.data?.search || [];
        } catch {
          return [];
        }
      })(),
      3500,
      []
    );

    // Await all in parallel
    const [whoisDataRaw, rawDns, dnssec, sslInfo, homepage, uniqueSubdomains, urlhausData, vulnerabilities] = await Promise.all([
      whoisPromise,
      dnsPromise,
      dnssecPromise,
      sslPromise,
      homepagePromise,
      subdomainsPromise,
      urlhausPromise,
      vulnPromise
    ]);

    // DNS records (summary)
    const dnsRecords = {
      A: rawDns.A,
      AAAA: rawDns.AAAA,
      MX: rawDns.MX,
      TXT: rawDns.TXT,
      NS: rawDns.NS,
      CNAME: rawDns.CNAME,
      SOA: rawDns.SOA,
      SRV: rawDns.SRV,
      PTR: rawDns.PTR,
      SPF: rawDns.SPF
    };

    // Security headers analysis
    const securityHeaders = analyzeSecurityHeaders(homepage.responseHeaders);
    // Security protocols
    const securityProtocols = checkSecurityProtocols(
      sslInfo.protocol,
      sslInfo.ciphers ? sslInfo.ciphers.map((c: any) => c.name) : []
    );
    // Technology stack detection
    const techStack = detectTechStack(homepage.responseHeaders, homepage.html);

    // --- EMAIL EXTRACTION ---
    const foundEmails = new Set<string>();
    // 1. WHOIS
    [whoisDataRaw?.registrantEmail, whoisDataRaw?.adminEmail, whoisDataRaw?.techEmail, whoisDataRaw?.email].forEach(e => {
      if (e) extractEmails(e).forEach(em => foundEmails.add(em));
    });
    // 2. DNS TXT/SPF
    if (rawDns.TXT) {
      rawDns.TXT.flat().forEach((txt: string) => {
        extractEmails(txt).forEach(em => foundEmails.add(em));
      });
    }
    if (rawDns.SPF) {
      rawDns.SPF.flat().forEach((spf: string) => {
        extractEmails(spf).forEach(em => foundEmails.add(em));
      });
    }
    // 3. Homepage HTML
    if (homepage.html) {
      extractEmails(homepage.html).forEach(em => foundEmails.add(em));
    }
    const emailResults = Array.from(foundEmails);

    // Broken links check (homepage only, can be slow, so run after main awaits)
    let brokenLinks: any[] = [];
    if (homepage.html) {
      const linkRegex = /<a [^>]*href=['"]([^'">]+)['"][^>]*>/gi;
      let match;
      const linkChecks: Promise<any>[] = [];
      while ((match = linkRegex.exec(homepage.html)) !== null) {
        const url = match[1];
        try {
          const absoluteUrl = new URL(url, `https://${domainDetails.hostname}`).href;
          linkChecks.push(
            fetch(absoluteUrl, { method: 'HEAD' })
              .then(linkRes => {
                if (!linkRes.ok) {
                  return {
                    url: absoluteUrl,
                    status: linkRes.status,
                    statusText: linkRes.statusText
                  };
                }
                return null;
              })
              .catch(() => ({ url: absoluteUrl, status: 0, statusText: 'Failed to fetch' }))
          );
        } catch {
          brokenLinks.push({ url, status: 0, statusText: 'Invalid URL' });
        }
      }
      const checked = await Promise.all(linkChecks);
      brokenLinks = brokenLinks.concat(checked.filter(Boolean));
    }

    // IP addresses and services (can be slow, so run after main awaits)
    const ipServices: any[] = [];
    for (const ip of dnsRecords.A || []) {
      try {
        const reverse = await withTimeout(dns.reverse(ip), 2000, []);
        try {
          const shodanRes = await withTimeout(fetch(`https://internetdb.shodan.io/host/${ip}`), 2000, { ok: false });
          const shodanData = shodanRes.ok ? await shodanRes.json() : null;
          ipServices.push({
            ip,
            hostnames: reverse,
            services: shodanData?.ports?.map((port: number) => ({
              port,
              service: shodanData?.cpes?.[port] || 'unknown'
            })) || []
          });
        } catch {
          ipServices.push({ ip, hostnames: reverse, services: [] });
        }
      } catch {
        ipServices.push({ ip, hostnames: [], services: [] });
      }
    }

    return NextResponse.json({
      domainDetails,
      whois: whoisDataRaw,
      dns: dnsRecords,
      rawDns,
      dnssec,
      ssl: sslInfo,
      security: {
        headers: securityHeaders,
        protocols: securityProtocols
      },
      techStack,
      subdomains: uniqueSubdomains,
      threats: {
        urlhaus: urlhausData
      },
      vulnerabilities,
      brokenLinks,
      ipServices,
      emails: emailResults
    });
    
  } catch (error: any) {
    console.error('Domain API error:', error, error?.stack);
    const errorMessage = error.message || 'Failed to fetch domain data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}