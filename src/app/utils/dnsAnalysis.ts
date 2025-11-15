import dns from 'dns/promises';
import fetch from 'node-fetch';

// DNS response time metrics
export const measureDNSResponseTime = async (domain: string, type: string = 'A') => {
  const start = Date.now();
  try {
    await dns.resolve(domain, type);
    const time = Date.now() - start;
    return { success: true, time, error: null };
  } catch (error: any) {
    const time = Date.now() - start;
    return { success: false, time, error: error.message };
  }
};

// DNS propagation checker - check from multiple resolvers
export const checkDNSPropagation = async (domain: string, type: string = 'A') => {
  const resolvers = [
    { name: 'Google', server: '8.8.8.8' },
    { name: 'Cloudflare', server: '1.1.1.1' },
    { name: 'Quad9', server: '9.9.9.9' },
    { name: 'OpenDNS', server: '208.67.222.222' }
  ];

  const results: any[] = [];
  const originalServers = dns.getServers();

  for (const resolver of resolvers) {
    try {
      dns.setServers([resolver.server]);
      const start = Date.now();
      const records = await dns.resolve(domain, type);
      const time = Date.now() - start;
      results.push({
        resolver: resolver.name,
        server: resolver.server,
        success: true,
        records: Array.isArray(records) ? records : [records],
        time,
        error: null
      });
    } catch (error: any) {
      results.push({
        resolver: resolver.name,
        server: resolver.server,
        success: false,
        records: [],
        time: 0,
        error: error.message
      });
    }
  }

  dns.setServers(originalServers);
  return results;
};

// DNS over HTTPS (DoH) support
export const queryDNSOverHTTPS = async (domain: string, type: string = 'A') => {
  const typeMap: Record<string, number> = {
    'A': 1, 'AAAA': 28, 'MX': 15, 'TXT': 16, 'NS': 2, 'CNAME': 5, 'SOA': 6
  };
  const typeNum = typeMap[type.toUpperCase()] || 1;

  const providers = [
    { name: 'Google', url: `https://dns.google/resolve?name=${domain}&type=${typeNum}` },
    { name: 'Cloudflare', url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=${typeNum}` }
  ];

  const results: any[] = [];

  for (const provider of providers) {
    try {
      const start = Date.now();
      const response = await fetch(provider.url, {
        headers: { 'Accept': 'application/dns-json' }
      });
      const time = Date.now() - start;
      const data = await response.json();
      
      if (data.Answer) {
        results.push({
          provider: provider.name,
          success: true,
          records: data.Answer.map((ans: any) => ans.data),
          time,
          error: null
        });
      } else {
        results.push({
          provider: provider.name,
          success: false,
          records: [],
          time,
          error: 'No answer in response'
        });
      }
    } catch (error: any) {
      results.push({
        provider: provider.name,
        success: false,
        records: [],
        time: 0,
        error: error.message
      });
    }
  }

  return results;
};

// DNS cache poisoning detection (simplified - checks for inconsistent responses)
export const detectDNSCachePoisoning = async (domain: string, type: string = 'A') => {
  const propagationResults = await checkDNSPropagation(domain, type);
  
  // Extract unique record sets
  const recordSets = new Set<string>();
  propagationResults.forEach(result => {
    if (result.success && result.records.length > 0) {
      const sortedRecords = [...result.records].sort().join(',');
      recordSets.add(sortedRecords);
    }
  });

  // If we have multiple different record sets, it might indicate cache poisoning
  const suspicious = recordSets.size > 1;
  const consistency = recordSets.size === 1 ? 100 : Math.max(0, 100 - (recordSets.size - 1) * 25);

  return {
    suspicious,
    consistency,
    recordSets: Array.from(recordSets),
    results: propagationResults
  };
};

// Comprehensive DNS analysis
export const comprehensiveDNSAnalysis = async (domain: string) => {
  const [responseTime, propagation, dohResults, cachePoisoning] = await Promise.all([
    measureDNSResponseTime(domain, 'A'),
    checkDNSPropagation(domain, 'A'),
    queryDNSOverHTTPS(domain, 'A'),
    detectDNSCachePoisoning(domain, 'A')
  ]);

  return {
    responseTime,
    propagation,
    dnsOverHTTPS: dohResults,
    cachePoisoning,
    score: calculateDNSScore(responseTime, propagation, cachePoisoning)
  };
};

// Calculate DNS health score
const calculateDNSScore = (responseTime: any, propagation: any[], cachePoisoning: any) => {
  let score = 100;

  // Response time penalty
  if (responseTime.time > 1000) score -= 20;
  else if (responseTime.time > 500) score -= 10;

  // Propagation consistency penalty
  const successCount = propagation.filter(r => r.success).length;
  if (successCount < propagation.length) score -= (propagation.length - successCount) * 10;

  // Cache poisoning penalty
  if (cachePoisoning.suspicious) score -= 30;

  return Math.max(0, Math.min(100, score));
};

