import fetch from 'node-fetch';

/**
 * Comprehensive subdomain enumeration
 */
export async function enumerateSubdomains(domain: string): Promise<string[]> {
  const subdomains = new Set<string>();
  
  // Multiple enumeration methods
  const methods = [
    () => enumerateFromCrtSh(domain),
    () => enumerateFromSecurityTrails(domain),
    () => enumerateFromVirusTotal(domain),
    () => enumerateFromDNSDumpster(domain),
  ];

  // Run all methods in parallel
  const results = await Promise.allSettled(
    methods.map(method => method())
  );

  // Collect all subdomains
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      result.value.forEach(subdomain => subdomains.add(subdomain));
    }
  });

  return Array.from(subdomains).sort();
}

/**
 * Enumerate subdomains from crt.sh (Certificate Transparency)
 */
async function enumerateFromCrtSh(domain: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://crt.sh/?q=%.${domain}&output=json`,
      { timeout: 5000 } as any
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const subdomains = new Set<string>();
    
    if (Array.isArray(data)) {
      data.forEach((entry: any) => {
        if (entry.name_value) {
          entry.name_value.split('\n').forEach((name: string) => {
            const cleanName = name.trim().replace('*.', '');
            if (cleanName.endsWith(domain) && cleanName !== domain) {
              subdomains.add(cleanName);
            }
          });
        }
      });
    }
    
    return Array.from(subdomains);
  } catch {
    return [];
  }
}

/**
 * Enumerate subdomains from SecurityTrails (if API key available)
 */
async function enumerateFromSecurityTrails(domain: string): Promise<string[]> {
  // This would require SecurityTrails API key
  // For now, return empty array
  return [];
}

/**
 * Enumerate subdomains from VirusTotal (if API key available)
 */
async function enumerateFromVirusTotal(domain: string): Promise<string[]> {
  // This would require VirusTotal API key
  // For now, return empty array
  return [];
}

/**
 * Enumerate subdomains from DNSDumpster
 */
async function enumerateFromDNSDumpster(domain: string): Promise<string[]> {
  try {
    // DNSDumpster requires CSRF token, so this is simplified
    // In production, you'd need to handle the CSRF token
    return [];
  } catch {
    return [];
  }
}

/**
 * Brute force subdomain enumeration (common subdomains)
 */
export async function bruteForceSubdomains(domain: string): Promise<string[]> {
  const commonSubdomains = [
    'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk',
    'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'm', 'imap', 'test',
    'ns', 'blog', 'pop3', 'dev', 'www2', 'admin', 'forum', 'news', 'vpn',
    'ns3', 'mail2', 'new', 'mysql', 'old', 'lists', 'support', 'mobile', 'mx',
    'static', 'docs', 'beta', 'shop', 'sql', 'secure', 'demo', 'cp', 'calendar',
    'wiki', 'web', 'media', 'email', 'images', 'img', 'www1', 'intranet', 'portal',
    'video', 'sip', 'dns2', 'api', 'cdn', 'stats', 'dns1', 'ns4', 'www3',
    'dns', 'search', 'staging', 'server', 'mx1', 'chat', 'wap', 'my', 'svn',
    'mail1', 'sites', 'proxy', 'ads', 'online', 'ads', 'www4', 'ns5', 'jabber',
    'crm', 'cms', 'backup', 'mx2', 'lyncdiscover', 'info', 'apps', 'download',
    'remote', 'db', 'forums', 'store', 'relay', 'files', 'news', 'vpn', 'ns6',
    'live', 'owa', 'en', 'start', 'sms', 'office', 'exchange', 'ipv4', 'api2',
  ];

  const foundSubdomains: string[] = [];
  
  // Check subdomains in batches
  const batchSize = 10;
  for (let i = 0; i < commonSubdomains.length; i += batchSize) {
    const batch = commonSubdomains.slice(i, i + batchSize);
    const checkPromises = batch.map(async (subdomain) => {
      try {
        const fullDomain = `${subdomain}.${domain}`;
        const response = await fetch(`https://${fullDomain}`, {
          method: 'HEAD',
          timeout: 2000,
        } as any);
        
        if (response.ok) {
          return fullDomain;
        }
      } catch {
        // Subdomain doesn't exist or is not accessible
      }
      return null;
    });

    const results = await Promise.all(checkPromises);
    results.forEach(result => {
      if (result) foundSubdomains.push(result);
    });
  }

  return foundSubdomains;
}

/**
 * Get subdomain analysis
 */
export function analyzeSubdomains(subdomains: string[], domain: string) {
  const analysis = {
    total: subdomains.length,
    subdomains: subdomains.map(sub => ({
      subdomain: sub,
      type: classifySubdomain(sub, domain),
    })),
    categories: {
      www: subdomains.filter(s => s.startsWith('www.')).length,
      mail: subdomains.filter(s => s.includes('mail')).length,
      api: subdomains.filter(s => s.includes('api')).length,
      admin: subdomains.filter(s => s.includes('admin')).length,
      test: subdomains.filter(s => s.includes('test') || s.includes('dev') || s.includes('staging')).length,
      other: 0,
    },
    riskLevel: calculateSubdomainRisk(subdomains),
    recommendations: generateSubdomainRecommendations(subdomains),
  };

  analysis.categories.other = analysis.total - 
    Object.values(analysis.categories).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);

  return analysis;
}

function classifySubdomain(subdomain: string, domain: string): string {
  const sub = subdomain.replace(`.${domain}`, '').toLowerCase();
  
  if (sub.includes('www')) return 'www';
  if (sub.includes('mail') || sub.includes('smtp') || sub.includes('imap')) return 'mail';
  if (sub.includes('api')) return 'api';
  if (sub.includes('admin') || sub.includes('cpanel') || sub.includes('whm')) return 'admin';
  if (sub.includes('test') || sub.includes('dev') || sub.includes('staging')) return 'development';
  if (sub.includes('ftp') || sub.includes('sftp')) return 'file-transfer';
  if (sub.includes('db') || sub.includes('mysql') || sub.includes('sql')) return 'database';
  
  return 'other';
}

function calculateSubdomainRisk(subdomains: string[]): 'low' | 'medium' | 'high' {
  const riskySubdomains = subdomains.filter(s => 
    s.includes('admin') || 
    s.includes('test') || 
    s.includes('dev') || 
    s.includes('staging') ||
    s.includes('backup')
  );

  if (riskySubdomains.length > 5) return 'high';
  if (riskySubdomains.length > 2) return 'medium';
  return 'low';
}

function generateSubdomainRecommendations(subdomains: string[]): string[] {
  const recommendations: string[] = [];
  
  const adminSubdomains = subdomains.filter(s => s.includes('admin'));
  if (adminSubdomains.length > 0) {
    recommendations.push('Admin subdomains found - ensure they are properly secured');
  }

  const testSubdomains = subdomains.filter(s => 
    s.includes('test') || s.includes('dev') || s.includes('staging')
  );
  if (testSubdomains.length > 0) {
    recommendations.push('Test/development subdomains found - consider removing from production DNS');
  }

  if (subdomains.length > 50) {
    recommendations.push('Large number of subdomains detected - review and remove unused subdomains');
  }

  return recommendations;
}

