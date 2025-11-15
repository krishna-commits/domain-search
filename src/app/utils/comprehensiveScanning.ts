/**
 * Comprehensive Scanning Features
 * - Deep Website Analysis
 * - Content Analysis
 * - Metadata Extraction
 * - Link Analysis
 * - Form Analysis
 * - API Discovery
 * - Technology Detection
 * - Security Headers Deep Dive
 * - Performance Metrics
 * - SEO Analysis
 */

import fetch from 'node-fetch';
import { parse as parseHTML } from 'node-html-parser';

export interface ComprehensiveScanResult {
  website: {
    title: string;
    description: string;
    keywords: string[];
    language: string;
    charset: string;
    viewport: string;
    robots: string;
    canonical: string;
    ogTags: Record<string, string>;
    twitterTags: Record<string, string>;
    schemaMarkup: any[];
  };
  content: {
    totalPages: number;
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    brokenLinks: number;
    images: number;
    videos: number;
    forms: number;
    scripts: number;
    stylesheets: number;
    wordCount: number;
    averagePageSize: number;
  };
  links: {
    internal: Array<{ url: string; text: string; status: number }>;
    external: Array<{ url: string; text: string; status: number }>;
    broken: Array<{ url: string; text: string; status: number; error: string }>;
  };
  forms: Array<{
    action: string;
    method: string;
    fields: Array<{ name: string; type: string; required: boolean }>;
    security: {
      hasCSRF: boolean;
      hasHoneypot: boolean;
      hasValidation: boolean;
    };
  }>;
  apis: Array<{
    endpoint: string;
    method: string;
    parameters: string[];
    authentication: string[];
  }>;
  technologies: {
    cms: string[];
    frameworks: string[];
    libraries: string[];
    servers: string[];
    databases: string[];
    cdn: string[];
    analytics: string[];
    advertising: string[];
  };
  security: {
    headers: Record<string, { present: boolean; value: string; grade: string }>;
    cookies: {
      total: number;
      secure: number;
      httpOnly: number;
      sameSite: number;
      issues: string[];
    };
    vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
      location: string;
    }>;
  };
  performance: {
    pageLoadTime: number;
    totalSize: number;
    imageSize: number;
    scriptSize: number;
    stylesheetSize: number;
    compression: boolean;
    caching: boolean;
    minification: boolean;
  };
  seo: {
    score: number;
    issues: string[];
    recommendations: string[];
    metaTags: {
      title: boolean;
      description: boolean;
      keywords: boolean;
      ogTags: boolean;
      twitterTags: boolean;
    };
    content: {
      headings: { h1: number; h2: number; h3: number };
      images: { total: number; withAlt: number; withoutAlt: number };
      links: { total: number; internal: number; external: number };
    };
  };
  metadata: {
    emails: string[];
    phoneNumbers: string[];
    addresses: string[];
    socialMedia: string[];
    apiKeys: string[];
    secrets: string[];
  };
}

/**
 * Perform comprehensive scan
 */
export async function performComprehensiveScan(
  domain: string,
  html: string,
  headers: any,
  cookies: any[]
): Promise<ComprehensiveScanResult> {
  const root = parseHTML(html);
  
  // Website metadata
  const website = extractWebsiteMetadata(root, html);
  
  // Content analysis
  const content = analyzeContent(root, html);
  
  // Link analysis
  const links = await analyzeLinks(root, domain);
  
  // Form analysis
  const forms = analyzeForms(root);
  
  // API discovery
  const apis = discoverAPIs(root, html);
  
  // Technology detection
  const technologies = detectTechnologies(root, html, headers);
  
  // Security analysis
  const security = analyzeSecurity(headers, cookies);
  
  // Performance analysis
  const performance = analyzePerformance(html, headers);
  
  // SEO analysis
  const seo = analyzeSEO(root, html);
  
  // Metadata extraction
  const metadata = extractMetadata(html);
  
  return {
    website,
    content,
    links,
    forms,
    apis,
    technologies,
    security,
    performance,
    seo,
    metadata,
  };
}

/**
 * Extract website metadata
 */
function extractWebsiteMetadata(root: any, html: string): ComprehensiveScanResult['website'] {
  const title = root.querySelector('title')?.text || '';
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const keywords = root.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',') || [];
  const language = root.querySelector('html')?.getAttribute('lang') || '';
  const charset = root.querySelector('meta[charset]')?.getAttribute('charset') || '';
  const viewport = root.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  
  const ogTags: Record<string, string> = {};
  root.querySelectorAll('meta[property^="og:"]').forEach((meta: any) => {
    const property = meta.getAttribute('property')?.replace('og:', '') || '';
    const content = meta.getAttribute('content') || '';
    if (property && content) ogTags[property] = content;
  });
  
  const twitterTags: Record<string, string> = {};
  root.querySelectorAll('meta[name^="twitter:"]').forEach((meta: any) => {
    const name = meta.getAttribute('name')?.replace('twitter:', '') || '';
    const content = meta.getAttribute('content') || '';
    if (name && content) twitterTags[name] = content;
  });
  
  const schemaMarkup: any[] = [];
  root.querySelectorAll('script[type="application/ld+json"]').forEach((script: any) => {
    try {
      const json = JSON.parse(script.text);
      schemaMarkup.push(json);
    } catch (e) {
      // Invalid JSON
    }
  });
  
  return {
    title,
    description,
    keywords,
    language,
    charset,
    viewport,
    robots,
    canonical,
    ogTags,
    twitterTags,
    schemaMarkup,
  };
}

/**
 * Analyze content
 */
function analyzeContent(root: any, html: string): ComprehensiveScanResult['content'] {
  const links = root.querySelectorAll('a');
  const images = root.querySelectorAll('img');
  const videos = root.querySelectorAll('video');
  const forms = root.querySelectorAll('form');
  const scripts = root.querySelectorAll('script');
  const stylesheets = root.querySelectorAll('link[rel="stylesheet"]');
  
  const text = root.text || '';
  const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
  
  return {
    totalPages: 1, // Would need to crawl for actual count
    totalLinks: links.length,
    internalLinks: 0, // Would need domain check
    externalLinks: 0, // Would need domain check
    brokenLinks: 0, // Would need to check each link
    images: images.length,
    videos: videos.length,
    forms: forms.length,
    scripts: scripts.length,
    stylesheets: stylesheets.length,
    wordCount,
    averagePageSize: html.length,
  };
}

/**
 * Analyze links
 */
async function analyzeLinks(root: any, domain: string): Promise<ComprehensiveScanResult['links']> {
  const links = root.querySelectorAll('a');
  const internal: Array<{ url: string; text: string; status: number }> = [];
  const external: Array<{ url: string; text: string; status: number }> = [];
  const broken: Array<{ url: string; text: string; status: number; error: string }> = [];
  
  for (const link of links.slice(0, 50)) { // Limit to 50 for performance
    const href = link.getAttribute('href') || '';
    const text = link.text || '';
    
    if (!href || href.startsWith('#')) continue;
    
    const isInternal = href.startsWith('/') || href.includes(domain);
    const fullUrl = href.startsWith('http') ? href : `https://${domain}${href.startsWith('/') ? '' : '/'}${href}`;
    
    try {
      const response = await fetch(fullUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      const status = response.status;
      
      if (status >= 200 && status < 400) {
        if (isInternal) {
          internal.push({ url: href, text, status });
        } else {
          external.push({ url: href, text, status });
        }
      } else {
        broken.push({ url: href, text, status, error: `HTTP ${status}` });
      }
    } catch (error) {
      broken.push({ url: href, text, status: 0, error: 'Connection failed' });
    }
  }
  
  return { internal, external, broken };
}

/**
 * Analyze forms
 */
function analyzeForms(root: any): ComprehensiveScanResult['forms'] {
  const forms = root.querySelectorAll('form');
  const formData: ComprehensiveScanResult['forms'] = [];
  
  forms.forEach((form: any) => {
    const action = form.getAttribute('action') || '';
    const method = form.getAttribute('method')?.toUpperCase() || 'GET';
    const fields: Array<{ name: string; type: string; required: boolean }> = [];
    
    form.querySelectorAll('input, select, textarea').forEach((field: any) => {
      const name = field.getAttribute('name') || '';
      const type = field.getAttribute('type') || field.tagName.toLowerCase();
      const required = field.hasAttribute('required');
      if (name) {
        fields.push({ name, type, required });
      }
    });
    
    const formHtml = form.innerHTML;
    const hasCSRF = /csrf|_token|authenticity_token/i.test(formHtml);
    const hasHoneypot = /honeypot|spam.*field/i.test(formHtml);
    const hasValidation = form.querySelectorAll('[required], [pattern], [min], [max]').length > 0;
    
    formData.push({
      action,
      method,
      fields,
      security: {
        hasCSRF,
        hasHoneypot,
        hasValidation,
      },
    });
  });
  
  return formData;
}

/**
 * Discover APIs
 */
function discoverAPIs(root: any, html: string): ComprehensiveScanResult['apis'] {
  const apis: ComprehensiveScanResult['apis'] = [];
  
  // Find API endpoints in scripts
  const apiPatterns = [
    /fetch\(['"]([^'"]+)['"]/g,
    /axios\.(get|post|put|delete)\(['"]([^'"]+)['"]/g,
    /\.ajax\(['"]([^'"]+)['"]/g,
    /api\/v\d+\/[^'"\s]+/g,
  ];
  
  apiPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const endpoint = match[1] || match[2] || match[0];
      if (endpoint && endpoint.startsWith('/') || endpoint.startsWith('http')) {
        apis.push({
          endpoint,
          method: 'GET', // Would need to detect from context
          parameters: [],
          authentication: [],
        });
      }
    }
  });
  
  return apis;
}

/**
 * Detect technologies
 */
function detectTechnologies(root: any, html: string, headers: any): ComprehensiveScanResult['technologies'] {
  const technologies: ComprehensiveScanResult['technologies'] = {
    cms: [],
    frameworks: [],
    libraries: [],
    servers: [],
    databases: [],
    cdn: [],
    analytics: [],
    advertising: [],
  };
  
  // CMS detection
  if (/wp-content|wp-includes|wordpress/i.test(html)) technologies.cms.push('WordPress');
  if (/drupal/i.test(html)) technologies.cms.push('Drupal');
  if (/joomla/i.test(html)) technologies.cms.push('Joomla');
  if (/shopify/i.test(html)) technologies.cms.push('Shopify');
  
  // Framework detection
  if (/react|react-dom/i.test(html)) technologies.frameworks.push('React');
  if (/angular/i.test(html)) technologies.frameworks.push('Angular');
  if (/vue\.js|vuejs/i.test(html)) technologies.frameworks.push('Vue.js');
  if (/jquery/i.test(html)) technologies.libraries.push('jQuery');
  
  // Server detection
  const server = headers.get('server') || '';
  if (server) technologies.servers.push(server);
  
  // CDN detection
  if (/cloudflare|cloudfront|fastly|akamai/i.test(html) || headers.get('cf-ray')) {
    technologies.cdn.push('CDN Detected');
  }
  
  // Analytics detection
  if (/google.*analytics|gtag|ga\(/i.test(html)) technologies.analytics.push('Google Analytics');
  if (/mixpanel/i.test(html)) technologies.analytics.push('Mixpanel');
  
  // Advertising detection
  if (/google.*ads|adsense|doubleclick/i.test(html)) technologies.advertising.push('Google Ads');
  if (/facebook.*pixel/i.test(html)) technologies.advertising.push('Facebook Pixel');
  
  return technologies;
}

/**
 * Analyze security
 */
function analyzeSecurity(headers: any, cookies: any[]): ComprehensiveScanResult['security'] {
  const securityHeaders: Record<string, { present: boolean; value: string; grade: string }> = {};
  const headerNames = [
    'content-security-policy',
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'referrer-policy',
    'permissions-policy',
  ];
  
  headerNames.forEach(header => {
    const value = headers.get(header) || '';
    securityHeaders[header] = {
      present: !!value,
      value,
      grade: value ? 'A' : 'F',
    };
  });
  
  const cookieStats = {
    total: cookies.length,
    secure: cookies.filter((c: any) => c.secure).length,
    httpOnly: cookies.filter((c: any) => c.httpOnly).length,
    sameSite: cookies.filter((c: any) => c.sameSite).length,
    issues: [] as string[],
  };
  
  cookies.forEach((cookie: any) => {
    if (!cookie.secure) cookieStats.issues.push(`Cookie "${cookie.name}" missing Secure flag`);
    if (!cookie.httpOnly) cookieStats.issues.push(`Cookie "${cookie.name}" missing HttpOnly flag`);
  });
  
  return {
    headers: securityHeaders,
    cookies: cookieStats,
    vulnerabilities: [], // Would be populated by vulnerability scanner
  };
}

/**
 * Analyze performance
 */
function analyzePerformance(html: string, headers: any): ComprehensiveScanResult['performance'] {
  const totalSize = html.length;
  const imageSize = 0; // Would need to fetch images
  const scriptSize = 0; // Would need to fetch scripts
  const stylesheetSize = 0; // Would need to fetch stylesheets
  
  const compression = headers.get('content-encoding') === 'gzip' || headers.get('content-encoding') === 'br';
  const caching = !!headers.get('cache-control') || !!headers.get('expires');
  const minification = !html.includes('\n') || html.split('\n').length < 10;
  
  return {
    pageLoadTime: 0, // Would need to measure
    totalSize,
    imageSize,
    scriptSize,
    stylesheetSize,
    compression,
    caching,
    minification,
  };
}

/**
 * Analyze SEO
 */
function analyzeSEO(root: any, html: string): ComprehensiveScanResult['seo'] {
  const title = root.querySelector('title');
  const description = root.querySelector('meta[name="description"]');
  const keywords = root.querySelector('meta[name="keywords"]');
  const ogTags = root.querySelectorAll('meta[property^="og:"]');
  const twitterTags = root.querySelectorAll('meta[name^="twitter:"]');
  
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!title) {
    score -= 20;
    issues.push('Missing title tag');
    recommendations.push('Add a descriptive title tag');
  }
  
  if (!description) {
    score -= 20;
    issues.push('Missing meta description');
    recommendations.push('Add a meta description');
  }
  
  const h1 = root.querySelectorAll('h1');
  if (h1.length === 0) {
    score -= 10;
    issues.push('Missing H1 tag');
    recommendations.push('Add an H1 tag');
  } else if (h1.length > 1) {
    score -= 5;
    issues.push('Multiple H1 tags');
    recommendations.push('Use only one H1 tag per page');
  }
  
  const images = root.querySelectorAll('img');
  const imagesWithoutAlt = images.filter((img: any) => !img.getAttribute('alt'));
  if (imagesWithoutAlt.length > 0) {
    score -= 10;
    issues.push(`${imagesWithoutAlt.length} images without alt text`);
    recommendations.push('Add alt text to all images');
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    metaTags: {
      title: !!title,
      description: !!description,
      keywords: !!keywords,
      ogTags: ogTags.length > 0,
      twitterTags: twitterTags.length > 0,
    },
    content: {
      headings: {
        h1: root.querySelectorAll('h1').length,
        h2: root.querySelectorAll('h2').length,
        h3: root.querySelectorAll('h3').length,
      },
      images: {
        total: images.length,
        withAlt: images.length - imagesWithoutAlt.length,
        withoutAlt: imagesWithoutAlt.length,
      },
      links: {
        total: root.querySelectorAll('a').length,
        internal: 0, // Would need domain check
        external: 0, // Would need domain check
      },
    },
  };
}

/**
 * Extract metadata
 */
function extractMetadata(html: string): ComprehensiveScanResult['metadata'] {
  const emails: string[] = [];
  const phoneNumbers: string[] = [];
  const addresses: string[] = [];
  const socialMedia: string[] = [];
  const apiKeys: string[] = [];
  const secrets: string[] = [];
  
  // Extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = html.match(emailRegex);
  if (emailMatches) emails.push(...emailMatches);
  
  // Extract phone numbers
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatches = html.match(phoneRegex);
  if (phoneMatches) phoneNumbers.push(...phoneMatches);
  
  // Extract social media links
  const socialRegex = /(facebook|twitter|linkedin|instagram|youtube)\.com\/[^\s"']+/gi;
  const socialMatches = html.match(socialRegex);
  if (socialMatches) socialMedia.push(...socialMatches);
  
  // Extract potential API keys
  const apiKeyRegex = /(api[_-]?key|apikey|api_key)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi;
  const apiKeyMatches = html.match(apiKeyRegex);
  if (apiKeyMatches) apiKeys.push(...apiKeyMatches);
  
  // Extract potential secrets
  const secretRegex = /(secret|password|token)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{10,})['"]?/gi;
  const secretMatches = html.match(secretRegex);
  if (secretMatches) secrets.push(...secretMatches);
  
  return {
    emails: [...new Set(emails)],
    phoneNumbers: [...new Set(phoneNumbers)],
    addresses,
    socialMedia: [...new Set(socialMedia)],
    apiKeys: [...new Set(apiKeys)],
    secrets: [...new Set(secrets)],
  };
}

