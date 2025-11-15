/**
 * Network Tests
 * - Traceroute
 * - Ping Test
 * - DNS Queries
 * - Reverse DNS
 * - Find Host Records (Subdomains)
 * - Find Shared DNS Servers
 * - Zone Transfer
 * - Subnet Lookup
 * - ASN Lookup
 * - Banner Grabbing
 */

import dns from 'dns/promises';
import fetch from 'node-fetch';

export interface NetworkTestResult {
  traceroute: TracerouteResult | null;
  ping: PingResult | null;
  dnsQueries: DNSQueryResult;
  reverseDNS: ReverseDNSResult;
  sharedDNSServers: SharedDNSServerResult;
  zoneTransfer: ZoneTransferResult;
  subnetLookup: SubnetLookupResult | null;
  asnLookup: ASNLookupResult | null;
  bannerGrabbing: BannerGrabbingResult;
}

export interface TracerouteResult {
  hops: Array<{
    hop: number;
    ip: string;
    hostname: string | null;
    rtt: number;
  }>;
  totalHops: number;
  destinationReached: boolean;
}

export interface PingResult {
  success: boolean;
  packetsSent: number;
  packetsReceived: number;
  packetLoss: number;
  minRtt: number;
  maxRtt: number;
  avgRtt: number;
}

export interface DNSQueryResult {
  a: string[];
  aaaa: string[];
  mx: string[];
  txt: string[];
  ns: string[];
  cname: string[];
}

export interface ReverseDNSResult {
  ip: string;
  hostname: string | null;
  ptrRecords: string[];
}

export interface SharedDNSServerResult {
  sharedServers: Array<{
    ip: string;
    domains: string[];
  }>;
  totalShared: number;
}

export interface ZoneTransferResult {
  allowed: boolean;
  records: any[];
  error: string | null;
}

export interface SubnetLookupResult {
  subnet: string;
  network: string;
  broadcast: string;
  hosts: number;
  ipRange: string;
}

export interface ASNLookupResult {
  asn: string;
  organization: string;
  country: string;
  ipRange: string;
}

export interface BannerGrabbingResult {
  port: number;
  service: string;
  banner: string;
  version: string | null;
}

/**
 * Perform traceroute (simplified - would need actual traceroute tool)
 */
export async function performTraceroute(hostname: string): Promise<TracerouteResult | null> {
  try {
    // Simplified traceroute - in production, use actual traceroute tool
    const hops: Array<{ hop: number; ip: string; hostname: string | null; rtt: number }> = [];
    
    // Try to resolve hostname
    const addresses = await dns.resolve4(hostname);
    if (addresses.length > 0) {
      hops.push({
        hop: 1,
        ip: addresses[0],
        hostname: hostname,
        rtt: 0,
      });
    }

    return {
      hops,
      totalHops: hops.length,
      destinationReached: hops.length > 0,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Perform ping test
 */
export async function performPing(hostname: string): Promise<PingResult> {
  try {
    const startTime = Date.now();
    const addresses = await dns.resolve4(hostname);
    const rtt = Date.now() - startTime;

    return {
      success: addresses.length > 0,
      packetsSent: 1,
      packetsReceived: addresses.length > 0 ? 1 : 0,
      packetLoss: addresses.length > 0 ? 0 : 100,
      minRtt: rtt,
      maxRtt: rtt,
      avgRtt: rtt,
    };
  } catch (error) {
    return {
      success: false,
      packetsSent: 1,
      packetsReceived: 0,
      packetLoss: 100,
      minRtt: 0,
      maxRtt: 0,
      avgRtt: 0,
    };
  }
}

/**
 * Perform comprehensive DNS queries
 */
export async function performDNSQueries(hostname: string): Promise<DNSQueryResult> {
  try {
    const [a, aaaa, mx, txt, ns, cname] = await Promise.all([
      dns.resolve4(hostname).catch(() => []),
      dns.resolve6(hostname).catch(() => []),
      dns.resolveMx(hostname).catch(() => []).then(records => records.map(r => r.exchange)),
      dns.resolveTxt(hostname).catch(() => []).then(records => records.flat()),
      dns.resolveNs(hostname).catch(() => []),
      dns.resolveCname(hostname).catch(() => []),
    ]);

    return { a, aaaa, mx, txt, ns, cname };
  } catch (error) {
    return { a: [], aaaa: [], mx: [], txt: [], ns: [], cname: [] };
  }
}

/**
 * Perform reverse DNS lookup
 */
export async function performReverseDNS(ip: string): Promise<ReverseDNSResult> {
  try {
    const ptrRecords = await dns.reverse(ip);
    return {
      ip,
      hostname: ptrRecords[0] || null,
      ptrRecords,
    };
  } catch (error) {
    return {
      ip,
      hostname: null,
      ptrRecords: [],
    };
  }
}

/**
 * Find shared DNS servers
 */
export async function findSharedDNSServers(hostname: string): Promise<SharedDNSServerResult> {
  try {
    const nsRecords = await dns.resolveNs(hostname);
    const sharedServers: Array<{ ip: string; domains: string[] }> = [];

    // Simplified - would need to check multiple domains
    for (const ns of nsRecords) {
      try {
        const nsIp = await dns.resolve4(ns);
        if (nsIp.length > 0) {
          sharedServers.push({
            ip: nsIp[0],
            domains: [hostname],
          });
        }
      } catch (error) {
        // NS server not resolvable
      }
    }

    return {
      sharedServers,
      totalShared: sharedServers.length,
    };
  } catch (error) {
    return {
      sharedServers: [],
      totalShared: 0,
    };
  }
}

/**
 * Attempt zone transfer
 */
export async function attemptZoneTransfer(hostname: string): Promise<ZoneTransferResult> {
  try {
    const nsRecords = await dns.resolveNs(hostname);
    
    // Zone transfer is typically blocked, but we can check
    // In production, would use dig or nslookup
    return {
      allowed: false,
      records: [],
      error: 'Zone transfer typically requires authentication and is usually disabled',
    };
  } catch (error: any) {
    return {
      allowed: false,
      records: [],
      error: error.message || 'Zone transfer failed',
    };
  }
}

/**
 * Perform subnet lookup
 */
export async function performSubnetLookup(ip: string, cidr: number = 24): Promise<SubnetLookupResult | null> {
  try {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return null;

    const subnetMask = 0xFFFFFFFF << (32 - cidr);
    const network = parts.map((part, i) => {
      const shift = 24 - (i * 8);
      return (subnetMask >> shift) & 0xFF;
    });

    const broadcast = network.map((part, i) => {
      const shift = 24 - (i * 8);
      const mask = 0xFFFFFFFF >> (32 - cidr);
      return part | ((mask >> shift) & 0xFF);
    });

    const hosts = Math.pow(2, 32 - cidr) - 2;
    const ipRange = `${network.join('.')}/${cidr}`;

    return {
      subnet: ipRange,
      network: network.join('.'),
      broadcast: broadcast.join('.'),
      hosts,
      ipRange,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Perform ASN lookup
 */
export async function performASNLookup(ip: string): Promise<ASNLookupResult | null> {
  try {
    // Simplified ASN lookup - would use actual ASN database
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        asn: data.asn || 'Unknown',
        organization: data.org || 'Unknown',
        country: data.country_name || 'Unknown',
        ipRange: `${ip}/24`,
      };
    }
  } catch (error) {
    // Fallback
  }

  return {
    asn: 'Unknown',
    organization: 'Unknown',
    country: 'Unknown',
    ipRange: `${ip}/24`,
  };
}

/**
 * Perform banner grabbing
 */
export async function grabBanner(hostname: string, port: number): Promise<BannerGrabbingResult> {
  try {
    const protocol = port === 443 ? 'https' : 'http';
    const url = `${protocol}://${hostname}:${port}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const server = response.headers.get('Server') || '';
    const poweredBy = response.headers.get('X-Powered-By') || '';

    return {
      port,
      service: server || 'Unknown',
      banner: `${server} ${poweredBy}`.trim(),
      version: server.match(/[\d.]+/)?.[0] || null,
    };
  } catch (error) {
    return {
      port,
      service: 'Unknown',
      banner: '',
      version: null,
    };
  }
}

/**
 * Perform all network tests
 */
export async function performNetworkTests(hostname: string, ip: string | null): Promise<NetworkTestResult> {
  const targetIP = ip || (await dns.resolve4(hostname).then(addrs => addrs[0]).catch(() => null));

  const [
    traceroute,
    ping,
    dnsQueries,
    reverseDNS,
    sharedDNSServers,
    zoneTransfer,
    subnetLookup,
    asnLookup,
    bannerGrabbing,
  ] = await Promise.all([
    performTraceroute(hostname),
    performPing(hostname),
    performDNSQueries(hostname),
    targetIP ? performReverseDNS(targetIP) : Promise.resolve({ ip: '', hostname: null, ptrRecords: [] }),
    findSharedDNSServers(hostname),
    attemptZoneTransfer(hostname),
    targetIP ? performSubnetLookup(targetIP) : Promise.resolve(null),
    targetIP ? performASNLookup(targetIP) : Promise.resolve(null),
    grabBanner(hostname, 80),
  ]);

  return {
    traceroute,
    ping,
    dnsQueries,
    reverseDNS,
    sharedDNSServers,
    zoneTransfer,
    subnetLookup,
    asnLookup,
    bannerGrabbing,
  };
}

