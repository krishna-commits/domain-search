import fetch from 'node-fetch';

/**
 * Website performance analysis
 */
export async function analyzePerformance(url: string) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DomainSecurityScanner/1.0)',
      },
      timeout: 10000,
    } as any);

    const responseTime = Date.now() - startTime;
    const content = await response.text();
    const contentSize = Buffer.byteLength(content, 'utf8');
    const headers = response.headers;

    // Analyze HTML content
    const htmlAnalysis = analyzeHTMLPerformance(content);

    // Calculate performance metrics
    const metrics = {
      responseTime,
      contentSize,
      contentSizeKB: (contentSize / 1024).toFixed(2),
      contentSizeMB: (contentSize / 1024 / 1024).toFixed(2),
      statusCode: response.status,
      headers: {
        contentType: headers.get('content-type') || '',
        contentEncoding: headers.get('content-encoding') || '',
        cacheControl: headers.get('cache-control') || '',
        expires: headers.get('expires') || '',
        lastModified: headers.get('last-modified') || '',
        etag: headers.get('etag') || '',
      },
      compression: {
        enabled: !!headers.get('content-encoding'),
        type: headers.get('content-encoding') || 'none',
      },
      caching: {
        enabled: !!headers.get('cache-control') || !!headers.get('expires'),
        maxAge: extractMaxAge(headers.get('cache-control') || ''),
      },
      performance: {
        grade: calculatePerformanceGrade(responseTime, contentSize),
        recommendations: generatePerformanceRecommendations(responseTime, contentSize, headers as any),
      },
      htmlAnalysis,
    };

    return metrics;
  } catch (error: any) {
    return {
      responseTime: Date.now() - startTime,
      contentSize: 0,
      error: error.message,
      performance: {
        grade: 'F',
        recommendations: ['Failed to analyze performance'],
      },
    };
  }
}

/**
 * Analyze HTML performance
 */
function analyzeHTMLPerformance(html: string) {
  const analysis = {
    totalSize: html.length,
    images: {
      count: 0,
      totalSize: 0,
      unoptimized: [] as string[],
    },
    scripts: {
      count: 0,
      totalSize: 0,
      blocking: [] as string[],
    },
    stylesheets: {
      count: 0,
      totalSize: 0,
      blocking: [] as string[],
    },
    inlineStyles: {
      count: 0,
      totalSize: 0,
    },
    inlineScripts: {
      count: 0,
      totalSize: 0,
    },
    recommendations: [] as string[],
  };

  // Count images
  const imgRegex = /<img[^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    analysis.images.count++;
    const imgHtml = match[0];
    if (!imgHtml.includes('loading="lazy"')) {
      analysis.images.unoptimized.push('Image without lazy loading');
    }
  }

  // Count scripts
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(html)) !== null) {
    analysis.scripts.count++;
    const scriptHtml = match[0];
    if (scriptHtml.includes('src=')) {
      if (!scriptHtml.includes('async') && !scriptHtml.includes('defer')) {
        analysis.scripts.blocking.push('Blocking script without async/defer');
      }
    } else {
      analysis.inlineScripts.count++;
      analysis.inlineScripts.totalSize += match[1].length;
    }
  }

  // Count stylesheets
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    analysis.stylesheets.count++;
  }

  // Count inline styles
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((match = styleRegex.exec(html)) !== null) {
    analysis.inlineStyles.count++;
    analysis.inlineStyles.totalSize += match[1].length;
  }

  // Generate recommendations
  if (analysis.images.count > 10) {
    analysis.recommendations.push('Consider lazy loading images');
  }
  if (analysis.scripts.blocking.length > 0) {
    analysis.recommendations.push('Use async or defer for non-critical scripts');
  }
  if (analysis.inlineStyles.totalSize > 10000) {
    analysis.recommendations.push('Move inline styles to external stylesheets');
  }
  if (analysis.inlineScripts.totalSize > 10000) {
    analysis.recommendations.push('Move inline scripts to external files');
  }

  return analysis;
}

/**
 * Extract max-age from cache-control header
 */
function extractMaxAge(cacheControl: string): number | null {
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  return maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : null;
}

/**
 * Calculate performance grade
 */
function calculatePerformanceGrade(responseTime: number, contentSize: number): string {
  let score = 100;

  // Response time penalty
  if (responseTime > 3000) score -= 30;
  else if (responseTime > 2000) score -= 20;
  else if (responseTime > 1000) score -= 10;

  // Content size penalty
  if (contentSize > 5000000) score -= 20; // > 5MB
  else if (contentSize > 2000000) score -= 10; // > 2MB
  else if (contentSize > 1000000) score -= 5; // > 1MB

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate performance recommendations
 */
function generatePerformanceRecommendations(
  responseTime: number,
  contentSize: number,
  headers: any
): string[] {
  const recommendations: string[] = [];

  if (responseTime > 2000) {
    recommendations.push('Response time is slow - consider optimizing server performance');
  }

  if (contentSize > 2000000) {
    recommendations.push('Content size is large - consider compression and optimization');
  }

  if (!headers.get('content-encoding')) {
    recommendations.push('Enable gzip or brotli compression');
  }

  if (!headers.get('cache-control') && !headers.get('expires')) {
    recommendations.push('Implement caching headers');
  }

  if (!headers.get('last-modified') && !headers.get('etag')) {
    recommendations.push('Add Last-Modified or ETag headers for better caching');
  }

  return recommendations;
}

