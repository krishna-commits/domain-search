import fetch from 'node-fetch';

// IP Geolocation
export const getIPGeolocation = async (ip: string) => {
  const providers = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${ip}/json/`,
      transform: (data: any) => ({
        ip: data.ip,
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.org,
        asn: data.asn
      })
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${ip}`,
      transform: (data: any) => ({
        ip: data.query,
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        asn: data.as
      })
    }
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data: provider.transform(data), provider: provider.name };
      }
    } catch {
      continue;
    }
  }

  return { success: false, data: null, provider: null };
};

// ASN Information
export const getASNInfo = async (ip: string) => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        asn: data.asn,
        asnName: data.org,
        network: data.network,
        ip: data.ip
      };
    }
  } catch {
    // Fallback
  }

  return { success: false, asn: null, asnName: null, network: null, ip };
};

// VirusTotal IP reputation
export const checkVirusTotal = async (ip: string, apiKey?: string) => {
  if (!apiKey) {
    return { success: false, error: 'VirusTotal API key required', data: null };
  }

  try {
    const response = await fetch(`https://www.virustotal.com/vtapi/v2/ip-address/report?apikey=${apiKey}&ip=${ip}`);
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          detected: data.detected_urls?.length > 0 || data.detected_samples?.length > 0,
          positives: data.positives || 0,
          total: data.total || 0,
          detectedUrls: data.detected_urls?.length || 0,
          detectedSamples: data.detected_samples?.length || 0,
          responseCode: data.response_code
        }
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message, data: null };
  }

  return { success: false, error: 'Failed to fetch VirusTotal data', data: null };
};

// AbuseIPDB check
export const checkAbuseIPDB = async (ip: string, apiKey?: string) => {
  if (!apiKey) {
    return { success: false, error: 'AbuseIPDB API key required', data: null };
  }

  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const result = data.data;
      return {
        success: true,
        data: {
          isWhitelisted: result.isWhitelisted || false,
          abuseConfidenceScore: result.abuseConfidenceScore || 0,
          usageType: result.usageType || 'unknown',
          isp: result.isp || 'unknown',
          countryCode: result.countryCode || 'unknown',
          totalReports: result.totalReports || 0,
          numDistinctUsers: result.numDistinctUsers || 0
        }
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message, data: null };
  }

  return { success: false, error: 'Failed to fetch AbuseIPDB data', data: null };
};

// Blacklist checking
export const checkBlacklists = async (ip: string) => {
  const blacklists = [
    { name: 'Spamhaus', url: `https://www.spamhaus.org/query/ip/${ip}` },
    { name: 'AbuseIPDB', url: `https://www.abuseipdb.com/check/${ip}` },
    { name: 'Project Honey Pot', url: `https://www.projecthoneypot.org/ip_${ip}` }
  ];

  // Note: Most blacklist APIs require API keys or have rate limits
  // This is a simplified check that returns the blacklist URLs
  return {
    blacklists: blacklists.map(bl => ({
      name: bl.name,
      url: bl.url,
      checked: false,
      listed: null as boolean | null
    })),
    note: 'Full blacklist checking requires API keys for each service'
  };
};

// Comprehensive IP reputation check
export const comprehensiveIPReputation = async (ip: string, apiKeys?: { virusTotal?: string; abuseIPDB?: string }) => {
  const [geolocation, asnInfo, virusTotal, abuseIPDB, blacklists] = await Promise.all([
    getIPGeolocation(ip),
    getASNInfo(ip),
    checkVirusTotal(ip, apiKeys?.virusTotal),
    checkAbuseIPDB(ip, apiKeys?.abuseIPDB),
    checkBlacklists(ip)
  ]);

  // Calculate reputation score
  let score = 100;
  if (virusTotal.success && virusTotal.data?.detected) {
    score -= 30;
  }
  if (abuseIPDB.success && abuseIPDB.data?.abuseConfidenceScore > 50) {
    score -= 30;
  }
  if (abuseIPDB.success && abuseIPDB.data?.abuseConfidenceScore > 75) {
    score -= 20;
  }

  return {
    geolocation,
    asn: asnInfo,
    virusTotal,
    abuseIPDB,
    blacklists,
    reputationScore: Math.max(0, Math.min(100, score))
  };
};

