/**
 * Advanced Threat Intelligence
 * - Multiple Threat Feed Integrations
 * - Threat Correlation
 * - Historical Threat Tracking
 * - Automated Threat Alerts
 */

import fetch from 'node-fetch';

export interface ThreatIntelligenceResult {
  domain: string;
  timestamp: Date;
  threats: Array<{
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    firstSeen?: Date;
    lastSeen?: Date;
    confidence: number;
  }>;
  ipThreats: Array<{
    ip: string;
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  correlation: {
    threatCount: number;
    uniqueSources: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  };
  historical: {
    firstThreat: Date | null;
    threatCount: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  recommendations: string[];
}

/**
 * Check advanced threat intelligence
 */
export async function checkAdvancedThreatIntelligence(
  domain: string,
  ip: string | null,
  apiKeys: {
    virusTotal?: string;
    abuseIPDB?: string;
    alienVault?: string;
    shodan?: string;
    censys?: string;
  }
): Promise<ThreatIntelligenceResult> {
  const threats: Array<{
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    firstSeen?: Date;
    lastSeen?: Date;
    confidence: number;
  }> = [];

  const ipThreats: Array<{
    ip: string;
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }> = [];

  // VirusTotal check
  if (apiKeys.virusTotal) {
    try {
      const vtThreats = await checkVirusTotal(domain, ip, apiKeys.virusTotal);
      threats.push(...vtThreats);
    } catch (error) {
      console.error('VirusTotal check error:', error);
    }
  }

  // AbuseIPDB check
  if (apiKeys.abuseIPDB && ip) {
    try {
      const abuseThreats = await checkAbuseIPDB(ip, apiKeys.abuseIPDB);
      ipThreats.push(...abuseThreats);
    } catch (error) {
      console.error('AbuseIPDB check error:', error);
    }
  }

  // AlienVault OTX check
  if (apiKeys.alienVault) {
    try {
      const otxThreats = await checkAlienVaultOTX(domain, apiKeys.alienVault);
      threats.push(...otxThreats);
    } catch (error) {
      console.error('AlienVault OTX check error:', error);
    }
  }

  // Shodan check
  if (apiKeys.shodan && ip) {
    try {
      const shodanThreats = await checkShodan(ip, apiKeys.shodan);
      ipThreats.push(...shodanThreats);
    } catch (error) {
      console.error('Shodan check error:', error);
    }
  }

  // Censys check
  if (apiKeys.censys && ip) {
    try {
      const censysThreats = await checkCensys(ip, apiKeys.censys);
      ipThreats.push(...censysThreats);
    } catch (error) {
      console.error('Censys check error:', error);
    }
  }

  // Threat correlation
  const correlation = correlateThreats(threats, ipThreats);

  // Historical analysis
  const historical = analyzeThreatHistory(threats);

  // Recommendations
  const recommendations: string[] = [];
  if (correlation.riskLevel === 'critical' || correlation.riskLevel === 'high') {
    recommendations.push('Immediate action required - multiple threat sources detected');
  }
  if (threats.length > 0) {
    recommendations.push('Monitor domain for ongoing threats');
  }
  if (ipThreats.length > 0) {
    recommendations.push('Consider changing IP address if threats persist');
  }
  if (correlation.confidence > 80) {
    recommendations.push('High confidence threat detection - investigate immediately');
  }

  return {
    domain,
    timestamp: new Date(),
    threats,
    ipThreats,
    correlation,
    historical,
    recommendations,
  };
}

/**
 * Check VirusTotal
 */
async function checkVirusTotal(
  domain: string,
  ip: string | null,
  apiKey: string
): Promise<Array<{
  source: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}>> {
  const threats: Array<{
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidence: number;
  }> = [];

  try {
    const response = await fetch(`https://www.virustotal.com/vtapi/v2/domain/report?apikey=${apiKey}&domain=${domain}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.detected_urls && data.detected_urls.length > 0) {
        const detectionCount = data.detected_urls.reduce((sum: number, url: any) => sum + (url.positives || 0), 0);
        if (detectionCount > 0) {
          threats.push({
            source: 'VirusTotal',
            type: 'Malware',
            severity: detectionCount > 10 ? 'critical' : detectionCount > 5 ? 'high' : 'medium',
            description: `${detectionCount} malware detections on URLs`,
            confidence: Math.min(100, detectionCount * 10),
          });
        }
      }

      if (data.detected_downloaded_samples && data.detected_downloaded_samples.length > 0) {
        threats.push({
          source: 'VirusTotal',
          type: 'Malware',
          severity: 'high',
          description: 'Malicious files detected',
          confidence: 80,
        });
      }
    }
  } catch (error) {
    // API error
  }

  return threats;
}

/**
 * Check AbuseIPDB
 */
async function checkAbuseIPDB(
  ip: string,
  apiKey: string
): Promise<Array<{
  ip: string;
  source: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}>> {
  const threats: Array<{
    ip: string;
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }> = [];

  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.abuseConfidenceScore > 0) {
        threats.push({
          ip,
          source: 'AbuseIPDB',
          type: 'Abuse',
          severity: data.data.abuseConfidenceScore > 75 ? 'critical' : data.data.abuseConfidenceScore > 50 ? 'high' : 'medium',
          description: `Abuse confidence score: ${data.data.abuseConfidenceScore}%`,
        });
      }
    }
  } catch (error) {
    // API error
  }

  return threats;
}

/**
 * Check AlienVault OTX
 */
async function checkAlienVaultOTX(
  domain: string,
  apiKey: string
): Promise<Array<{
  source: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}>> {
  const threats: Array<{
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidence: number;
  }> = [];

  try {
    const response = await fetch(`https://otx.alienvault.com/api/v1/indicators/domain/${domain}/general`, {
      headers: {
        'X-OTX-API-KEY': apiKey,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.pulse_info && data.pulse_info.count > 0) {
        threats.push({
          source: 'AlienVault OTX',
          type: 'Threat Intelligence',
          severity: data.pulse_info.count > 10 ? 'high' : 'medium',
          description: `Found in ${data.pulse_info.count} threat intelligence pulses`,
          confidence: Math.min(100, data.pulse_info.count * 10),
        });
      }
    }
  } catch (error) {
    // API error
  }

  return threats;
}

/**
 * Check Shodan
 */
async function checkShodan(
  ip: string,
  apiKey: string
): Promise<Array<{
  ip: string;
  source: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}>> {
  const threats: Array<{
    ip: string;
    source: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }> = [];

  try {
    const response = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.vulns && Object.keys(data.vulns).length > 0) {
        threats.push({
          ip,
          source: 'Shodan',
          type: 'Vulnerability',
          severity: Object.keys(data.vulns).length > 5 ? 'high' : 'medium',
          description: `${Object.keys(data.vulns).length} known vulnerabilities detected`,
        });
      }
    }
  } catch (error) {
    // API error
  }

  return threats;
}

/**
 * Check Censys
 */
async function checkCensys(
  ip: string,
  apiKey: string
): Promise<Array<{
  ip: string;
  source: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}>> {
  // Censys API implementation would go here
  // For now, return empty array
  return [];
}

/**
 * Correlate threats
 */
function correlateThreats(
  domainThreats: Array<{ source: string; severity: string; confidence: number }>,
  ipThreats: Array<{ source: string; severity: string }>
): {
  threatCount: number;
  uniqueSources: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
} {
  const allThreats = [...domainThreats, ...ipThreats];
  const uniqueSources = new Set(allThreats.map(t => t.source)).size;
  
  const criticalCount = allThreats.filter(t => t.severity === 'critical').length;
  const highCount = allThreats.filter(t => t.severity === 'high').length;
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (criticalCount > 0 || allThreats.length > 5) {
    riskLevel = 'critical';
  } else if (highCount > 0 || allThreats.length > 3) {
    riskLevel = 'high';
  } else if (allThreats.length > 1) {
    riskLevel = 'medium';
  }

  const avgConfidence = domainThreats.length > 0
    ? domainThreats.reduce((sum, t) => sum + (t.confidence || 0), 0) / domainThreats.length
    : 0;

  return {
    threatCount: allThreats.length,
    uniqueSources,
    riskLevel,
    confidence: Math.round(avgConfidence),
  };
}

/**
 * Analyze threat history
 */
function analyzeThreatHistory(
  threats: Array<{ firstSeen?: Date; lastSeen?: Date }>
): {
  firstThreat: Date | null;
  threatCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
} {
  const firstThreat = threats
    .filter(t => t.firstSeen)
    .map(t => t.firstSeen!)
    .sort((a, b) => a.getTime() - b.getTime())[0] || null;

  // Trend analysis would require historical data
  // For now, assume stable
  return {
    firstThreat,
    threatCount: threats.length,
    trend: 'stable',
  };
}

