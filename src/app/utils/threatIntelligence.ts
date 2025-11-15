/**
 * Threat Intelligence Integration
 */
import fetch from 'node-fetch';

export interface ThreatFeedResult {
  source: string;
  found: boolean;
  threatType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  lastSeen?: Date;
}

export interface ThreatIntelligenceResult {
  domain: string;
  ip?: string;
  timestamp: Date;
  threats: ThreatFeedResult[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  threatScore: number;
}

/**
 * Check multiple threat intelligence feeds
 */
export async function checkThreatIntelligence(
  domain: string,
  ip?: string,
  apiKeys?: {
    virusTotal?: string;
    abuseIPDB?: string;
    alienVault?: string;
  }
): Promise<ThreatIntelligenceResult> {
  const threats: ThreatFeedResult[] = [];

  // Check VirusTotal
  if (apiKeys?.virusTotal) {
    const vtResult = await checkVirusTotal(domain, ip, apiKeys.virusTotal);
    if (vtResult) threats.push(vtResult);
  }

  // Check AbuseIPDB
  if (apiKeys?.abuseIPDB && ip) {
    const abuseResult = await checkAbuseIPDB(ip, apiKeys.abuseIPDB);
    if (abuseResult) threats.push(abuseResult);
  }

  // Check AlienVault OTX
  if (apiKeys?.alienVault) {
    const otxResult = await checkAlienVaultOTX(domain, ip, apiKeys.alienVault);
    if (otxResult) threats.push(otxResult);
  }

  // Check URLhaus
  const urlhausResult = await checkURLhaus(domain);
  if (urlhausResult) threats.push(urlhausResult);

  // Check PhishTank
  const phishtankResult = await checkPhishTank(domain);
  if (phishtankResult) threats.push(phishtankResult);

  // Check Malware Domain List
  const malwareResult = await checkMalwareDomainList(domain);
  if (malwareResult) threats.push(malwareResult);

  // Calculate overall risk
  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const highThreats = threats.filter(t => t.severity === 'high').length;
  const mediumThreats = threats.filter(t => t.severity === 'medium').length;

  let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (criticalThreats > 0) overallRisk = 'critical';
  else if (highThreats > 0) overallRisk = 'high';
  else if (mediumThreats > 0 || threats.length > 2) overallRisk = 'medium';

  // Calculate threat score (0-100, lower is better)
  const threatScore = Math.max(0, 100 - (criticalThreats * 30 + highThreats * 20 + mediumThreats * 10 + threats.length * 5));

  return {
    domain,
    ip,
    timestamp: new Date(),
    threats,
    overallRisk,
    threatScore,
  };
}

/**
 * Check VirusTotal
 */
async function checkVirusTotal(domain: string, ip: string | undefined, apiKey: string): Promise<ThreatFeedResult | null> {
  try {
    const url = ip ? `https://www.virustotal.com/api/v3/ip_addresses/${ip}` : `https://www.virustotal.com/api/v3/domains/${domain}`;
    const response = await fetch(url, {
      headers: {
        'x-apikey': apiKey,
      },
      timeout: 5000,
    } as any);

    if (!response.ok) return null;

    const data = await response.json();
    const stats = data.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;

    if (malicious > 0 || suspicious > 0) {
      return {
        source: 'VirusTotal',
        found: true,
        threatType: malicious > 0 ? 'malicious' : 'suspicious',
        severity: malicious > 5 ? 'critical' : malicious > 0 ? 'high' : 'medium',
        description: `${malicious} malicious, ${suspicious} suspicious detections`,
      };
    }

    return {
      source: 'VirusTotal',
      found: false,
    };
  } catch {
    return null;
  }
}

/**
 * Check AbuseIPDB
 */
async function checkAbuseIPDB(ip: string, apiKey: string): Promise<ThreatFeedResult | null> {
  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check`, {
      method: 'POST',
      headers: {
        'Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `ipAddress=${ip}&maxAgeInDays=90&verbose`,
      timeout: 5000,
    } as any);

    if (!response.ok) return null;

    const data = await response.json();
    const abuseConfidence = data.data?.abuseConfidencePercentage || 0;

    if (abuseConfidence > 0) {
      return {
        source: 'AbuseIPDB',
        found: true,
        threatType: 'abuse',
        severity: abuseConfidence > 75 ? 'critical' : abuseConfidence > 50 ? 'high' : 'medium',
        description: `Abuse confidence: ${abuseConfidence}%`,
      };
    }

    return {
      source: 'AbuseIPDB',
      found: false,
    };
  } catch {
    return null;
  }
}

/**
 * Check AlienVault OTX
 */
async function checkAlienVaultOTX(domain: string, ip: string | undefined, apiKey: string): Promise<ThreatFeedResult | null> {
  try {
    const url = ip 
      ? `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`
      : `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/general`;
    
    const response = await fetch(url, {
      headers: {
        'X-OTX-API-KEY': apiKey,
      },
      timeout: 5000,
    } as any);

    if (!response.ok) return null;

    const data = await response.json();
    const pulseCount = data.pulse_info?.count || 0;

    if (pulseCount > 0) {
      return {
        source: 'AlienVault OTX',
        found: true,
        threatType: 'threat',
        severity: pulseCount > 10 ? 'critical' : pulseCount > 5 ? 'high' : 'medium',
        description: `Found in ${pulseCount} threat pulses`,
      };
    }

    return {
      source: 'AlienVault OTX',
      found: false,
    };
  } catch {
    return null;
  }
}

/**
 * Check URLhaus
 */
async function checkURLhaus(domain: string): Promise<ThreatFeedResult | null> {
  try {
    const response = await fetch(`https://urlhaus-api.abuse.ch/v1/host/${domain}`, {
      timeout: 5000,
    } as any);

    if (!response.ok) return null;

    const data = await response.json();
    const urlCount = data.url_count || 0;

    if (urlCount > 0) {
      return {
        source: 'URLhaus',
        found: true,
        threatType: 'malware',
        severity: urlCount > 10 ? 'critical' : urlCount > 5 ? 'high' : 'medium',
        description: `${urlCount} malicious URLs found`,
      };
    }

    return {
      source: 'URLhaus',
      found: false,
    };
  } catch {
    return null;
  }
}

/**
 * Check PhishTank
 */
async function checkPhishTank(domain: string): Promise<ThreatFeedResult | null> {
  try {
    const response = await fetch(`https://checkurl.phishtank.com/checkurl/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=https://${domain}&format=json`,
      timeout: 5000,
    } as any);

    if (!response.ok) return null;

    const data = await response.json();
    const inDatabase = data.results?.in_database || false;

    if (inDatabase) {
      return {
        source: 'PhishTank',
        found: true,
        threatType: 'phishing',
        severity: 'critical',
        description: 'Domain found in PhishTank database',
      };
    }

    return {
      source: 'PhishTank',
      found: false,
    };
  } catch {
    return null;
  }
}

/**
 * Check Malware Domain List
 */
async function checkMalwareDomainList(domain: string): Promise<ThreatFeedResult | null> {
  try {
    const response = await fetch(`https://www.malwaredomainlist.com/mdl.php?search=${domain}`, {
      timeout: 5000,
    } as any);

    if (!response.ok) return null;

    const text = await response.text();
    const found = text.includes(domain) && text.includes('malware');

    if (found) {
      return {
        source: 'Malware Domain List',
        found: true,
        threatType: 'malware',
        severity: 'high',
        description: 'Domain found in Malware Domain List',
      };
    }

    return {
      source: 'Malware Domain List',
      found: false,
    };
  } catch {
    return null;
  }
}

