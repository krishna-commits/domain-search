/**
 * Privacy & Compliance
 * - Cookie Categorization
 * - Privacy Policy Validation
 */

import fetch from 'node-fetch';

export interface CookieCategory {
  necessary: number;
  functional: number;
  analytics: number;
  marketing: number;
  uncategorized: number;
  total: number;
}

export interface CookieAnalysis {
  categories: CookieCategory;
  thirdPartyCookies: number;
  firstPartyCookies: number;
  cookiesWithExpiration: number;
  cookiesWithoutExpiration: number;
  recommendations: string[];
}

export interface PrivacyPolicyResult {
  privacyPolicyFound: boolean;
  privacyPolicyUrl: string | null;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  cookieConsentDetected: boolean;
  dataProcessingTransparency: boolean;
  rightToDeletion: boolean;
  score: number;
  recommendations: string[];
}

/**
 * Categorize cookies
 */
export function categorizeCookies(cookies: any[]): CookieAnalysis {
  const categories: CookieCategory = {
    necessary: 0,
    functional: 0,
    analytics: 0,
    marketing: 0,
    uncategorized: 0,
    total: cookies.length,
  };

  let thirdPartyCookies = 0;
  let firstPartyCookies = 0;
  let cookiesWithExpiration = 0;
  let cookiesWithoutExpiration = 0;

  const analyticsKeywords = ['analytics', 'ga_', '_ga', 'gtag', 'mixpanel', 'amplitude'];
  const marketingKeywords = ['ad', 'ads', 'advertising', 'marketing', 'tracking', 'doubleclick', 'facebook'];
  const functionalKeywords = ['preference', 'setting', 'language', 'theme', 'user'];

  for (const cookie of cookies) {
    const name = cookie.name.toLowerCase();
    const domain = cookie.domain || '';

    // Check if third-party
    if (domain && !domain.startsWith('.')) {
      thirdPartyCookies++;
    } else {
      firstPartyCookies++;
    }

    // Check expiration
    if (cookie.expires || cookie.maxAge) {
      cookiesWithExpiration++;
    } else {
      cookiesWithoutExpiration++;
    }

    // Categorize
    if (analyticsKeywords.some(kw => name.includes(kw))) {
      categories.analytics++;
    } else if (marketingKeywords.some(kw => name.includes(kw))) {
      categories.marketing++;
    } else if (functionalKeywords.some(kw => name.includes(kw))) {
      categories.functional++;
    } else if (name.includes('session') || name.includes('auth') || name.includes('csrf')) {
      categories.necessary++;
    } else {
      categories.uncategorized++;
    }
  }

  const recommendations: string[] = [];
  if (categories.uncategorized > 0) {
    recommendations.push('Categorize all cookies properly');
  }
  if (thirdPartyCookies > 0) {
    recommendations.push('Disclose third-party cookies in privacy policy');
  }
  if (cookiesWithoutExpiration > 0) {
    recommendations.push('Set expiration dates for all cookies');
  }
  if (categories.marketing > 0) {
    recommendations.push('Obtain explicit consent for marketing cookies');
  }

  return {
    categories,
    thirdPartyCookies,
    firstPartyCookies,
    cookiesWithExpiration,
    cookiesWithoutExpiration,
    recommendations,
  };
}

/**
 * Validate privacy policy
 */
export async function validatePrivacyPolicy(hostname: string, html: string): Promise<PrivacyPolicyResult> {
  // Look for privacy policy links
  const privacyPolicyPatterns = [
    /href=["']([^"']*privacy[^"']*)["']/i,
    /href=["']([^"']*privacy-policy[^"']*)["']/i,
    /href=["']([^"']*privacy_policy[^"']*)["']/i,
  ];

  let privacyPolicyUrl: string | null = null;
  let privacyPolicyFound = false;

  for (const pattern of privacyPolicyPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      privacyPolicyUrl = match[1].startsWith('http') 
        ? match[1] 
        : `https://${hostname}${match[1].startsWith('/') ? '' : '/'}${match[1]}`;
      privacyPolicyFound = true;
      break;
    }
  }

  // Check for GDPR compliance indicators
  const gdprIndicators = [
    /gdpr/i,
    /general.?data.?protection.?regulation/i,
    /right.?to.?erasure/i,
    /right.?to.?deletion/i,
    /data.?subject/i,
  ];

  const gdprCompliant = gdprIndicators.some(pattern => pattern.test(html));

  // Check for CCPA compliance indicators
  const ccpaIndicators = [
    /ccpa/i,
    /california.?consumer.?privacy/i,
    /do.?not.?sell/i,
    /opt.?out/i,
  ];

  const ccpaCompliant = ccpaIndicators.some(pattern => pattern.test(html));

  // Check for cookie consent
  const cookieConsentDetected = /(cookie.?consent|cookie.?banner|cookie.?notice|accept.?cookies)/i.test(html);

  // Check for data processing transparency
  const dataProcessingTransparency = /(data.?processing|how.?we.?use.?data|data.?collection)/i.test(html);

  // Check for right to deletion
  const rightToDeletion = /(right.?to.?deletion|right.?to.?erasure|delete.?my.?data|remove.?my.?data)/i.test(html);

  let score = 0;
  const recommendations: string[] = [];

  if (privacyPolicyFound) {
    score += 30;
  } else {
    recommendations.push('Add a privacy policy page');
  }

  if (gdprCompliant) {
    score += 20;
  } else {
    recommendations.push('Ensure GDPR compliance requirements are met');
  }

  if (ccpaCompliant) {
    score += 20;
  } else {
    recommendations.push('Consider CCPA compliance if serving California users');
  }

  if (cookieConsentDetected) {
    score += 15;
  } else {
    recommendations.push('Implement cookie consent mechanism');
  }

  if (dataProcessingTransparency) {
    score += 10;
  } else {
    recommendations.push('Provide clear information about data processing');
  }

  if (rightToDeletion) {
    score += 5;
  } else {
    recommendations.push('Document right to deletion process');
  }

  return {
    privacyPolicyFound,
    privacyPolicyUrl,
    gdprCompliant,
    ccpaCompliant,
    cookieConsentDetected,
    dataProcessingTransparency,
    rightToDeletion,
    score,
    recommendations,
  };
}

