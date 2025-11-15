import fetch from 'node-fetch';
import { URL } from 'url';

/**
 * Comprehensive web crawler for deep scanning
 */
export interface CrawlResult {
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  content: string;
  links: string[];
  images: string[];
  scripts: string[];
  stylesheets: string[];
  forms: Array<{
    action: string;
    method: string;
    inputs: Array<{ name: string; type: string; required: boolean }>;
  }>;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    ogTags: Record<string, string>;
    twitterTags: Record<string, string>;
  };
  performance: {
    responseTime: number;
    contentSize: number;
    loadTime: number;
  };
}

/**
 * Crawl a single page
 */
export async function crawlPage(url: string, maxDepth: number = 1, currentDepth: number = 0): Promise<CrawlResult | null> {
  if (currentDepth > maxDepth) return null;

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DomainSecurityScanner/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    } as any);

    const responseTime = Date.now() - startTime;
    const content = await response.text();
    const contentSize = Buffer.byteLength(content, 'utf8');

    // Extract links
    const links = extractLinks(content, url);
    
    // Extract images
    const images = extractImages(content, url);
    
    // Extract scripts
    const scripts = extractScripts(content, url);
    
    // Extract stylesheets
    const stylesheets = extractStylesheets(content, url);
    
    // Extract forms
    const forms = extractForms(content, url);
    
    // Extract metadata
    const metadata = extractMetadata(content);

    // Extract headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      url,
      status: response.status,
      statusText: response.statusText,
      headers,
      content,
      links,
      images,
      scripts,
      stylesheets,
      forms,
      metadata,
      performance: {
        responseTime,
        contentSize,
        loadTime: responseTime,
      },
    };
  } catch (error: any) {
    return null;
  }
}

/**
 * Deep crawl a website
 */
export async function deepCrawl(domain: string, maxPages: number = 50, maxDepth: number = 3): Promise<CrawlResult[]> {
  const baseUrl = `https://${domain}`;
  const visited = new Set<string>();
  const results: CrawlResult[] = [];
  const queue: Array<{ url: string; depth: number }> = [{ url: baseUrl, depth: 0 }];

  while (queue.length > 0 && results.length < maxPages) {
    const { url, depth } = queue.shift()!;

    if (visited.has(url) || depth > maxDepth) continue;
    visited.add(url);

    const result = await crawlPage(url, maxDepth, depth);
    if (result) {
      results.push(result);

      // Add new links to queue
      result.links.forEach(link => {
        try {
          const linkUrl = new URL(link, baseUrl);
          if (linkUrl.hostname === domain && !visited.has(linkUrl.href)) {
            queue.push({ url: linkUrl.href, depth: depth + 1 });
          }
        } catch {
          // Invalid URL, skip
        }
      });
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Extract links from HTML
 */
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const linkUrl = new URL(match[1], baseUrl);
      links.push(linkUrl.href);
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(new Set(links));
}

/**
 * Extract images from HTML
 */
function extractImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    try {
      const imgUrl = new URL(match[1], baseUrl);
      images.push(imgUrl.href);
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(new Set(images));
}

/**
 * Extract scripts from HTML
 */
function extractScripts(html: string, baseUrl: string): string[] {
  const scripts: string[] = [];
  const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const scriptUrl = new URL(match[1], baseUrl);
      scripts.push(scriptUrl.href);
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(new Set(scripts));
}

/**
 * Extract stylesheets from HTML
 */
function extractStylesheets(html: string, baseUrl: string): string[] {
  const stylesheets: string[] = [];
  const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const cssUrl = new URL(match[1], baseUrl);
      stylesheets.push(cssUrl.href);
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(new Set(stylesheets));
}

/**
 * Extract forms from HTML
 */
function extractForms(html: string, baseUrl: string): Array<{
  action: string;
  method: string;
  inputs: Array<{ name: string; type: string; required: boolean }>;
}> {
  const forms: Array<{
    action: string;
    method: string;
    inputs: Array<{ name: string; type: string; required: boolean }>;
  }> = [];
  const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
  let match;

  while ((match = formRegex.exec(html)) !== null) {
    const formHtml = match[0];
    const actionMatch = formHtml.match(/action=["']([^"']+)["']/i);
    const methodMatch = formHtml.match(/method=["']([^"']+)["']/i);
    
    const action = actionMatch ? new URL(actionMatch[1], baseUrl).href : baseUrl;
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    // Extract inputs
    const inputs: Array<{ name: string; type: string; required: boolean }> = [];
    const inputRegex = /<input[^>]*>/gi;
    let inputMatch;

    while ((inputMatch = inputRegex.exec(formHtml)) !== null) {
      const inputHtml = inputMatch[0];
      const nameMatch = inputHtml.match(/name=["']([^"']+)["']/i);
      const typeMatch = inputHtml.match(/type=["']([^"']+)["']/i);
      const required = /required/i.test(inputHtml);

      inputs.push({
        name: nameMatch ? nameMatch[1] : '',
        type: typeMatch ? typeMatch[1] : 'text',
        required,
      });
    }

    forms.push({ action, method, inputs });
  }

  return forms;
}

/**
 * Extract metadata from HTML
 */
function extractMetadata(html: string): {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
} {
  const metadata = {
    title: '',
    description: '',
    keywords: [] as string[],
    author: '',
    ogTags: {} as Record<string, string>,
    twitterTags: {} as Record<string, string>,
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract meta tags
  const metaRegex = /<meta[^>]*>/gi;
  let match;

  while ((match = metaRegex.exec(html)) !== null) {
    const metaHtml = match[0];
    const nameMatch = metaHtml.match(/name=["']([^"']+)["']/i);
    const propertyMatch = metaHtml.match(/property=["']([^"']+)["']/i);
    const contentMatch = metaHtml.match(/content=["']([^"']+)["']/i);

    if (contentMatch) {
      const content = contentMatch[1];

      if (nameMatch) {
        const name = nameMatch[1].toLowerCase();
        if (name === 'description') metadata.description = content;
        if (name === 'keywords') metadata.keywords = content.split(',').map(k => k.trim());
        if (name === 'author') metadata.author = content;
      }

      if (propertyMatch) {
        const property = propertyMatch[1].toLowerCase();
        if (property.startsWith('og:')) {
          metadata.ogTags[property] = content;
        }
      }

      if (nameMatch && nameMatch[1].toLowerCase().startsWith('twitter:')) {
        metadata.twitterTags[nameMatch[1].toLowerCase()] = content;
      }
    }
  }

  return metadata;
}

/**
 * Analyze crawl results
 */
export function analyzeCrawlResults(results: CrawlResult[]) {
  const analysis = {
    totalPages: results.length,
    totalLinks: 0,
    totalImages: 0,
    totalScripts: 0,
    totalForms: 0,
    uniqueDomains: new Set<string>(),
    averageResponseTime: 0,
    averageContentSize: 0,
    statusCodes: {} as Record<number, number>,
    securityIssues: [] as string[],
    performanceIssues: [] as string[],
    forms: [] as Array<{
      url: string;
      action: string;
      method: string;
      inputs: Array<{ name: string; type: string; required: boolean }>;
      securityIssues: string[];
    }>,
  };

  let totalResponseTime = 0;
  let totalContentSize = 0;

  results.forEach(result => {
    analysis.totalLinks += result.links.length;
    analysis.totalImages += result.images.length;
    analysis.totalScripts += result.scripts.length;
    analysis.totalForms += result.forms.length;
    totalResponseTime += result.performance.responseTime;
    totalContentSize += result.performance.contentSize;

    analysis.statusCodes[result.status] = (analysis.statusCodes[result.status] || 0) + 1;

    // Extract unique domains from links
    result.links.forEach(link => {
      try {
        const url = new URL(link);
        analysis.uniqueDomains.add(url.hostname);
      } catch {
        // Invalid URL
      }
    });

    // Check for security issues
    if (result.status === 401 || result.status === 403) {
      analysis.securityIssues.push(`Access restricted on ${result.url}`);
    }

    if (result.forms.length > 0) {
      result.forms.forEach(form => {
        const formIssues: string[] = [];
        
        // Check for insecure forms
        if (form.method === 'GET' && form.inputs.some(i => i.type === 'password')) {
          formIssues.push('Password field in GET form');
        }

        if (!form.action.startsWith('https://')) {
          formIssues.push('Form action not using HTTPS');
        }

        if (formIssues.length > 0) {
          analysis.forms.push({
            url: result.url,
            action: form.action,
            method: form.method,
            inputs: form.inputs,
            securityIssues: formIssues,
          });
        }
      });
    }

    // Check for performance issues
    if (result.performance.responseTime > 3000) {
      analysis.performanceIssues.push(`Slow response time on ${result.url}: ${result.performance.responseTime}ms`);
    }

    if (result.performance.contentSize > 5000000) {
      analysis.performanceIssues.push(`Large content size on ${result.url}: ${(result.performance.contentSize / 1024 / 1024).toFixed(2)}MB`);
    }
  });

  analysis.averageResponseTime = results.length > 0 ? totalResponseTime / results.length : 0;
  analysis.averageContentSize = results.length > 0 ? totalContentSize / results.length : 0;

  return analysis;
}

