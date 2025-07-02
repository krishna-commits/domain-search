import { parse } from 'tldts';
import dns from 'dns/promises';

// Parse domain details
export const parseDomainDetails = (domain: string) => {
  const result = parse(domain);
  
  return {
    domain: result.domain || domain,
    subdomain: result.subdomain || '',
    publicSuffix: result.publicSuffix || '',
    topLevelDomain: result.publicSuffix || '',
    isIcann: result.isIcann,
    isPrivate: result.isPrivate,
    hostname: result.hostname || domain
  };
};

// Extract hostnames from URLs
export const extractHostnames = (urls: string[]) => {
  return urls.map(url => {
    try {
      const { hostname } = new URL(url);
      return hostname;
    } catch {
      return null;
    }
  }).filter(Boolean) as string[];
};

// DNSSEC validation
export const checkDNSSEC = async (domain: string) => {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['1.1.1.1']); // Use Cloudflare DNS
    
    const result = await resolver.resolve(domain, 'DNSKEY');
    return {
      enabled: true,
      keys: result
    };
  } catch (error) {
    return {
      enabled: false,
      error: 'DNSSEC not configured'
    };
  }
};