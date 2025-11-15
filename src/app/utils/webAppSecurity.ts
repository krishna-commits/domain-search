/**
 * Web Application Security
 * - Enhanced HTTP Security Headers
 * - Session Security Analysis
 * - Authentication Security Testing
 */

import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

export interface EnhancedSecurityHeaders {
  xFrameOptions: { present: boolean; value: string | null; valid: boolean };
  referrerPolicy: { present: boolean; value: string | null; valid: boolean };
  permissionsPolicy: { present: boolean; value: string | null; valid: boolean };
  crossOriginEmbedderPolicy: { present: boolean; value: string | null; valid: boolean };
  crossOriginOpenerPolicy: { present: boolean; value: string | null; valid: boolean };
  crossOriginResourcePolicy: { present: boolean; value: string | null; valid: boolean };
  score: number;
  recommendations: string[];
}

export interface SessionSecurityResult {
  sessionCookieSecure: boolean;
  sessionCookieHttpOnly: boolean;
  sessionCookieSameSite: string | null;
  sessionTimeout: number | null;
  sessionFixationVulnerable: boolean;
  csrfProtection: boolean;
  csrfTokenPresent: boolean;
  score: number;
  recommendations: string[];
}

export interface AuthenticationSecurityResult {
  loginFormPresent: boolean;
  loginFormSecure: boolean;
  passwordPolicyStrength: 'weak' | 'medium' | 'strong' | 'unknown';
  mfaDetected: boolean;
  accountLockoutDetected: boolean;
  passwordResetAvailable: boolean;
  score: number;
  recommendations: string[];
}

/**
 * Analyze enhanced HTTP security headers
 */
export function analyzeEnhancedSecurityHeaders(headers: Headers): EnhancedSecurityHeaders {
  const xFrameOptions = headers.get('X-Frame-Options');
  const referrerPolicy = headers.get('Referrer-Policy');
  const permissionsPolicy = headers.get('Permissions-Policy') || headers.get('Feature-Policy');
  const coep = headers.get('Cross-Origin-Embedder-Policy');
  const coop = headers.get('Cross-Origin-Opener-Policy');
  const corp = headers.get('Cross-Origin-Resource-Policy');

  let score = 0;
  const recommendations: string[] = [];

  // X-Frame-Options
  if (xFrameOptions) {
    const valid = ['DENY', 'SAMEORIGIN'].includes(xFrameOptions.toUpperCase());
    if (valid) score += 15;
    else recommendations.push('X-Frame-Options should be DENY or SAMEORIGIN');
  } else {
    recommendations.push('Add X-Frame-Options header to prevent clickjacking');
  }

  // Referrer-Policy
  if (referrerPolicy) {
    const validValues = ['no-referrer', 'strict-origin-when-cross-origin', 'same-origin'];
    const valid = validValues.includes(referrerPolicy.toLowerCase());
    if (valid) score += 15;
    else recommendations.push('Use a strict Referrer-Policy value');
  } else {
    recommendations.push('Add Referrer-Policy header to control referrer information');
  }

  // Permissions-Policy
  if (permissionsPolicy) {
    score += 15;
  } else {
    recommendations.push('Add Permissions-Policy header to restrict browser features');
  }

  // Cross-Origin-Embedder-Policy
  if (coep) {
    score += 15;
  } else {
    recommendations.push('Consider adding Cross-Origin-Embedder-Policy for isolation');
  }

  // Cross-Origin-Opener-Policy
  if (coop) {
    const valid = ['same-origin', 'same-origin-allow-popups'].includes(coop.toLowerCase());
    if (valid) score += 15;
    else recommendations.push('Use strict Cross-Origin-Opener-Policy');
  } else {
    recommendations.push('Add Cross-Origin-Opener-Policy header');
  }

  // Cross-Origin-Resource-Policy
  if (corp) {
    score += 10;
  } else {
    recommendations.push('Consider adding Cross-Origin-Resource-Policy');
  }

  return {
    xFrameOptions: {
      present: !!xFrameOptions,
      value: xFrameOptions,
      valid: xFrameOptions ? ['DENY', 'SAMEORIGIN'].includes(xFrameOptions.toUpperCase()) : false,
    },
    referrerPolicy: {
      present: !!referrerPolicy,
      value: referrerPolicy,
      valid: referrerPolicy ? ['no-referrer', 'strict-origin-when-cross-origin', 'same-origin'].includes(referrerPolicy.toLowerCase()) : false,
    },
    permissionsPolicy: {
      present: !!permissionsPolicy,
      value: permissionsPolicy,
      valid: !!permissionsPolicy,
    },
    crossOriginEmbedderPolicy: {
      present: !!coep,
      value: coep,
      valid: !!coep,
    },
    crossOriginOpenerPolicy: {
      present: !!coop,
      value: coop,
      valid: coop ? ['same-origin', 'same-origin-allow-popups'].includes(coop.toLowerCase()) : false,
    },
    crossOriginResourcePolicy: {
      present: !!corp,
      value: corp,
      valid: !!corp,
    },
    score,
    recommendations,
  };
}

/**
 * Analyze session security
 */
export function analyzeSessionSecurity(cookies: any[], html: string): SessionSecurityResult {
  const sessionCookies = cookies.filter(c => 
    c.name.toLowerCase().includes('session') || 
    c.name.toLowerCase().includes('sid') ||
    c.name.toLowerCase().includes('auth')
  );

  let sessionCookieSecure = true;
  let sessionCookieHttpOnly = true;
  let sessionCookieSameSite: string | null = null;
  let sessionTimeout: number | null = null;

  if (sessionCookies.length > 0) {
    const sessionCookie = sessionCookies[0];
    sessionCookieSecure = sessionCookie.secure || false;
    sessionCookieHttpOnly = sessionCookie.httpOnly || false;
    sessionCookieSameSite = sessionCookie.sameSite || null;
  }

  // Check for CSRF protection
  const csrfTokenPresent = /csrf|_token|authenticity_token/i.test(html);
  const csrfProtection = csrfTokenPresent || sessionCookieSameSite === 'Strict' || sessionCookieSameSite === 'Lax';

  // Check for session fixation (simplified)
  const sessionFixationVulnerable = !sessionCookieSecure || !sessionCookieHttpOnly;

  let score = 0;
  const recommendations: string[] = [];

  if (sessionCookieSecure) score += 25;
  else recommendations.push('Session cookies should have Secure flag');

  if (sessionCookieHttpOnly) score += 25;
  else recommendations.push('Session cookies should have HttpOnly flag');

  if (sessionCookieSameSite) {
    if (sessionCookieSameSite === 'Strict') score += 25;
    else if (sessionCookieSameSite === 'Lax') score += 20;
    else score += 10;
  } else {
    recommendations.push('Session cookies should have SameSite attribute');
  }

  if (csrfProtection) score += 25;
  else recommendations.push('Implement CSRF protection (tokens or SameSite cookies)');

  return {
    sessionCookieSecure,
    sessionCookieHttpOnly,
    sessionCookieSameSite,
    sessionTimeout,
    sessionFixationVulnerable,
    csrfProtection,
    csrfTokenPresent,
    score,
    recommendations,
  };
}

/**
 * Test authentication security
 */
export function testAuthenticationSecurity(html: string, headers: Headers): AuthenticationSecurityResult {
  // Check for login form
  const loginFormPresent = /<form[^>]*(login|signin|auth|password)[^>]*>/i.test(html) ||
                          /<input[^>]*(type=["']password["']|name=["']password["'])/i.test(html);

  // Check if login form is on HTTPS
  const loginFormSecure = loginFormPresent; // Simplified - would need to check actual form action

  // Check for MFA indicators
  const mfaDetected = /(two.?factor|2fa|mfa|multi.?factor|authenticator|totp)/i.test(html);

  // Check for password policy indicators
  let passwordPolicyStrength: 'weak' | 'medium' | 'strong' | 'unknown' = 'unknown';
  if (/(min.?length|password.?strength|complexity)/i.test(html)) {
    passwordPolicyStrength = 'medium';
  }
  if (/(uppercase|lowercase|number|special.?char)/i.test(html)) {
    passwordPolicyStrength = 'strong';
  }

  // Check for account lockout
  const accountLockoutDetected = /(lockout|locked|temporarily|suspended)/i.test(html);

  // Check for password reset
  const passwordResetAvailable = /(forgot.?password|reset.?password|recover)/i.test(html);

  let score = 0;
  const recommendations: string[] = [];

  if (loginFormSecure) score += 20;
  else if (loginFormPresent) recommendations.push('Ensure login forms are served over HTTPS');

  if (mfaDetected) score += 30;
  else recommendations.push('Consider implementing multi-factor authentication');

  if (passwordPolicyStrength === 'strong') score += 20;
  else if (passwordPolicyStrength === 'medium') score += 10;
  else recommendations.push('Implement strong password policy');

  if (accountLockoutDetected) score += 15;
  else recommendations.push('Implement account lockout after failed login attempts');

  if (passwordResetAvailable) score += 15;
  else recommendations.push('Provide password reset functionality');

  return {
    loginFormPresent,
    loginFormSecure,
    passwordPolicyStrength,
    mfaDetected,
    accountLockoutDetected,
    passwordResetAvailable,
    score,
    recommendations,
  };
}

