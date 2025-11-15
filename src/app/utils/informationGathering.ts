import fetch from 'node-fetch';
import { URL } from 'url';

/**
 * Comprehensive information gathering for deep scanning
 */

/**
 * Check robots.txt
 */
export async function checkRobotsTxt(domain: string) {
  try {
    const url = `https://${domain}/robots.txt`;
    const response = await fetch(url, { timeout: 5000 } as any);
    
    if (!response.ok) {
      return {
        found: false,
        content: null,
        analysis: {
          userAgents: [] as string[],
          disallowed: [] as Array<{ userAgent: string; path: string }>,
          allowed: [] as Array<{ userAgent: string; path: string }>,
          sitemaps: [] as string[],
          issues: [] as string[],
        },
      };
    }

    const content = await response.text();
    const analysis = parseRobotsTxt(content);

    return {
      found: true,
      content,
      analysis,
    };
  } catch {
    return {
      found: false,
      content: null,
      analysis: {
        userAgents: [],
        disallowed: [],
        allowed: [],
        sitemaps: [],
        issues: [],
      },
    };
  }
}

/**
 * Parse robots.txt
 */
function parseRobotsTxt(content: string) {
  const analysis = {
    userAgents: [] as string[],
    disallowed: [] as Array<{ userAgent: string; path: string }>,
    allowed: [] as Array<{ userAgent: string; path: string }>,
    sitemaps: [] as string[],
    issues: [] as string[],
  };

  const lines = content.split('\n');
  let currentUserAgent = '*';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [directive, ...valueParts] = trimmed.split(':');
    const value = valueParts.join(':').trim();

    if (directive.toLowerCase() === 'user-agent') {
      currentUserAgent = value;
      if (!analysis.userAgents.includes(value)) {
        analysis.userAgents.push(value);
      }
    } else if (directive.toLowerCase() === 'disallow') {
      if (value) {
        analysis.disallowed.push({ userAgent: currentUserAgent, path: value });
      } else {
        analysis.issues.push('Empty Disallow directive');
      }
    } else if (directive.toLowerCase() === 'allow') {
      if (value) {
        analysis.allowed.push({ userAgent: currentUserAgent, path: value });
      }
    } else if (directive.toLowerCase() === 'sitemap') {
      analysis.sitemaps.push(value);
    }
  });

  return analysis;
}

/**
 * Check sitemap.xml
 */
export async function checkSitemap(domain: string) {
  try {
    const sitemapUrls = [
      `https://${domain}/sitemap.xml`,
      `https://${domain}/sitemap_index.xml`,
      `https://${domain}/sitemaps/sitemap.xml`,
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, { timeout: 5000 } as any);
        if (response.ok) {
          const content = await response.text();
          const analysis = parseSitemap(content);
          return {
            found: true,
            url: sitemapUrl,
            content,
            analysis,
          };
        }
      } catch {
        continue;
      }
    }

    return {
      found: false,
      url: null,
      content: null,
      analysis: {
        urls: [],
        lastModified: [],
        priorities: [],
        changeFrequencies: [],
      },
    };
  } catch {
    return {
      found: false,
      url: null,
      content: null,
      analysis: {
        urls: [],
        lastModified: [],
        priorities: [],
        changeFrequencies: [],
      },
    };
  }
}

/**
 * Parse sitemap.xml
 */
function parseSitemap(content: string) {
  const analysis = {
    urls: [] as string[],
    lastModified: [] as string[],
    priorities: [] as number[],
    changeFrequencies: [] as string[],
  };

  // Simple XML parsing (in production, use a proper XML parser)
  const urlRegex = /<loc>(.*?)<\/loc>/gi;
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/gi;
  const priorityRegex = /<priority>(.*?)<\/priority>/gi;
  const changefreqRegex = /<changefreq>(.*?)<\/changefreq>/gi;

  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    analysis.urls.push(match[1]);
  }

  while ((match = lastmodRegex.exec(content)) !== null) {
    analysis.lastModified.push(match[1]);
  }

  while ((match = priorityRegex.exec(content)) !== null) {
    analysis.priorities.push(parseFloat(match[1]));
  }

  while ((match = changefreqRegex.exec(content)) !== null) {
    analysis.changeFrequencies.push(match[1]);
  }

  return analysis;
}

/**
 * Check common files and directories
 */
export async function checkCommonFiles(domain: string) {
  const commonFiles = [
    '/.well-known/security.txt',
    '/.well-known/robots.txt',
    '/.well-known/assetlinks.json',
    '/.well-known/apple-app-site-association',
    '/.git/config',
    '/.env',
    '/.htaccess',
    '/.htpasswd',
    '/backup',
    '/backups',
    '/admin',
    '/administrator',
    '/wp-admin',
    '/wp-login.php',
    '/phpinfo.php',
    '/test',
    '/test.php',
    '/config.php',
    '/database.php',
    '/.DS_Store',
    '/package.json',
    '/composer.json',
    '/.gitignore',
    '/README.md',
    '/LICENSE',
    '/CHANGELOG.md',
  ];

  const found: Array<{ path: string; status: number; accessible: boolean }> = [];

  for (const file of commonFiles) {
    try {
      const url = `https://${domain}${file}`;
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 3000,
      } as any);

      if (response.ok || response.status === 401 || response.status === 403) {
        found.push({
          path: file,
          status: response.status,
          accessible: response.ok,
        });
      }
    } catch {
      // File not found or inaccessible
    }
  }

  return {
    checked: commonFiles.length,
    found: found.length,
    files: found,
    riskLevel: found.length > 5 ? 'high' : found.length > 2 ? 'medium' : 'low',
  };
}

/**
 * Check API endpoints
 */
export async function discoverAPIEndpoints(domain: string, html: string) {
  const endpoints: string[] = [];
  const baseUrl = `https://${domain}`;

  // Common API patterns
  const apiPatterns = [
    /\/api\/[a-zA-Z0-9\/_-]+/gi,
    /\/v\d+\/[a-zA-Z0-9\/_-]+/gi,
    /\/graphql/gi,
    /\/rest\/[a-zA-Z0-9\/_-]+/gi,
    /\/json\/[a-zA-Z0-9\/_-]+/gi,
  ];

  apiPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const endpoint = match[0];
        const url = new URL(endpoint, baseUrl);
        if (!endpoints.includes(url.pathname)) {
          endpoints.push(url.pathname);
        }
      } catch {
        // Invalid URL
      }
    }
  });

  // Check for API calls in JavaScript
  const jsApiPatterns = [
    /fetch\(["']([^"']+)["']\)/gi,
    /axios\.(get|post|put|delete)\(["']([^"']+)["']\)/gi,
    /\.ajax\(["']([^"']+)["']\)/gi,
    /XMLHttpRequest.*open\(["'](GET|POST|PUT|DELETE)["'],\s*["']([^"']+)["']\)/gi,
  ];

  jsApiPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const endpoint = match[1] || match[2];
        if (endpoint && endpoint.startsWith('/')) {
          const url = new URL(endpoint, baseUrl);
          if (!endpoints.includes(url.pathname)) {
            endpoints.push(url.pathname);
          }
        }
      } catch {
        // Invalid URL
      }
    }
  });

  return {
    endpoints: Array.from(new Set(endpoints)),
    count: endpoints.length,
  };
}

/**
 * Extract social media presence
 */
export function extractSocialMedia(html: string) {
  const socialMedia = {
    facebook: [] as string[],
    twitter: [] as string[],
    linkedin: [] as string[],
    instagram: [] as string[],
    youtube: [] as string[],
    github: [] as string[],
    other: [] as string[],
  };

  // Facebook
  const facebookRegex = /(?:facebook\.com|fb\.com)\/([a-zA-Z0-9._-]+)/gi;
  let match;
  while ((match = facebookRegex.exec(html)) !== null) {
    socialMedia.facebook.push(match[0]);
  }

  // Twitter
  const twitterRegex = /(?:twitter\.com|x\.com)\/([a-zA-Z0-9._-]+)/gi;
  while ((match = twitterRegex.exec(html)) !== null) {
    socialMedia.twitter.push(match[0]);
  }

  // LinkedIn
  const linkedinRegex = /linkedin\.com\/(?:company|in)\/([a-zA-Z0-9._-]+)/gi;
  while ((match = linkedinRegex.exec(html)) !== null) {
    socialMedia.linkedin.push(match[0]);
  }

  // Instagram
  const instagramRegex = /instagram\.com\/([a-zA-Z0-9._-]+)/gi;
  while ((match = instagramRegex.exec(html)) !== null) {
    socialMedia.instagram.push(match[0]);
  }

  // YouTube
  const youtubeRegex = /(?:youtube\.com|youtu\.be)\/([a-zA-Z0-9._-]+)/gi;
  while ((match = youtubeRegex.exec(html)) !== null) {
    socialMedia.youtube.push(match[0]);
  }

  // GitHub
  const githubRegex = /github\.com\/([a-zA-Z0-9._-]+)/gi;
  while ((match = githubRegex.exec(html)) !== null) {
    socialMedia.github.push(match[0]);
  }

  // Other social media
  const otherRegex = /(?:pinterest|tumblr|reddit|snapchat|tiktok)\.com\/([a-zA-Z0-9._-]+)/gi;
  while ((match = otherRegex.exec(html)) !== null) {
    socialMedia.other.push(match[0]);
  }

  // Remove duplicates
  Object.keys(socialMedia).forEach(key => {
    socialMedia[key as keyof typeof socialMedia] = Array.from(new Set(socialMedia[key as keyof typeof socialMedia]));
  });

  return socialMedia;
}

/**
 * Analyze website structure
 */
export function analyzeWebsiteStructure(crawlResults: any[]) {
  const structure = {
    totalPages: crawlResults.length,
    depth: calculateMaxDepth(crawlResults),
    averageLinksPerPage: 0,
    averageImagesPerPage: 0,
    averageScriptsPerPage: 0,
    averageFormsPerPage: 0,
    pageTypes: {} as Record<string, number>,
    commonPaths: [] as Array<{ path: string; count: number }>,
    orphanedPages: [] as string[],
  };

  let totalLinks = 0;
  let totalImages = 0;
  let totalScripts = 0;
  let totalForms = 0;
  const pathCounts: Record<string, number> = {};
  const allLinks = new Set<string>();

  crawlResults.forEach(result => {
    totalLinks += result.links.length;
    totalImages += result.images.length;
    totalScripts += result.scripts.length;
    totalForms += result.forms.length;

    // Count paths
    try {
      const url = new URL(result.url);
      const path = url.pathname;
      pathCounts[path] = (pathCounts[path] || 0) + 1;

      // Determine page type
      if (path.endsWith('.html') || path.endsWith('.htm')) {
        structure.pageTypes['HTML'] = (structure.pageTypes['HTML'] || 0) + 1;
      } else if (path.endsWith('.php')) {
        structure.pageTypes['PHP'] = (structure.pageTypes['PHP'] || 0) + 1;
      } else if (path.endsWith('.asp') || path.endsWith('.aspx')) {
        structure.pageTypes['ASP'] = (structure.pageTypes['ASP'] || 0) + 1;
      } else {
        structure.pageTypes['Other'] = (structure.pageTypes['Other'] || 0) + 1;
      }
    } catch {
      // Invalid URL
    }

    // Collect all links
    result.links.forEach((link: string) => allLinks.add(link));
  });

  structure.averageLinksPerPage = crawlResults.length > 0 ? totalLinks / crawlResults.length : 0;
  structure.averageImagesPerPage = crawlResults.length > 0 ? totalImages / crawlResults.length : 0;
  structure.averageScriptsPerPage = crawlResults.length > 0 ? totalScripts / crawlResults.length : 0;
  structure.averageFormsPerPage = crawlResults.length > 0 ? totalForms / crawlResults.length : 0;

  // Find common paths
  structure.commonPaths = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Find orphaned pages (pages not linked from anywhere)
  crawlResults.forEach(result => {
    if (!allLinks.has(result.url)) {
      structure.orphanedPages.push(result.url);
    }
  });

  return structure;
}

/**
 * Calculate maximum depth
 */
function calculateMaxDepth(crawlResults: any[]): number {
  let maxDepth = 0;
  crawlResults.forEach(result => {
    try {
      const url = new URL(result.url);
      const depth = url.pathname.split('/').filter(p => p).length;
      maxDepth = Math.max(maxDepth, depth);
    } catch {
      // Invalid URL
    }
  });
  return maxDepth;
}

/**
 * Check for exposed sensitive information
 */
export function checkExposedInformation(html: string, headers: Record<string, string>) {
  const exposed: Array<{ type: string; value: string; severity: 'low' | 'medium' | 'high' }> = [];

  // Check for email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let match;
  while ((match = emailRegex.exec(html)) !== null) {
    exposed.push({
      type: 'Email',
      value: match[0],
      severity: 'medium',
    });
  }

  // Check for phone numbers
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  while ((match = phoneRegex.exec(html)) !== null) {
    exposed.push({
      type: 'Phone',
      value: match[0],
      severity: 'low',
    });
  }

  // Check for API keys (common patterns)
  const apiKeyPatterns = [
    { pattern: /api[_-]?key["']?\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,})["']?/gi, type: 'API Key', severity: 'high' as const },
    { pattern: /aws[_-]?access[_-]?key[_-]?id["']?\s*[:=]\s*["']?([A-Z0-9]{20})["']?/gi, type: 'AWS Access Key', severity: 'high' as const },
    { pattern: /aws[_-]?secret[_-]?access[_-]?key["']?\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi, type: 'AWS Secret Key', severity: 'high' as const },
    { pattern: /github[_-]?token["']?\s*[:=]\s*["']?([a-zA-Z0-9_-]{36})["']?/gi, type: 'GitHub Token', severity: 'high' as const },
  ];

  apiKeyPatterns.forEach(({ pattern, type, severity }) => {
    while ((match = pattern.exec(html)) !== null) {
      exposed.push({
        type,
        value: match[1],
        severity,
      });
    }
  });

  // Check headers for sensitive information
  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('token')) {
      exposed.push({
        type: `Header: ${key}`,
        value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
        severity: 'high',
      });
    }
  });

  return {
    found: exposed.length > 0,
    count: exposed.length,
    items: exposed,
    riskLevel: exposed.some(e => e.severity === 'high') ? 'high' : exposed.some(e => e.severity === 'medium') ? 'medium' : 'low',
  };
}

