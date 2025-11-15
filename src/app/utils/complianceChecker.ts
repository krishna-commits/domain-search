/**
 * Compliance Checking (GDPR, PCI-DSS, HIPAA)
 */

export interface ComplianceCheck {
  name: string;
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface ComplianceResult {
  domain: string;
  gdpr: ComplianceCheck;
  pciDss: ComplianceCheck;
  hipaa: ComplianceCheck;
  overallScore: number;
  overallStatus: 'compliant' | 'non-compliant' | 'partial';
}

/**
 * Check GDPR compliance
 */
export function checkGDPRCompliance(
  domain: string,
  cookies: any,
  securityHeaders: any,
  ssl: any,
  privacyPolicy: boolean = false
): ComplianceCheck {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check HTTPS
  if (!ssl?.valid) {
    issues.push('HTTPS not properly configured');
    recommendations.push('Enable HTTPS with valid SSL certificate');
    score -= 20;
  }

  // Check cookie consent
  if (cookies?.cookies && cookies.cookies.length > 0) {
    const hasConsent = cookies.cookies.some((c: any) => 
      c.name?.toLowerCase().includes('consent') || 
      c.name?.toLowerCase().includes('cookie')
    );
    if (!hasConsent) {
      issues.push('Cookie consent mechanism not detected');
      recommendations.push('Implement cookie consent banner');
      score -= 15;
    }
  }

  // Check security headers
  if (!securityHeaders?.headers?.['strict-transport-security']) {
    issues.push('HSTS header missing');
    recommendations.push('Implement HSTS header');
    score -= 10;
  }

  if (!securityHeaders?.headers?.['content-security-policy']) {
    issues.push('CSP header missing');
    recommendations.push('Implement Content Security Policy');
    score -= 10;
  }

  // Check privacy policy
  if (!privacyPolicy) {
    issues.push('Privacy policy not found');
    recommendations.push('Add privacy policy page');
    score -= 15;
  }

  // Check data encryption
  if (!ssl?.valid) {
    issues.push('Data encryption not properly configured');
    recommendations.push('Ensure all data transmission is encrypted');
    score -= 10;
  }

  // Check cookie security
  if (cookies?.cookies) {
    const insecureCookies = cookies.cookies.filter((c: any) => !c.secure || !c.httpOnly);
    if (insecureCookies.length > 0) {
      issues.push(`${insecureCookies.length} insecure cookies detected`);
      recommendations.push('Set Secure and HttpOnly flags on all cookies');
      score -= 10;
    }
  }

  return {
    name: 'GDPR',
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

/**
 * Check PCI-DSS compliance
 */
export function checkPCICompliance(
  domain: string,
  ssl: any,
  securityHeaders: any,
  vulnerabilities: any[],
  encryption: boolean = true
): ComplianceCheck {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check HTTPS
  if (!ssl?.valid) {
    issues.push('HTTPS not properly configured');
    recommendations.push('Enable HTTPS with valid SSL certificate');
    score -= 25;
  }

  // Check TLS version
  if (ssl?.protocol && !ssl.protocol.includes('TLSv1.2') && !ssl.protocol.includes('TLSv1.3')) {
    issues.push('Weak TLS version detected');
    recommendations.push('Use TLS 1.2 or higher');
    score -= 20;
  }

  // Check security headers
  if (!securityHeaders?.headers?.['strict-transport-security']) {
    issues.push('HSTS header missing');
    recommendations.push('Implement HSTS header');
    score -= 15;
  }

  if (!securityHeaders?.headers?.['x-frame-options']) {
    issues.push('X-Frame-Options header missing');
    recommendations.push('Implement X-Frame-Options header');
    score -= 10;
  }

  // Check vulnerabilities
  if (vulnerabilities && vulnerabilities.length > 0) {
    const criticalVulns = vulnerabilities.filter((v: any) => v.severity === 'critical' || v.severity === 'high');
    if (criticalVulns.length > 0) {
      issues.push(`${criticalVulns.length} critical/high vulnerabilities detected`);
      recommendations.push('Fix critical and high severity vulnerabilities');
      score -= 20;
    }
  }

  // Check encryption
  if (!encryption) {
    issues.push('Data encryption not properly configured');
    recommendations.push('Ensure all sensitive data is encrypted');
    score -= 10;
  }

  return {
    name: 'PCI-DSS',
    passed: score >= 80,
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

/**
 * Check HIPAA compliance
 */
export function checkHIPAACompliance(
  domain: string,
  ssl: any,
  securityHeaders: any,
  encryption: boolean = true,
  accessControl: boolean = true
): ComplianceCheck {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check HTTPS
  if (!ssl?.valid) {
    issues.push('HTTPS not properly configured');
    recommendations.push('Enable HTTPS with valid SSL certificate');
    score -= 25;
  }

  // Check encryption
  if (!encryption) {
    issues.push('Data encryption not properly configured');
    recommendations.push('Ensure all PHI (Protected Health Information) is encrypted');
    score -= 25;
  }

  // Check security headers
  if (!securityHeaders?.headers?.['strict-transport-security']) {
    issues.push('HSTS header missing');
    recommendations.push('Implement HSTS header');
    score -= 15;
  }

  if (!securityHeaders?.headers?.['content-security-policy']) {
    issues.push('CSP header missing');
    recommendations.push('Implement Content Security Policy');
    score -= 10;
  }

  // Check access control
  if (!accessControl) {
    issues.push('Access control mechanisms not detected');
    recommendations.push('Implement proper access control and authentication');
    score -= 15;
  }

  // Check audit logging
  // This would require additional checks
  issues.push('Audit logging verification required');
  recommendations.push('Ensure audit logs are maintained and reviewed');
  score -= 10;

  return {
    name: 'HIPAA',
    passed: score >= 80,
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

/**
 * Comprehensive compliance check
 */
export function checkCompliance(
  domain: string,
  ssl: any,
  securityHeaders: any,
  cookies: any,
  vulnerabilities: any[],
  options: {
    privacyPolicy?: boolean;
    encryption?: boolean;
    accessControl?: boolean;
  } = {}
): ComplianceResult {
  const gdpr = checkGDPRCompliance(
    domain,
    cookies,
    securityHeaders,
    ssl,
    options.privacyPolicy
  );

  const pciDss = checkPCICompliance(
    domain,
    ssl,
    securityHeaders,
    vulnerabilities,
    options.encryption
  );

  const hipaa = checkHIPAACompliance(
    domain,
    ssl,
    securityHeaders,
    options.encryption,
    options.accessControl
  );

  const overallScore = (gdpr.score + pciDss.score + hipaa.score) / 3;
  const overallStatus = overallScore >= 80 ? 'compliant' : overallScore >= 60 ? 'partial' : 'non-compliant';

  return {
    domain,
    gdpr,
    pciDss,
    hipaa,
    overallScore: Math.round(overallScore),
    overallStatus,
  };
}

