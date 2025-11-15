import { NextResponse } from 'next/server';
import whois from 'whois-json';
import SSLVerifier from 'ssl-verifier';
import { parseDomainDetails, checkDNSSEC } from '@/app/utils/domainUtils';
import { 
  analyzeSecurityHeaders, 
  checkSecurityProtocols,
  analyzeCookies,
  validateCSP,
  detectMixedContent,
  checkHSTSPreload,
  analyzeEmailSecurity
} from '@/app/utils/securityUtils';
import { detectTechStack } from '@/app/utils/techDetect';
import { comprehensiveDNSAnalysis } from '@/app/utils/dnsAnalysis';
import { comprehensiveIPReputation } from '@/app/utils/ipReputation';
import { calculateSecurityScore, assessRisk, generateRecommendations } from '@/app/utils/securityScore';
import { scanPorts, getOpenPortsSummary } from '@/app/utils/portScanner';
import { enumerateSubdomains, analyzeSubdomains } from '@/app/utils/subdomainEnum';
import { analyzeCertificateChain, checkCertificateTransparency } from '@/app/utils/certificateAnalysis';
import { gradeSecurityHeaders } from '@/app/utils/securityHeadersGrading';
import { detectPhishing } from '@/app/utils/phishingDetection';
import { checkComprehensiveBlacklists } from '@/app/utils/comprehensiveBlacklist';
import { deepCrawl, analyzeCrawlResults } from '@/app/utils/webCrawler';
import { checkRobotsTxt, checkSitemap, checkCommonFiles, discoverAPIEndpoints, extractSocialMedia, analyzeWebsiteStructure, checkExposedInformation } from '@/app/utils/informationGathering';
import { advancedTechnologyFingerprinting } from '@/app/utils/technologyFingerprinting';
import { analyzePerformance } from '@/app/utils/performanceAnalysis';
import { performSEOSecurityChecks } from '@/app/utils/seoSecurityChecks';
import { analyzeJavaScript } from '@/app/utils/javascriptAnalysis';
import { comprehensiveVulnerabilityScan } from '@/app/utils/vulnerabilityScanner';
import { checkSSLExpiration, getExpirationAlertLevel, needsExpirationAlert } from '@/app/utils/sslMonitoring';
import { sendEmail, generateEmailTemplate } from '@/app/utils/emailService';
import { detectDNSChanges } from '@/app/utils/dnsChangeDetection';
import { checkCompliance } from '@/app/utils/complianceChecker';
import { performUptimeCheck, calculateUptimeStats } from '@/app/utils/uptimeMonitoring';
import { runLighthouseAnalysis } from '@/app/utils/lighthouseAnalysis';
import { storeHistoricalRecord } from '@/app/utils/historicalTracking';
import { performOWASPTop10Tests } from '@/app/utils/penetrationTesting';
import { checkThreatIntelligence } from '@/app/utils/threatIntelligence';
import { monitorBrand, generateTyposquattingVariations } from '@/app/utils/brandMonitoring';
import { detectAnomalies, recognizePatterns, predictSecurityScore } from '@/app/utils/machineLearning';
// API security testing is now handled by analyzeAPIAuthentication and detectRateLimiting
import { generateExecutiveReport } from '@/app/utils/executiveReports';
import { updateDomainStatus } from '@/app/utils/multiDomainMonitoring';
import { checkDoHSupport, detectDNSCachePoisoning, analyzeDNSResponseTime } from '@/app/utils/dnsSecurity';
import { testTLSVersions, checkCertificatePinning, validateOCSPStapling } from '@/app/utils/tlsDeepAnalysis';
import { analyzeEnhancedSecurityHeaders, analyzeSessionSecurity, testAuthenticationSecurity } from '@/app/utils/webAppSecurity';
import { categorizeCookies, validatePrivacyPolicy } from '@/app/utils/privacyCompliance';
import { analyzeAPIAuthentication, detectRateLimiting } from '@/app/utils/apiSecurityTesting';
import { checkMobileAppSecurity } from '@/app/utils/mobileAppSecurity';
import { scanCMS } from '@/app/utils/cmsScanner';
import { performNetworkTests } from '@/app/utils/networkTests';
import { scanAPI, scanKubernetes, auditPasswords } from '@/app/utils/specializedScanners';
import { getWebToolsResults } from '@/app/utils/webTools';
import { validateDNSSEC } from '@/app/utils/advancedDNSSEC';
import { performAdvancedTLSAnalysis } from '@/app/utils/advancedTLS';
import { performAdvancedOWASPTests } from '@/app/utils/advancedOWASP';
import { monitorDomain } from '@/app/utils/realTimeMonitoring';
import { analyzeCoreWebVitals, checkPerformanceBudget } from '@/app/utils/coreWebVitals';
import { generateEnhancedExecutiveReport, generateComparativeReport } from '@/app/utils/enhancedReporting';
import { checkAdvancedThreatIntelligence } from '@/app/utils/advancedThreatIntelligence';
import { performComprehensiveScan } from '@/app/utils/comprehensiveScanning';
import { detectCloudInfrastructure } from '@/app/utils/cloudInfrastructure';
import { testGraphQLSecurity } from '@/app/utils/graphQLSecurity';
import { testAdvancedAPISecurity } from '@/app/utils/advancedAPISecurity';
import { scanSupplyChain } from '@/app/utils/supplyChainSecurity';
import { scanContainerSecurity } from '@/app/utils/containerSecurity';
import { detectDataLeakage } from '@/app/utils/dataLeakageDetection';
import { detectWAF } from '@/app/utils/wafDetection';
import { testAdvancedAuthentication } from '@/app/utils/advancedAuthTesting';
import { analyzeDomainReputation } from '@/app/utils/domainReputation';
import { assessCompliance } from '@/app/utils/complianceFrameworks';
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
      const records: unknown[] = Array.isArray(recordsRaw) ? recordsRaw : [recordsRaw];
      records.forEach((r: unknown) => results.add(JSON.stringify(r)));
    } catch {
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
  let records: unknown[] = await multiResolverLookup(domain, type);
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
  const profile = searchParams.get('profile') || 'deep';
  const customConfigStr = searchParams.get('config');
  
  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  // Parse custom config if provided
  let customConfig: any = null;
  if (customConfigStr) {
    try {
      customConfig = JSON.parse(customConfigStr);
    } catch {
      // Invalid config, ignore
    }
  }

  // Determine if deep scan is requested
  const isDeepScan = profile === 'deep' || (profile === 'custom' && customConfig?.includeDeepScan !== false);

  try {
    // Domain parsing
    const domainDetails = parseDomainDetails(domain);

    // --- PARALLEL NETWORK REQUESTS ---
    // Helper for timeout
    const withTimeout = async (promise: Promise<unknown>, ms: number, fallback: unknown) => {
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
    const securityHeaders = analyzeSecurityHeaders((homepage as { responseHeaders: any }).responseHeaders);
    // Security protocols
    const securityProtocols = checkSecurityProtocols(
      (sslInfo as { protocol: any; ciphers?: any[] }).protocol,
      (sslInfo as { ciphers?: any[] }).ciphers ? (sslInfo as { ciphers: any[] }).ciphers.map((c: any) => c.name) : []
    );
    // Technology stack detection
    const techStack = detectTechStack((homepage as { responseHeaders: any; html: string }).responseHeaders, (homepage as { html: string }).html);
    
    // Additional security checks
    const cookiesResult = analyzeCookies((homepage as { responseHeaders: any }).responseHeaders);
    const cookies = cookiesResult.cookies || [];
    const csp = validateCSP(securityHeaders['content-security-policy']?.value || null);
    const mixedContent = detectMixedContent((homepage as { html?: string }).html || '', `https://${domainDetails.hostname}`);
    const hsts = await withTimeout(checkHSTSPreload(domainDetails.hostname), 3000, { preloaded: false, eligible: false, errors: ['Timeout'] });
    
    // Email security (SPF/DKIM/DMARC)
    const txtRecords = (rawDns.TXT || []).flat().map((r: any) => typeof r === 'string' ? r : r.data || '').filter(Boolean);
    const emailSecurity = analyzeEmailSecurity(txtRecords, domain);
    
    // DNS Analysis
    const dnsAnalysis = await withTimeout(comprehensiveDNSAnalysis(domain), 5000, { 
      responseTime: { success: false, time: 0, error: 'Timeout' },
      propagation: [],
      dnsOverHTTPS: [],
      cachePoisoning: { suspicious: false, consistency: 0, recordSets: [], results: [] },
      score: 0
    });

    // Port Scanning (Full scan 0-65535)
    // Note: Full port scan can take 5-10 minutes depending on network conditions
    const portScan = await withTimeout(
      (async () => {
        console.log(`Starting full port scan (0-65535) for ${domainDetails.hostname}`);
        const ports = await scanPorts(domainDetails.hostname); // Scans all 65536 ports
        console.log(`Port scan completed: ${ports.filter(p => p.open).length} open ports found`);
        return getOpenPortsSummary(ports);
      })(),
      600000, // 10 minutes timeout for full port scan
      { total: 0, open: 0, closed: 0, openPorts: [], riskLevel: 'low', recommendations: [] }
    );

    // Enhanced Subdomain Enumeration
    const enhancedSubdomains = await withTimeout(
      enumerateSubdomains(domain),
      10000,
      []
    );
    const subdomainAnalysis = analyzeSubdomains(enhancedSubdomains, domain);

    // Certificate Chain Analysis
    const certificateAnalysis = await withTimeout(
      analyzeCertificateChain(domainDetails.hostname),
      5000,
      { valid: false, chain: [], certificate: null, issues: [], recommendations: [], grade: 'F' }
    );

    // Certificate Transparency
    const certificateTransparency = await withTimeout(
      checkCertificateTransparency(domain),
      5000,
      { found: false, certificates: [], total: 0, message: 'Timeout' }
    );

    // Security Headers Grading
    const headersGrading = gradeSecurityHeaders((homepage as { responseHeaders: any }).responseHeaders);

    // Phishing Detection
    const phishingDetection = await withTimeout(
      detectPhishing(domain),
      5000,
      { suspicious: false, score: 100, indicators: [], sources: {}, recommendations: [] }
    );

    // Comprehensive Blacklist Checking
    const firstIP = dnsRecords.A && dnsRecords.A.length > 0 ? dnsRecords.A[0] : null;
    const blacklistCheck = await withTimeout(
      checkComprehensiveBlacklists(domain, firstIP),
      5000,
      { domain, ip: firstIP, blacklisted: false, lists: [], score: 100, recommendations: [] }
    );

    // === DEEP SCANNING FEATURES ===
    let deepScanResults: any = {};
    
    if (isDeepScan) {
      // Web Crawling
      const crawlResults = await withTimeout(
        deepCrawl(domainDetails.hostname, 20, 2),
        15000,
        []
      );
      const crawlAnalysis = crawlResults.length > 0 ? analyzeCrawlResults(crawlResults) : null;

      // Information Gathering
      const robotsTxt = await withTimeout(checkRobotsTxt(domainDetails.hostname), 5000, { found: false, content: null, analysis: {} });
      const sitemap = await withTimeout(checkSitemap(domainDetails.hostname), 5000, { found: false, url: null, content: null, analysis: {} });
      const commonFiles = await withTimeout(checkCommonFiles(domainDetails.hostname), 10000, { checked: 0, found: 0, files: [], riskLevel: 'low' });
      const apiEndpoints = discoverAPIEndpoints(domainDetails.hostname, (homepage as { html?: string }).html || '');
      const socialMedia = extractSocialMedia((homepage as { html?: string }).html || '');
      const websiteStructure = crawlResults.length > 0 ? analyzeWebsiteStructure(crawlResults) : null;
      const exposedInfo = checkExposedInformation((homepage as { html?: string }).html || '', (homepage as { responseHeaders: any }).responseHeaders);

      // Technology Fingerprinting
      const scripts = crawlResults.length > 0 ? crawlResults.flatMap(r => r.scripts) : [];
      const techFingerprint = advancedTechnologyFingerprinting(
        (homepage as { responseHeaders: any }).responseHeaders,
        (homepage as { html?: string }).html || '',
        scripts
      );

      // Performance Analysis
      const performance = await withTimeout(
        analyzePerformance(`https://${domainDetails.hostname}`),
        10000,
        { responseTime: 0, contentSize: 0, error: 'Timeout', performance: { grade: 'F', recommendations: [] } }
      );

      // SEO Security Checks
      const metadata = crawlResults.length > 0 && crawlResults[0]?.metadata 
        ? crawlResults[0].metadata 
        : { title: '', description: '', keywords: [], author: '', ogTags: {}, twitterTags: {} };
      const seoSecurity = performSEOSecurityChecks((homepage as { html?: string }).html || '', metadata);

      // JavaScript Analysis
      const jsAnalysis = analyzeJavaScript((homepage as { html?: string }).html || '', scripts);

      // Comprehensive Vulnerability Scanning
      const vulnScan = await withTimeout(
        comprehensiveVulnerabilityScan(
          domainDetails.hostname,
          (homepage as { html?: string }).html || '',
          Object.fromEntries((homepage as { responseHeaders: any }).responseHeaders.entries())
        ),
        10000,
        { total: 0, critical: 0, high: 0, medium: 0, low: 0, vulnerabilities: [], riskLevel: 'low' }
      );

      deepScanResults = {
        crawling: {
          pagesCrawled: crawlResults.length,
          analysis: crawlAnalysis,
        },
        informationGathering: {
          robotsTxt,
          sitemap,
          commonFiles,
          apiEndpoints,
          socialMedia,
          websiteStructure,
          exposedInformation: exposedInfo,
        },
        technologyFingerprinting: techFingerprint,
        performance,
        seoSecurity,
        javascriptAnalysis: jsAnalysis,
        vulnerabilityScan: vulnScan,
      };
    }

    // --- EMAIL EXTRACTION ---
    const foundEmails = new Set<string>();
    // 1. WHOIS
    [
      (whoisDataRaw as { registrantEmail?: string })?.registrantEmail,
      (whoisDataRaw as { adminEmail?: string })?.adminEmail,
      (whoisDataRaw as { techEmail?: string })?.techEmail,
      (whoisDataRaw as { email?: string })?.email
    ].forEach(e => {
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
    if ((homepage as { html?: string }).html) {
      extractEmails((homepage as { html: string }).html).forEach(em => foundEmails.add(em));
    }
    const emailResults = Array.from(foundEmails);

    // Broken links check (homepage only, can be slow, so run after main awaits)
    let brokenLinks: any[] = [];
    if ((homepage as { html?: string }).html) {
      const linkRegex = /<a [^>]*href=['"]([^'"]+)['"][^>]*>/gi;
      let match;
      const linkChecks: Promise<any>[] = [];
      while ((match = linkRegex.exec((homepage as { html: string }).html)) !== null) {
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
    const ipReputations: any[] = [];
    for (const ip of dnsRecords.A || []) {
      try {
        const reverse = await withTimeout(dns.reverse(ip), 2000, []);
        try {
          const shodanRes = await withTimeout(fetch(`https://internetdb.shodan.io/host/${ip}`), 2000, { ok: false }) as Response;
          const shodanData = shodanRes.ok ? await shodanRes.json() : null;
          ipServices.push({
            ip,
            hostnames: reverse,
            services: shodanData?.ports?.map((port: number) => ({
              port,
              service: shodanData?.cpes?.[port] || 'unknown'
            })) || []
          });
          
          // IP Reputation check (only for first IP to avoid rate limits)
          if (ipReputations.length === 0) {
            const ipRep = await withTimeout(
              comprehensiveIPReputation(ip, {
                virusTotal: process.env.VIRUSTOTAL_API_KEY,
                abuseIPDB: process.env.ABUSEIPDB_API_KEY
              }),
              3000,
              { geolocation: { success: false }, asn: { success: false }, virusTotal: { success: false }, abuseIPDB: { success: false }, blacklists: { blacklists: [] }, reputationScore: 50 }
            );
            ipReputations.push({ ip, ...ipRep });
          }
        } catch {
          ipServices.push({ ip, hostnames: reverse, services: [] });
        }
      } catch {
        ipServices.push({ ip, hostnames: [], services: [] });
      }
    }
    
    // Calculate security score and generate insights
    const securityData = {
      ssl: sslInfo,
      security: { headers: securityHeaders, protocols: securityProtocols },
      cookies: cookiesResult,
      csp,
      emailSecurity,
      dnsAnalysis,
      mixedContent,
      hsts,
      ipReputation: ipReputations[0] || null
    };
    
    const securityScore = calculateSecurityScore(securityData);
    const riskAssessment = assessRisk(securityScore, securityData);
    const recommendations = generateRecommendations(securityData);

    // Calculate all async values first (can't use await in object literals)
    const uptimeStats = await withTimeout(
      (async () => {
        try {
          const check = await performUptimeCheck(domainDetails.hostname);
          return calculateUptimeStats([check]);
        } catch (error) {
          console.error('Uptime check error:', error);
          return { domain: domainDetails.hostname, totalChecks: 0, upChecks: 0, downChecks: 0, slowChecks: 0, uptimePercentage: 0, averageResponseTime: 0, lastCheck: new Date(), lastStatus: 'down' };
        }
      })(),
      10000,
      { domain: domainDetails.hostname, totalChecks: 0, upChecks: 0, downChecks: 0, slowChecks: 0, uptimePercentage: 0, averageResponseTime: 0, lastCheck: new Date(), lastStatus: 'down' }
    );

    const sslMonitoringResult = await withTimeout(
      (async () => {
        try {
          return await checkSSLExpiration(domainDetails.hostname);
        } catch (error) {
          console.error('SSL monitoring error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    const complianceResult = await withTimeout(
      (async () => {
        try {
          return checkCompliance(
            domainDetails.hostname,
            sslInfo,
            { headers: securityHeaders },
            cookies,
            vulnerabilities,
            { privacyPolicy: false, encryption: true, accessControl: true }
          );
        } catch (error) {
          console.error('Compliance check error:', error);
          return { domain: domainDetails.hostname, gdpr: { name: 'GDPR', passed: false, score: 0, issues: [], recommendations: [] }, pciDss: { name: 'PCI-DSS', passed: false, score: 0, issues: [], recommendations: [] }, hipaa: { name: 'HIPAA', passed: false, score: 0, issues: [], recommendations: [] }, overallScore: 0, overallStatus: 'non-compliant' };
        }
      })(),
      3000,
      { domain: domainDetails.hostname, gdpr: { name: 'GDPR', passed: false, score: 0, issues: [], recommendations: [] }, pciDss: { name: 'PCI-DSS', passed: false, score: 0, issues: [], recommendations: [] }, hipaa: { name: 'HIPAA', passed: false, score: 0, issues: [], recommendations: [] }, overallScore: 0, overallStatus: 'non-compliant' }
    );

    const penetrationTestingResult = await withTimeout(
      (async () => {
        try {
          return await performOWASPTop10Tests(
            domainDetails.hostname,
            (homepage as { html?: string }).html || '',
            Object.fromEntries((homepage as { responseHeaders: any }).responseHeaders.entries())
          );
        } catch (error) {
          console.error('Penetration testing error:', error);
          return { domain: domainDetails.hostname, timestamp: new Date(), tests: [], overallScore: 0, riskLevel: 'low' };
        }
      })(),
      15000,
      { domain: domainDetails.hostname, timestamp: new Date(), tests: [], overallScore: 0, riskLevel: 'low' }
    );

    const threatIntelligenceResult = await withTimeout(
      (async () => {
        try {
          return await checkThreatIntelligence(
            domainDetails.hostname,
            firstIP,
            {
              virusTotal: process.env.VIRUSTOTAL_API_KEY,
              abuseIPDB: process.env.ABUSEIPDB_API_KEY,
              alienVault: process.env.ALIENVAULT_API_KEY,
            }
          );
        } catch (error) {
          console.error('Threat intelligence error:', error);
          return { domain: domainDetails.hostname, timestamp: new Date(), threats: [], overallRisk: 'low', threatScore: 100 };
        }
      })(),
      10000,
      { domain: domainDetails.hostname, timestamp: new Date(), threats: [], overallRisk: 'low', threatScore: 100 }
    );

    const brandMonitoringResult = await withTimeout(
      (async () => {
        try {
          const variations = generateTyposquattingVariations(domainDetails.hostname);
          return monitorBrand(domainDetails.hostname, variations.slice(0, 20));
        } catch (error) {
          console.error('Brand monitoring error:', error);
          return { brand: domainDetails.hostname, domains: [], totalThreats: 0, riskLevel: 'low' };
        }
      })(),
      5000,
      { brand: domainDetails.hostname, domains: [], totalThreats: 0, riskLevel: 'low' }
    );

    // Legacy API security test (replaced by apiSecurityTesting below)
    const apiSecurityResult = null;

    // DNS Security Enhancements
    const dnsSecurity = await withTimeout(
      (async () => {
        try {
          const [dohDot, cachePoisoning, responseTime] = await Promise.all([
            checkDoHSupport(domainDetails.hostname),
            detectDNSCachePoisoning(domainDetails.hostname),
            analyzeDNSResponseTime(domainDetails.hostname),
          ]);
          return { dohDot, cachePoisoning, responseTime };
        } catch (error) {
          console.error('DNS security check error:', error);
          return null;
        }
      })(),
      10000,
      null
    );

    // TLS Deep Analysis
    const tlsDeepAnalysis = await withTimeout(
      (async () => {
        try {
          const [tlsVersions, certPinning, ocspStapling] = await Promise.all([
            testTLSVersions(domainDetails.hostname),
            checkCertificatePinning(domainDetails.hostname, (homepage as { responseHeaders: any }).responseHeaders),
            validateOCSPStapling(domainDetails.hostname),
          ]);
          return { tlsVersions, certPinning, ocspStapling };
        } catch (error) {
          console.error('TLS deep analysis error:', error);
          return null;
        }
      })(),
      15000,
      null
    );

    // Web Application Security
    const webAppSecurity = await withTimeout(
      (async () => {
        try {
          const [enhancedHeaders, sessionSecurity, authSecurity] = await Promise.all([
            analyzeEnhancedSecurityHeaders((homepage as { responseHeaders: any }).responseHeaders),
            analyzeSessionSecurity(Array.isArray(cookies) ? cookies : cookiesResult.cookies || [], (homepage as { html?: string }).html || ''),
            testAuthenticationSecurity((homepage as { html?: string }).html || '', (homepage as { responseHeaders: any }).responseHeaders),
          ]);
          return { enhancedHeaders, sessionSecurity, authSecurity };
        } catch (error) {
          console.error('Web app security check error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // Privacy & Compliance
    const privacyCompliance = await withTimeout(
      (async () => {
        try {
          const [cookieAnalysis, privacyPolicy] = await Promise.all([
            categorizeCookies(Array.isArray(cookies) ? cookies : cookiesResult.cookies || []),
            validatePrivacyPolicy(domainDetails.hostname, (homepage as { html?: string }).html || ''),
          ]);
          return { cookieAnalysis, privacyPolicy };
        } catch (error) {
          console.error('Privacy compliance check error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // API Security Testing
    const apiSecurityTesting = await withTimeout(
      (async () => {
        try {
          const apiEndpoints = isDeepScan && deepScanResults?.informationGathering?.apiEndpoints?.endpoints 
            ? deepScanResults.informationGathering.apiEndpoints.endpoints 
            : [];
          if (apiEndpoints.length > 0) {
            const [authAnalysis, rateLimiting] = await Promise.all([
              analyzeAPIAuthentication(domainDetails.hostname, apiEndpoints.slice(0, 5)),
              detectRateLimiting(domainDetails.hostname, apiEndpoints.slice(0, 5)),
            ]);
            return { authAnalysis, rateLimiting };
          }
          return null;
        } catch (error) {
          console.error('API security testing error:', error);
          return null;
        }
      })(),
      10000,
      null
    );

    // Mobile App Security
    const mobileAppSecurity = await withTimeout(
      (async () => {
        try {
          return await checkMobileAppSecurity(domainDetails.hostname, (homepage as { html?: string }).html || '');
        } catch (error) {
          console.error('Mobile app security check error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // CMS Scanner
    const cmsScanner = await withTimeout(
      (async () => {
        try {
          return await scanCMS(
            domainDetails.hostname,
            (homepage as { html?: string }).html || '',
            (homepage as { responseHeaders: any }).responseHeaders
          );
        } catch (error) {
          console.error('CMS scanner error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // Network Tests
    const networkTests = await withTimeout(
      (async () => {
        try {
          return await performNetworkTests(domainDetails.hostname, firstIP);
        } catch (error) {
          console.error('Network tests error:', error);
          return null;
        }
      })(),
      15000,
      null
    );

    // Specialized Scanners
    const specializedScanners = await withTimeout(
      (async () => {
        try {
          const [apiScan, k8sScan, passwordAudit] = await Promise.all([
            scanAPI(domainDetails.hostname, (homepage as { html?: string }).html || ''),
            scanKubernetes(
              domainDetails.hostname,
              (homepage as { html?: string }).html || '',
              (homepage as { responseHeaders: any }).responseHeaders
            ),
            auditPasswords(domainDetails.hostname, (homepage as { html?: string }).html || ''),
          ]);
          return { apiScan, k8sScan, passwordAudit };
        } catch (error) {
          console.error('Specialized scanners error:', error);
          return null;
        }
      })(),
      10000,
      null
    );

    // Web Tools
    const webTools = await withTimeout(
      (async () => {
        try {
          return await getWebToolsResults(
            domainDetails.hostname,
            (homepage as { html?: string }).html || ''
          );
        } catch (error) {
          console.error('Web tools error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // Advanced DNSSEC Validation
    const advancedDNSSEC = await withTimeout(
      (async () => {
        try {
          return await validateDNSSEC(domainDetails.hostname);
        } catch (error) {
          console.error('Advanced DNSSEC validation error:', error);
          return null;
        }
      })(),
      10000,
      null
    );

    // Advanced TLS Analysis
    const advancedTLS = await withTimeout(
      (async () => {
        try {
          return await performAdvancedTLSAnalysis(domainDetails.hostname);
        } catch (error) {
          console.error('Advanced TLS analysis error:', error);
          return null;
        }
      })(),
      15000,
      null
    );

    // Advanced OWASP Tests
    const advancedOWASP = await withTimeout(
      (async () => {
        try {
          const apiEndpoints = isDeepScan && deepScanResults?.informationGathering?.apiEndpoints?.endpoints 
            ? deepScanResults.informationGathering.apiEndpoints.endpoints 
            : [];
          return await performAdvancedOWASPTests(
            domainDetails.hostname,
            (homepage as { html?: string }).html || '',
            apiEndpoints
          );
        } catch (error) {
          console.error('Advanced OWASP tests error:', error);
          return null;
        }
      })(),
      20000,
      null
    );

    // Core Web Vitals Analysis
    const coreWebVitals = await withTimeout(
      (async () => {
        try {
          // Use lighthouse data if available, otherwise use performance data
          const lighthouseData = null; // Would come from lighthouse analysis
          return await analyzeCoreWebVitals(
            `https://${domainDetails.hostname}`,
            lighthouseData || { metrics: {} }
          );
        } catch (error) {
          console.error('Core Web Vitals analysis error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // Real-Time Monitoring
    const realTimeMonitoring = await withTimeout(
      (async () => {
        try {
          return await monitorDomain(
            domainDetails.hostname,
            {
              securityScore,
              vulnerabilities,
              ssl: sslInfo,
            },
            {
              domain: domainDetails.hostname,
              interval: 60,
              alertThresholds: {
                securityScore: 70,
                vulnerabilityCount: 5,
                sslExpirationDays: 30,
              },
              alertChannels: ['email', 'webhook'],
            }
          );
        } catch (error) {
          console.error('Real-time monitoring error:', error);
          return null;
        }
      })(),
      3000,
      null
    );

    // Advanced Threat Intelligence
    const advancedThreatIntelligence = await withTimeout(
      (async () => {
        try {
          return await checkAdvancedThreatIntelligence(
            domainDetails.hostname,
            firstIP,
            {
              virusTotal: process.env.VIRUSTOTAL_API_KEY,
              abuseIPDB: process.env.ABUSEIPDB_API_KEY,
              alienVault: process.env.ALIENVAULT_API_KEY,
              shodan: process.env.SHODAN_API_KEY,
              censys: process.env.CENSYS_API_KEY,
            }
          );
        } catch (error) {
          console.error('Advanced threat intelligence error:', error);
          return null;
        }
      })(),
      10000,
      null
    );

    // Comprehensive Scanning
    const comprehensiveScan = await withTimeout(
      (async () => {
        try {
          return await performComprehensiveScan(
            domainDetails.hostname,
            (homepage as { html?: string }).html || '',
            (homepage as { responseHeaders: any }).responseHeaders,
            Array.isArray(cookies) ? cookies : cookiesResult.cookies || []
          );
        } catch (error) {
          console.error('Comprehensive scan error:', error);
          return null;
        }
      })(),
      15000,
      null
    );

    // Cloud Infrastructure Detection
    const cloudInfrastructure = await withTimeout(
      (async () => {
        try {
          return await detectCloudInfrastructure(
            domainDetails.hostname,
            (homepage as { responseHeaders: any }).responseHeaders,
            (homepage as { html?: string }).html || ''
          );
        } catch (error) {
          console.error('Cloud infrastructure detection error:', error);
          return null;
        }
      })(),
      8000,
      null
    );

    // GraphQL Security Testing
    const graphQLSecurity = await withTimeout(
      (async () => {
        try {
          return await testGraphQLSecurity(
            `https://${domainDetails.hostname}`,
            (homepage as { html?: string }).html || ''
          );
        } catch (error) {
          console.error('GraphQL security testing error:', error);
          return null;
        }
      })(),
      10000,
      null
    );

    // Advanced API Security
    const advancedAPISecurity = await withTimeout(
      (async () => {
        try {
          return await testAdvancedAPISecurity(
            `https://${domainDetails.hostname}`,
            (homepage as { html?: string }).html || '',
            (homepage as { responseHeaders: any }).responseHeaders
          );
        } catch (error) {
          console.error('Advanced API security error:', error);
          return null;
        }
      })(),
      8000,
      null
    );

    // Supply Chain Security
    const supplyChainSecurity = await withTimeout(
      (async () => {
        try {
          return await scanSupplyChain(
            `https://${domainDetails.hostname}`,
            (homepage as { html?: string }).html || ''
          );
        } catch (error) {
          console.error('Supply chain security error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // Container Security
    const containerSecurity = await withTimeout(
      (async () => {
        try {
          return await scanContainerSecurity(
            `https://${domainDetails.hostname}`,
            (homepage as { html?: string }).html || '',
            (homepage as { responseHeaders: any }).responseHeaders
          );
        } catch (error) {
          console.error('Container security error:', error);
          return null;
        }
      })(),
      8000,
      null
    );

    // Data Leakage Detection
    const dataLeakage = await withTimeout(
      (async () => {
        try {
          return await detectDataLeakage(
            `https://${domainDetails.hostname}`,
            (homepage as { html?: string }).html || '',
            (homepage as { responseHeaders: any }).responseHeaders
          );
        } catch (error) {
          console.error('Data leakage detection error:', error);
          return null;
        }
      })(),
      10000,
      null
    );

    // WAF Detection
    const wafDetection = await withTimeout(
      (async () => {
        try {
          return await detectWAF(
            `https://${domainDetails.hostname}`,
            (homepage as { responseHeaders: any }).responseHeaders
          );
        } catch (error) {
          console.error('WAF detection error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // Advanced Authentication Testing
    const advancedAuth = await withTimeout(
      (async () => {
        try {
          return await testAdvancedAuthentication(
            `https://${domainDetails.hostname}`,
            (homepage as { html?: string }).html || '',
            (homepage as { responseHeaders: any }).responseHeaders,
            Array.isArray(cookies) ? cookies : cookiesResult.cookies || []
          );
        } catch (error) {
          console.error('Advanced authentication testing error:', error);
          return null;
        }
      })(),
      8000,
      null
    );

    // Domain Reputation
    const domainReputation = await withTimeout(
      (async () => {
        try {
          return await analyzeDomainReputation(
            domain,
            whoisDataRaw,
            dnsRecords
          );
        } catch (error) {
          console.error('Domain reputation analysis error:', error);
          return null;
        }
      })(),
      5000,
      null
    );

    // Compliance Frameworks
    const compliance = await withTimeout(
      (async () => {
        try {
          return await assessCompliance(
            {
              ssl: sslInfo,
              vulnerabilities,
              securityHeaders,
            },
            sslInfo,
            (homepage as { responseHeaders: any }).responseHeaders,
            Array.isArray(cookies) ? cookies : cookiesResult.cookies || [],
            dnsRecords
          );
        } catch (error) {
          console.error('Compliance assessment error:', error);
          return null;
        }
      })(),
      3000,
      null
    );

    // Build response object
    const responseData: any = {
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
      cookies: cookiesResult,
      csp,
      mixedContent,
      hsts,
      emailSecurity,
      dnsAnalysis,
      techStack,
      subdomains: uniqueSubdomains,
      enhancedSubdomains: enhancedSubdomains,
      subdomainAnalysis,
      threats: {
        urlhaus: urlhausData
      },
      vulnerabilities,
      brokenLinks,
      ipServices,
      ipReputation: ipReputations[0] || null,
      emails: emailResults,
      securityScore,
      riskAssessment,
      recommendations,
      // New advanced features
      portScan,
      certificateAnalysis,
      certificateTransparency,
      headersGrading,
      phishingDetection,
      blacklistCheck,
      // Deep scanning results
      deepScan: isDeepScan ? deepScanResults : null,
      // Phase 1 & 2 features
      sslMonitoring: sslMonitoringResult,
      dnsChangeDetection: null, // Will be populated if previous records exist
      compliance: complianceResult,
      uptimeMonitoring: uptimeStats,
      // Enhanced features
      lighthouse: null, // Lighthouse disabled due to Next.js compatibility - use external service
      penetrationTesting: penetrationTestingResult,
      threatIntelligence: threatIntelligenceResult,
      brandMonitoring: brandMonitoringResult,
      anomalyDetection: null, // Will be populated if historical data exists
      apiSecurity: apiSecurityResult,
      executiveReport: null, // Will be generated after all data is collected
      // New comprehensive security checks
      dnsSecurity,
      tlsDeepAnalysis,
      webAppSecurity,
      privacyCompliance,
      apiSecurityTesting,
      mobileAppSecurity,
        // Additional specialized scanners
        cmsScanner,
        networkTests,
        specializedScanners,
        webTools,
        // Advanced comprehensive features
        advancedDNSSEC,
        advancedTLS,
        advancedOWASP,
        coreWebVitals,
        realTimeMonitoring,
        // Enhanced features
              enhancedExecutiveReport: null, // Will be generated after all data is collected
              advancedThreatIntelligence,
              // Comprehensive scanning
              comprehensiveScan,
              // New comprehensive security features
              cloudInfrastructure,
              graphQLSecurity,
              advancedAPISecurity,
              supplyChainSecurity,
              containerSecurity,
              dataLeakage,
              wafDetection,
              advancedAuth,
              domainReputation,
              compliance,
            };

    // Store historical record
    storeHistoricalRecord({
      domain: domainDetails.hostname,
      timestamp: new Date(),
      securityScore,
      riskLevel: riskAssessment?.riskLevel,
      vulnerabilities: vulnerabilities.length,
      sslValid: sslInfo?.valid,
      sslExpiration: sslInfo?.validTo ? new Date(sslInfo.validTo) : undefined,
      dnsRecords: dnsRecords,
      whoisData: whoisDataRaw,
      performance: isDeepScan ? (deepScanResults?.performance || null) : null,
      compliance: complianceResult,
    });

    // Update domain status for multi-domain monitoring
    updateDomainStatus({
      domain: domainDetails.hostname,
      lastScan: new Date(),
      securityScore: securityScore || 0,
      riskLevel: (riskAssessment?.riskLevel || 'low') as 'low' | 'medium' | 'high' | 'critical',
      status: securityScore >= 80 ? 'healthy' : securityScore >= 60 ? 'warning' : 'critical',
      uptime: uptimeStats.uptimePercentage || 0,
      vulnerabilities: vulnerabilities.length,
      alerts: 0,
    });

    // Generate executive report
    const executiveReport = generateExecutiveReport(domainDetails.hostname, {
      securityScore,
      riskAssessment,
      compliance: complianceResult,
      performance: isDeepScan ? (deepScanResults?.performance || null) : null,
      uptimeMonitoring: uptimeStats,
      vulnerabilities,
      recommendations,
    });

    // Generate enhanced executive report
    const enhancedExecutiveReport = generateEnhancedExecutiveReport(
      domainDetails.hostname,
      {
        securityScore,
        riskAssessment,
        ssl: sslInfo,
        security: { headers: securityHeaders },
        cookies: cookiesResult,
        vulnerabilities,
        coreWebVitals,
        compliance: complianceResult,
        recommendations,
      }
    );

    // Add executive reports and calculated values to response
    const finalResponse = {
      ...responseData,
      executiveReport,
      enhancedExecutiveReport,
      advancedThreatIntelligence: advancedThreatIntelligence || null,
      comprehensiveScan: comprehensiveScan || null,
      cloudInfrastructure: cloudInfrastructure || null,
      graphQLSecurity: graphQLSecurity || null,
      advancedAPISecurity: advancedAPISecurity || null,
      supplyChainSecurity: supplyChainSecurity || null,
      containerSecurity: containerSecurity || null,
      dataLeakage: dataLeakage || null,
      wafDetection: wafDetection || null,
      advancedAuth: advancedAuth || null,
      domainReputation: domainReputation || null,
      compliance: compliance || null,
      uptimeMonitoring: uptimeStats,
    };

    return NextResponse.json(finalResponse);
    
  } catch (error: unknown) {
    console.error('Domain API error:', error, (error as any)?.stack);
    const errorMessage = (error as any).message || 'Failed to fetch domain data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}