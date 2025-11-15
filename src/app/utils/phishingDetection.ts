import fetch from 'node-fetch';

/**
 * Phishing detection using multiple methods
 */
export async function detectPhishing(domain: string) {
  const results = {
    suspicious: false,
    score: 100,
    indicators: [] as string[],
    sources: {
      googleSafeBrowsing: null as any,
      urlhaus: null as any,
      phishtank: null as any,
    },
    recommendations: [] as string[],
  };

  // Check multiple sources in parallel
  const [googleResult, urlhausResult, phishtankResult] = await Promise.allSettled([
    checkGoogleSafeBrowsing(domain),
    checkURLhaus(domain),
    checkPhishTank(domain),
  ]);

  // Process Google Safe Browsing
  if (googleResult.status === 'fulfilled' && googleResult.value) {
    results.sources.googleSafeBrowsing = googleResult.value;
    if (googleResult.value.malicious) {
      results.suspicious = true;
      results.score -= 50;
      results.indicators.push('Flagged by Google Safe Browsing');
    }
  }

  // Process URLhaus
  if (urlhausResult.status === 'fulfilled' && urlhausResult.value) {
    results.sources.urlhaus = urlhausResult.value;
    if (urlhausResult.value.threat) {
      results.suspicious = true;
      results.score -= 30;
      results.indicators.push('Flagged by URLhaus');
    }
  }

  // Process PhishTank
  if (phishtankResult.status === 'fulfilled' && phishtankResult.value) {
    results.sources.phishtank = phishtankResult.value;
    if (phishtankResult.value.phishing) {
      results.suspicious = true;
      results.score -= 40;
      results.indicators.push('Flagged by PhishTank');
    }
  }

  // Check domain characteristics
  const domainChecks = checkDomainCharacteristics(domain);
  results.indicators.push(...domainChecks.indicators);
  results.score -= domainChecks.scorePenalty;

  if (results.score < 70) {
    results.suspicious = true;
  }

  // Generate recommendations
  if (results.suspicious) {
    results.recommendations.push('Domain appears suspicious - investigate further');
    results.recommendations.push('Check domain reputation on multiple sources');
    results.recommendations.push('Review domain registration details');
  }

  return results;
}

/**
 * Check Google Safe Browsing (requires API key)
 */
async function checkGoogleSafeBrowsing(domain: string): Promise<any> {
  // This would require Google Safe Browsing API key
  // For now, return null
  return null;
}

/**
 * Check URLhaus
 */
async function checkURLhaus(domain: string): Promise<any> {
  try {
    const response = await fetch(
      `https://urlhaus-api.abuse.ch/v1/host/${domain}/`,
      { timeout: 5000 } as any
    );

    if (!response.ok) {
      return { threat: false, data: null };
    }

    const data = await response.json();
    return {
      threat: data.query_status === 'ok' && data.threats && data.threats.length > 0,
      data,
    };
  } catch {
    return { threat: false, data: null };
  }
}

/**
 * Check PhishTank
 */
async function checkPhishTank(domain: string): Promise<any> {
  try {
    // PhishTank API requires API key for most endpoints
    // This is a simplified check
    return { phishing: false, data: null };
  } catch {
    return { phishing: false, data: null };
  }
}

/**
 * Check domain characteristics for phishing indicators
 */
function checkDomainCharacteristics(domain: string): { indicators: string[]; scorePenalty: number } {
  const indicators: string[] = [];
  let scorePenalty = 0;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[0-9]{4,}/, // Many numbers
    /[a-z]{1,2}[0-9]{3,}/, // Short letters followed by numbers
    /(secure|verify|update|account|login|signin)/i, // Common phishing keywords
  ];

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(domain)) {
      indicators.push('Domain contains suspicious patterns');
      scorePenalty += 5;
    }
  });

  // Check domain length
  if (domain.length > 50) {
    indicators.push('Domain name is unusually long');
    scorePenalty += 5;
  }

  // Check for homoglyphs (similar looking characters)
  const homoglyphs = /[а-яё]/; // Cyrillic characters
  if (homoglyphs.test(domain)) {
    indicators.push('Domain may contain homoglyphs (look-alike characters)');
    scorePenalty += 20;
  }

  // Check for typosquatting patterns
  const commonTypos = ['gmail', 'google', 'facebook', 'amazon', 'microsoft'];
  commonTypos.forEach(typo => {
    if (domain.includes(typo) && domain !== `${typo}.com`) {
      indicators.push(`Possible typosquatting of ${typo}`);
      scorePenalty += 15;
    }
  });

  return { indicators, scorePenalty };
}

