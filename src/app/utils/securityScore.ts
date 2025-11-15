// Calculate overall security score
export const calculateSecurityScore = (data: any) => {
  const weights = {
    ssl: 0.20,
    headers: 0.15,
    cookies: 0.10,
    csp: 0.10,
    emailSecurity: 0.10,
    dns: 0.10,
    mixedContent: 0.05,
    hsts: 0.05,
    protocols: 0.10,
    ipReputation: 0.05
  };

  let totalScore = 0;
  let totalWeight = 0;

  // SSL Score
  if (data.ssl) {
    const sslScore = data.ssl.valid ? 100 : 0;
    totalScore += sslScore * weights.ssl;
    totalWeight += weights.ssl;
  }

  // Security Headers Score
  if (data.security?.headers) {
    const headers = data.security.headers;
    const presentCount = Object.values(headers).filter((h: any) => h.present).length;
    const totalHeaders = Object.keys(headers).length;
    const headersScore = (presentCount / totalHeaders) * 100;
    totalScore += headersScore * weights.headers;
    totalWeight += weights.headers;
  }

  // Cookies Score
  if (data.cookies) {
    totalScore += data.cookies.score * weights.cookies;
    totalWeight += weights.cookies;
  }

  // CSP Score
  if (data.csp) {
    totalScore += data.csp.score * weights.csp;
    totalWeight += weights.csp;
  }

  // Email Security Score
  if (data.emailSecurity) {
    totalScore += data.emailSecurity.score * weights.emailSecurity;
    totalWeight += weights.emailSecurity;
  }

  // DNS Score
  if (data.dnsAnalysis) {
    totalScore += data.dnsAnalysis.score * weights.dns;
    totalWeight += weights.dns;
  }

  // Mixed Content Score
  if (data.mixedContent) {
    totalScore += data.mixedContent.score * weights.mixedContent;
    totalWeight += weights.mixedContent;
  }

  // HSTS Score
  if (data.hsts) {
    const hstsScore = data.hsts.preloaded ? 100 : (data.hsts.eligible ? 80 : 0);
    totalScore += hstsScore * weights.hsts;
    totalWeight += weights.hsts;
  }

  // Protocols Score
  if (data.security?.protocols) {
    const protocols = data.security.protocols;
    const tlsScore = protocols.tlsStatus === 'secure' ? 50 : 0;
    const cipherScore = protocols.cipherStatus === 'secure' ? 50 : 0;
    const protocolsScore = tlsScore + cipherScore;
    totalScore += protocolsScore * weights.protocols;
    totalWeight += weights.protocols;
  }

  // IP Reputation Score
  if (data.ipReputation) {
    totalScore += data.ipReputation.reputationScore * weights.ipReputation;
    totalWeight += weights.ipReputation;
  }

  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  return Math.round(finalScore);
};

// Risk assessment
export const assessRisk = (score: number, data: any) => {
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  let riskFactors: string[] = [];

  if (score >= 80) {
    riskLevel = 'low';
  } else if (score >= 60) {
    riskLevel = 'medium';
  } else if (score >= 40) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }

  // Identify specific risk factors
  if (data.ssl && !data.ssl.valid) {
    riskFactors.push('Invalid or expired SSL certificate');
  }
  if (data.security?.protocols?.tlsStatus === 'insecure') {
    riskFactors.push('Weak TLS protocol');
  }
  if (data.cookies && data.cookies.issues && data.cookies.issues.length > 0) {
    riskFactors.push('Insecure cookie configuration');
  }
  if (data.mixedContent && data.mixedContent.found) {
    riskFactors.push('Mixed content detected');
  }
  if (data.emailSecurity && data.emailSecurity.score < 50) {
    riskFactors.push('Weak email security (SPF/DKIM/DMARC)');
  }
  if (data.ipReputation && data.ipReputation.reputationScore < 50) {
    riskFactors.push('Poor IP reputation');
  }

  return { riskLevel, riskFactors, score };
};

// Generate recommendations
export const generateRecommendations = (data: any) => {
  const recommendations: string[] = [];

  // SSL recommendations
  if (!data.ssl || !data.ssl.valid) {
    recommendations.push('Fix SSL certificate issues - ensure certificate is valid and not expired');
  }

  // Security headers recommendations
  if (data.security?.headers) {
    const missingHeaders = Object.entries(data.security.headers)
      .filter(([_, h]: [string, any]) => !h.present)
      .map(([name]) => name);
    
    if (missingHeaders.length > 0) {
      recommendations.push(`Add missing security headers: ${missingHeaders.join(', ')}`);
    }
  }

  // Cookie recommendations
  if (data.cookies && data.cookies.issues.length > 0) {
    recommendations.push('Configure cookies with Secure and HttpOnly flags');
    if (data.cookies.issues.some((i: string) => i.includes('SameSite'))) {
      recommendations.push('Set SameSite attribute on cookies (preferably "Strict" or "Lax")');
    }
  }

  // CSP recommendations
  if (!data.csp || !data.csp.valid) {
    recommendations.push('Implement Content Security Policy (CSP) header');
    if (data.csp && data.csp.issues.length > 0) {
      recommendations.push(`Fix CSP issues: ${data.csp.issues.join('; ')}`);
    }
  }

  // Email security recommendations
  if (data.emailSecurity) {
    if (!data.emailSecurity.spf.found) {
      recommendations.push('Add SPF record to DNS');
    }
    if (!data.emailSecurity.dmarc.found) {
      recommendations.push('Add DMARC record to DNS');
    }
    if (!data.emailSecurity.dkim.found) {
      recommendations.push('Configure DKIM for email authentication');
    }
  }

  // HSTS recommendations
  if (!data.hsts || !data.hsts.preloaded) {
    recommendations.push('Enable HSTS (HTTP Strict Transport Security) header');
    if (data.hsts && data.hsts.eligible && !data.hsts.preloaded) {
      recommendations.push('Submit domain to HSTS preload list');
    }
  }

  // Mixed content recommendations
  if (data.mixedContent && data.mixedContent.found) {
    recommendations.push('Replace HTTP resources with HTTPS to avoid mixed content warnings');
  }

  // Protocol recommendations
  if (data.security?.protocols?.tlsStatus === 'insecure') {
    recommendations.push('Upgrade to TLS 1.2 or higher');
  }
  if (data.security?.protocols?.cipherStatus === 'insecure') {
    recommendations.push('Remove weak ciphers from server configuration');
  }

  // DNS recommendations
  if (data.dnsAnalysis && data.dnsAnalysis.score < 70) {
    recommendations.push('Review DNS configuration for consistency and performance');
  }

  return recommendations;
};

