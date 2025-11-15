/**
 * Web Tools
 * - Reverse Analytics Search
 * - Extract Page Links
 * - Advanced Link Analysis
 */

import fetch from 'node-fetch';

export interface WebToolsResult {
  reverseAnalytics: ReverseAnalyticsResult;
  extractedLinks: ExtractedLinksResult;
  linkAnalysis: LinkAnalysisResult;
}

export interface ReverseAnalyticsResult {
  analytics: Array<{
    service: string;
    id: string;
    found: boolean;
  }>;
  trackingScripts: string[];
  recommendations: string[];
}

export interface ExtractedLinksResult {
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: string[];
  totalLinks: number;
}

export interface LinkAnalysisResult {
  internalCount: number;
  externalCount: number;
  brokenCount: number;
  suspiciousLinks: string[];
  recommendations: string[];
}

/**
 * Reverse analytics search
 */
export async function reverseAnalyticsSearch(html: string): Promise<ReverseAnalyticsResult> {
  const analytics: Array<{ service: string; id: string; found: boolean }> = [];
  const trackingScripts: string[] = [];

  // Google Analytics
  const gaMatch = html.match(/UA-[\d-]+|G-[A-Z0-9]+/i);
  if (gaMatch) {
    analytics.push({
      service: 'Google Analytics',
      id: gaMatch[0],
      found: true,
    });
  }

  // Google Tag Manager
  if (/GTM-[A-Z0-9]+/i.test(html)) {
    const gtmMatch = html.match(/GTM-[A-Z0-9]+/i);
    analytics.push({
      service: 'Google Tag Manager',
      id: gtmMatch ? gtmMatch[0] : '',
      found: true,
    });
  }

  // Facebook Pixel
  if (/fbq|facebook.*pixel/i.test(html)) {
    const fbMatch = html.match(/\d{15,16}/);
    analytics.push({
      service: 'Facebook Pixel',
      id: fbMatch ? fbMatch[0] : '',
      found: true,
    });
  }

  // Other tracking scripts
  const trackingPatterns = [
    /mixpanel/i,
    /amplitude/i,
    /segment/i,
    /hotjar/i,
    /intercom/i,
  ];

  for (const pattern of trackingPatterns) {
    if (pattern.test(html)) {
      trackingScripts.push(pattern.source);
    }
  }

  const recommendations: string[] = [];
  if (analytics.length > 0) {
    recommendations.push('Multiple analytics services detected - consider consolidating');
  }
  if (trackingScripts.length > 0) {
    recommendations.push('Review tracking scripts for privacy compliance');
  }

  return {
    analytics,
    trackingScripts,
    recommendations,
  };
}

/**
 * Extract page links
 */
export async function extractPageLinks(hostname: string, html: string): Promise<ExtractedLinksResult> {
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  const brokenLinks: string[] = [];

  // Extract all links
  const linkPattern = /href=["']([^"']+)["']/gi;
  const matches = html.matchAll(linkPattern);

  const allLinks = new Set<string>();
  for (const match of matches) {
    const url = match[1];
    if (url && !url.startsWith('#') && !url.startsWith('javascript:')) {
      allLinks.add(url);
    }
  }

  // Categorize links
  for (const link of allLinks) {
    if (link.startsWith('http://') || link.startsWith('https://')) {
      if (link.includes(hostname)) {
        internalLinks.push(link);
      } else {
        externalLinks.push(link);
      }
    } else if (link.startsWith('/')) {
      internalLinks.push(`https://${hostname}${link}`);
    } else {
      internalLinks.push(`https://${hostname}/${link}`);
    }
  }

  // Check for broken links (simplified)
  const linksToCheck = [...internalLinks, ...externalLinks].slice(0, 20);
  for (const link of linksToCheck) {
    try {
      const response = await fetch(link, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok && response.status >= 400) {
        brokenLinks.push(link);
      }
    } catch (error) {
      brokenLinks.push(link);
    }
  }

  return {
    internalLinks: Array.from(new Set(internalLinks)),
    externalLinks: Array.from(new Set(externalLinks)),
    brokenLinks,
    totalLinks: allLinks.size,
  };
}

/**
 * Analyze links
 */
export async function analyzeLinks(hostname: string, html: string): Promise<LinkAnalysisResult> {
  const extracted = await extractPageLinks(hostname, html);

  const suspiciousLinks: string[] = [];
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /goo\.gl/i,
    /t\.co/i,
  ];

  for (const link of [...extracted.externalLinks, ...extracted.internalLinks]) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(link)) {
        suspiciousLinks.push(link);
      }
    }
  }

  const recommendations: string[] = [];
  if (extracted.brokenLinks.length > 0) {
    recommendations.push(`Fix ${extracted.brokenLinks.length} broken links`);
  }
  if (suspiciousLinks.length > 0) {
    recommendations.push('Review suspicious shortened URLs');
  }
  if (extracted.externalLinks.length > extracted.internalLinks.length) {
    recommendations.push('High number of external links - ensure they are trustworthy');
  }

  return {
    internalCount: extracted.internalLinks.length,
    externalCount: extracted.externalLinks.length,
    brokenCount: extracted.brokenLinks.length,
    suspiciousLinks,
    recommendations,
  };
}

/**
 * Get all web tools results
 */
export async function getWebToolsResults(hostname: string, html: string): Promise<WebToolsResult> {
  const [reverseAnalytics, extractedLinks, linkAnalysis] = await Promise.all([
    reverseAnalyticsSearch(html),
    extractPageLinks(hostname, html),
    analyzeLinks(hostname, html),
  ]);

  return {
    reverseAnalytics,
    extractedLinks,
    linkAnalysis,
  };
}

