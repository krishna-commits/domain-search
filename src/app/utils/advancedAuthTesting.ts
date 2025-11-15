/**
 * Advanced Authentication Testing
 * - MFA Bypass Attempts
 * - Password Policy Analysis
 * - Account Enumeration Detection
 * - Session Management Deep Dive
 * - Brute Force Protection
 */

import fetch from 'node-fetch';

export interface AdvancedAuthTestingResult {
  mfa: {
    detected: boolean;
    methods: string[];
    bypassPossible: boolean;
    vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
  passwordPolicy: {
    minLength: number | null;
    complexity: boolean;
    expiration: boolean;
    history: boolean;
    lockout: boolean;
    score: number;
  };
  enumeration: {
    possible: boolean;
    methods: string[];
    vulnerable: boolean;
  };
  session: {
    timeout: number | null;
    fixation: boolean;
    hijacking: boolean;
    secure: boolean;
    httpOnly: boolean;
    sameSite: string | null;
  };
  bruteForce: {
    protected: boolean;
    lockout: boolean;
    rateLimited: boolean;
    captcha: boolean;
  };
  vulnerabilities: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  score: number;
  recommendations: string[];
}

export async function testAdvancedAuthentication(
  baseUrl: string,
  html: string,
  headers: Record<string, string>,
  cookies: Array<{ name: string; httpOnly?: boolean; secure?: boolean; sameSite?: string }>
): Promise<AdvancedAuthTestingResult> {
  const result: AdvancedAuthTestingResult = {
    mfa: {
      detected: false,
      methods: [],
      bypassPossible: false,
      vulnerabilities: [],
    },
    passwordPolicy: {
      minLength: null,
      complexity: false,
      expiration: false,
      history: false,
      lockout: false,
      score: 0,
    },
    enumeration: {
      possible: false,
      methods: [],
      vulnerable: false,
    },
    session: {
      timeout: null,
      fixation: false,
      hijacking: false,
      secure: false,
      httpOnly: false,
      sameSite: null,
    },
    bruteForce: {
      protected: false,
      lockout: false,
      rateLimited: false,
      captcha: false,
    },
    vulnerabilities: [],
    score: 100,
    recommendations: [],
  };

  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  const base = `${url.protocol}//${url.hostname}`;

  // MFA Detection
  const mfaIndicators = [
    /multi[-\s]?factor/i,
    /two[-\s]?factor/i,
    /2fa/i,
    /mfa/i,
    /totp/i,
    /authenticator/i,
    /sms[-\s]?code/i,
    /verification[-\s]?code/i,
  ];

  mfaIndicators.forEach(pattern => {
    if (pattern.test(html)) {
      result.mfa.detected = true;
      if (pattern.source.includes('totp') || pattern.source.includes('authenticator')) {
        result.mfa.methods.push('TOTP');
      }
      if (pattern.source.includes('sms')) {
        result.mfa.methods.push('SMS');
      }
    }
  });

  // Password Policy Analysis
  const passwordPatterns = [
    /min[-\s]?length[=:]\s*(\d+)/i,
    /password[-\s]?length[=:]\s*(\d+)/i,
    /min[-\s]?(\d+)[-\s]?characters/i,
  ];

  passwordPatterns.forEach(pattern => {
    const match = html.match(pattern);
    if (match && match[1]) {
      result.passwordPolicy.minLength = parseInt(match[1]);
    }
  });

  const complexityIndicators = [
    /uppercase/i,
    /lowercase/i,
    /number/i,
    /special[-\s]?character/i,
    /symbol/i,
  ];

  if (complexityIndicators.some(pattern => pattern.test(html))) {
    result.passwordPolicy.complexity = true;
  }

  // Session Management Analysis
  const sessionCookies = cookies.filter(c => 
    c.name.toLowerCase().includes('session') || 
    c.name.toLowerCase().includes('token') ||
    c.name.toLowerCase().includes('auth')
  );

  if (sessionCookies.length > 0) {
    const sessionCookie = sessionCookies[0];
    result.session.secure = sessionCookie.secure || false;
    result.session.httpOnly = sessionCookie.httpOnly || false;
    result.session.sameSite = sessionCookie.sameSite || null;

    if (!sessionCookie.secure) {
      result.vulnerabilities.push({
        type: 'Insecure Session Cookie',
        severity: 'high',
        description: 'Session cookie is not marked as Secure',
        recommendation: 'Set Secure flag on all session cookies',
      });
    }

    if (!sessionCookie.httpOnly) {
      result.vulnerabilities.push({
        type: 'Session Cookie Not HttpOnly',
        severity: 'high',
        description: 'Session cookie is accessible via JavaScript',
        recommendation: 'Set HttpOnly flag on all session cookies',
      });
    }

    if (sessionCookie.sameSite !== 'Strict' && sessionCookie.sameSite !== 'Lax') {
      result.vulnerabilities.push({
        type: 'Weak SameSite Policy',
        severity: 'medium',
        description: 'Session cookie SameSite policy is not Strict or Lax',
        recommendation: 'Set SameSite=Strict or SameSite=Lax on session cookies',
      });
    }
  }

  // Account Enumeration Testing
  const loginPaths = ['/login', '/signin', '/auth/login', '/account/login'];
  for (const path of loginPaths) {
    try {
      const testUrl = base + path;
      // Test with invalid username
      const invalidResponse = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=invaliduser12345&password=test',
        timeout: 3000,
      }).catch(() => null);

      // Test with valid username format but wrong password
      const validFormatResponse = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=admin&password=wrongpass',
        timeout: 3000,
      }).catch(() => null);

      if (invalidResponse && validFormatResponse) {
        // Check if responses differ (enumeration possible)
        const invalidText = await invalidResponse.text().catch(() => '');
        const validText = await validFormatResponse.text().catch(() => '');
        
        if (invalidText !== validText) {
          result.enumeration.possible = true;
          result.enumeration.vulnerable = true;
          result.enumeration.methods.push('Response Timing/Content');
          result.vulnerabilities.push({
            type: 'Account Enumeration Possible',
            severity: 'medium',
            description: 'Different responses for invalid vs valid usernames',
            recommendation: 'Use consistent error messages for login failures',
          });
        }
      }
    } catch {
      // Cannot test
    }
  }

  // Brute Force Protection Testing
  try {
    const testUrl = base + '/login';
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=test${i}&password=wrong`,
        timeout: 3000,
      }).catch(() => null));
    }
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r && r.status === 429);
    const locked = responses.some(r => r && r.status === 423);
    const captcha = responses.some(r => {
      const text = r?.text().catch(() => '');
      return text && /captcha|recaptcha|hcaptcha/i.test(text as any);
    });

    result.bruteForce.rateLimited = rateLimited || false;
    result.bruteForce.lockout = locked || false;
    result.bruteForce.protected = rateLimited || locked || captcha || false;
    result.bruteForce.captcha = captcha || false;

    if (!result.bruteForce.protected) {
      result.vulnerabilities.push({
        type: 'No Brute Force Protection',
        severity: 'high',
        description: 'Login endpoint does not appear to have brute force protection',
        recommendation: 'Implement rate limiting, account lockout, or CAPTCHA',
      });
    }
  } catch {
    // Cannot test
  }

  // Calculate password policy score
  let policyScore = 0;
  if (result.passwordPolicy.minLength && result.passwordPolicy.minLength >= 8) policyScore += 20;
  if (result.passwordPolicy.complexity) policyScore += 20;
  if (result.passwordPolicy.expiration) policyScore += 20;
  if (result.passwordPolicy.history) policyScore += 20;
  if (result.passwordPolicy.lockout) policyScore += 20;
  result.passwordPolicy.score = policyScore;

  // Calculate overall score
  let score = 100;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 25;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 8;
    else score -= 3;
  });
  if (!result.session.secure) score -= 15;
  if (!result.session.httpOnly) score -= 15;
  if (!result.bruteForce.protected) score -= 20;
  if (result.enumeration.vulnerable) score -= 10;
  result.score = Math.max(0, score);

  // Generate recommendations
  if (!result.session.secure) {
    result.recommendations.push('Set Secure flag on all session cookies');
  }
  if (!result.session.httpOnly) {
    result.recommendations.push('Set HttpOnly flag on all session cookies');
  }
  if (!result.bruteForce.protected) {
    result.recommendations.push('Implement brute force protection (rate limiting, lockout, or CAPTCHA)');
  }
  if (result.enumeration.vulnerable) {
    result.recommendations.push('Use consistent error messages to prevent account enumeration');
  }
  if (result.passwordPolicy.score < 60) {
    result.recommendations.push('Strengthen password policy (min 8 chars, complexity, expiration)');
  }

  return result;
}

