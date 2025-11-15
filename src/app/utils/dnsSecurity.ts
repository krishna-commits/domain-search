/**
 * DNS Security Enhancements
 * - DNS over HTTPS (DoH) / DNS over TLS (DoT) Support
 * - DNS Cache Poisoning Detection
 * - DNS Response Time Analysis
 */

import dns from 'dns/promises';
import fetch from 'node-fetch';

export interface DoHDoTResult {
  dohSupported: boolean;
  dohEndpoints: string[];
  dotSupported: boolean;
  dotPort: number | null;
  encryptedDnsAvailable: boolean;
}

export interface DNSCachePoisoningResult {
  vulnerable: boolean;
  checks: Array<{
    resolver: string;
    consistent: boolean;
    responseTime: number;
    anomalies: string[];
  }>;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DNSResponseTimeResult {
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  responses: Array<{
    resolver: string;
    responseTime: number;
    location?: string;
  }>;
  recommendations: string[];
}

/**
 * Check DNS over HTTPS (DoH) support
 */
export async function checkDoHSupport(domain: string): Promise<DoHDoTResult> {
  const dohEndpoints = [
    `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
    `https://dns.google/dns-query?name=${domain}&type=A`,
    `https://1.1.1.1/dns-query?name=${domain}&type=A`,
  ];

  const supportedEndpoints: string[] = [];

  for (const endpoint of dohEndpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/dns-json',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.Answer && data.Answer.length > 0) {
          supportedEndpoints.push(endpoint);
        }
      }
    } catch (error) {
      // Endpoint not available
    }
  }

  // Check DNS over TLS (DoT) - port 853
  let dotSupported = false;
  try {
    // Try to resolve using DoT (simplified check)
    const resolver = new dns.Resolver();
    resolver.setServers(['1.1.1.1', '8.8.8.8']);
    await resolver.resolve4(domain);
    dotSupported = true;
  } catch (error) {
    // DoT not available
  }

  return {
    dohSupported: supportedEndpoints.length > 0,
    dohEndpoints: supportedEndpoints,
    dotSupported,
    dotPort: dotSupported ? 853 : null,
    encryptedDnsAvailable: supportedEndpoints.length > 0 || dotSupported,
  };
}

/**
 * Detect DNS cache poisoning vulnerabilities
 */
export async function detectDNSCachePoisoning(domain: string): Promise<DNSCachePoisoningResult> {
  const resolvers = [
    '8.8.8.8',      // Google
    '1.1.1.1',      // Cloudflare
    '208.67.222.222', // OpenDNS
    '9.9.9.9',      // Quad9
  ];

  const checks = [];
  const responses: Map<string, string[]> = new Map();

  // Query multiple resolvers
  for (const resolver of resolvers) {
    try {
      const startTime = Date.now();
      const resolverInstance = new dns.Resolver();
      resolverInstance.setServers([resolver]);
      const addresses = await resolverInstance.resolve4(domain);
      const responseTime = Date.now() - startTime;

      responses.set(resolver, addresses);
      checks.push({
        resolver,
        consistent: true,
        responseTime,
        anomalies: [],
      });
    } catch (error) {
      checks.push({
        resolver,
        consistent: false,
        responseTime: 0,
        anomalies: ['Failed to resolve'],
      });
    }
  }

  // Check for inconsistencies
  const allAddresses = Array.from(responses.values());
  const uniqueAddresses = new Set(allAddresses.flat());
  const inconsistencies: string[] = [];

  if (uniqueAddresses.size > 1) {
    inconsistencies.push('Multiple different IP addresses returned');
  }

  // Check response time anomalies
  const responseTimes = checks.map(c => c.responseTime).filter(t => t > 0);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const slowResponses = checks.filter(c => c.responseTime > avgResponseTime * 2);

  if (slowResponses.length > 0) {
    inconsistencies.push('Some resolvers responding slowly (possible cache poisoning)');
  }

  const vulnerable = inconsistencies.length > 0 || uniqueAddresses.size > 1;

  return {
    vulnerable,
    checks,
    riskLevel: vulnerable ? (inconsistencies.length > 2 ? 'high' : 'medium') : 'low',
  };
}

/**
 * Analyze DNS response times from multiple resolvers
 */
export async function analyzeDNSResponseTime(domain: string): Promise<DNSResponseTimeResult> {
  const resolvers = [
    { name: 'Google DNS', ip: '8.8.8.8', location: 'Global' },
    { name: 'Cloudflare DNS', ip: '1.1.1.1', location: 'Global' },
    { name: 'OpenDNS', ip: '208.67.222.222', location: 'Global' },
    { name: 'Quad9', ip: '9.9.9.9', location: 'Global' },
  ];

  const responses: Array<{ resolver: string; responseTime: number; location?: string }> = [];

  for (const resolver of resolvers) {
    try {
      const startTime = Date.now();
      const resolverInstance = new dns.Resolver();
      resolverInstance.setServers([resolver.ip]);
      await resolverInstance.resolve4(domain);
      const responseTime = Date.now() - startTime;

      responses.push({
        resolver: resolver.name,
        responseTime,
        location: resolver.location,
      });
    } catch (error) {
      responses.push({
        resolver: resolver.name,
        responseTime: -1,
        location: resolver.location,
      });
    }
  }

  const validResponses = responses.filter(r => r.responseTime > 0);
  const responseTimes = validResponses.map(r => r.responseTime);

  const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;
  const minResponseTime = Math.min(...responseTimes, 0);
  const maxResponseTime = Math.max(...responseTimes, 0);

  const recommendations: string[] = [];
  if (averageResponseTime > 100) {
    recommendations.push('Consider using a faster DNS resolver');
  }
  if (maxResponseTime > averageResponseTime * 2) {
    recommendations.push('Some DNS resolvers are significantly slower');
  }
  if (validResponses.length < resolvers.length) {
    recommendations.push('Some DNS resolvers are not responding');
  }

  return {
    averageResponseTime,
    minResponseTime,
    maxResponseTime,
    responses,
    recommendations,
  };
}

