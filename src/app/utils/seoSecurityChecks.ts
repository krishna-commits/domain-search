/**
 * SEO and security checks
 */
export function performSEOSecurityChecks(html: string, metadata: any) {
  const checks = {
    seo: {
      title: {
        present: !!metadata.title,
        length: metadata.title?.length || 0,
        optimal: metadata.title && metadata.title.length >= 30 && metadata.title.length <= 60,
        issues: [] as string[],
      },
      description: {
        present: !!metadata.description,
        length: metadata.description?.length || 0,
        optimal: metadata.description && metadata.description.length >= 120 && metadata.description.length <= 160,
        issues: [] as string[],
      },
      keywords: {
        present: metadata.keywords && metadata.keywords.length > 0,
        count: metadata.keywords?.length || 0,
        optimal: metadata.keywords && metadata.keywords.length >= 5 && metadata.keywords.length <= 10,
        issues: [] as string[],
      },
      ogTags: {
        present: Object.keys(metadata.ogTags || {}).length > 0,
        count: Object.keys(metadata.ogTags || {}).length,
        optimal: Object.keys(metadata.ogTags || {}).length >= 4,
        issues: [] as string[],
      },
      canonical: {
        present: /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html),
        issues: [] as string[],
      },
      h1: {
        count: (html.match(/<h1[^>]*>/gi) || []).length,
        optimal: (html.match(/<h1[^>]*>/gi) || []).length === 1,
        issues: [] as string[],
      },
      h2: {
        count: (html.match(/<h2[^>]*>/gi) || []).length,
        optimal: (html.match(/<h2[^>]*>/gi) || []).length >= 2,
        issues: [] as string[],
      },
      images: {
        withAlt: (html.match(/<img[^>]*alt=["'][^"']+["'][^>]*>/gi) || []).length,
        withoutAlt: (html.match(/<img[^>]*>(?!.*alt)/gi) || []).length,
        total: (html.match(/<img[^>]*>/gi) || []).length,
        issues: [] as string[],
      },
      links: {
        internal: 0,
        external: 0,
        nofollow: 0,
        issues: [] as string[],
      },
    },
    security: {
      noindex: {
        present: /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),
        issues: [] as string[],
      },
      nofollow: {
        present: /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*nofollow/i.test(html),
        issues: [] as string[],
      },
      exposedEmails: {
        count: (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length,
        issues: [] as string[],
      },
      exposedPhoneNumbers: {
        count: (html.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || []).length,
        issues: [] as string[],
      },
      comments: {
        count: (html.match(/<!--[\s\S]*?-->/g) || []).length,
        issues: [] as string[],
      },
    },
    recommendations: [] as string[],
    score: 0,
  };

  // SEO checks
  if (!checks.seo.title.present) {
    checks.seo.title.issues.push('Missing title tag');
  } else if (!checks.seo.title.optimal) {
    checks.seo.title.issues.push(`Title length (${checks.seo.title.length}) should be between 30-60 characters`);
  }

  if (!checks.seo.description.present) {
    checks.seo.description.issues.push('Missing meta description');
  } else if (!checks.seo.description.optimal) {
    checks.seo.description.issues.push(`Description length (${checks.seo.description.length}) should be between 120-160 characters`);
  }

  if (!checks.seo.canonical.present) {
    checks.seo.canonical.issues.push('Missing canonical URL');
  }

  if (!checks.seo.h1.optimal) {
    if (checks.seo.h1.count === 0) {
      checks.seo.h1.issues.push('Missing H1 tag');
    } else if (checks.seo.h1.count > 1) {
      checks.seo.h1.issues.push(`Multiple H1 tags (${checks.seo.h1.count}) - should have only one`);
    }
  }

  if (checks.seo.images.withoutAlt > 0) {
    checks.seo.images.issues.push(`${checks.seo.images.withoutAlt} images without alt text`);
  }

  // Security checks
  if (checks.security.exposedEmails.count > 0) {
    checks.security.exposedEmails.issues.push(`${checks.security.exposedEmails.count} email addresses exposed in HTML`);
    checks.recommendations.push('Consider obfuscating email addresses to prevent spam');
  }

  if (checks.security.exposedPhoneNumbers.count > 0) {
    checks.security.exposedPhoneNumbers.issues.push(`${checks.security.exposedPhoneNumbers.count} phone numbers exposed in HTML`);
    checks.recommendations.push('Consider obfuscating phone numbers');
  }

  if (checks.security.comments.count > 0) {
    checks.security.comments.issues.push(`${checks.security.comments.count} HTML comments found - may contain sensitive information`);
    checks.recommendations.push('Remove HTML comments from production code');
  }

  // Calculate score
  let score = 100;
  score -= checks.seo.title.issues.length * 5;
  score -= checks.seo.description.issues.length * 5;
  score -= checks.seo.canonical.issues.length * 3;
  score -= checks.seo.h1.issues.length * 5;
  score -= checks.seo.images.issues.length * 2;
  score -= checks.security.exposedEmails.count * 3;
  score -= checks.security.exposedPhoneNumbers.count * 2;
  score -= checks.security.comments.count * 1;

  checks.score = Math.max(0, Math.min(100, score));

  // Generate recommendations
  if (checks.seo.title.issues.length > 0) {
    checks.recommendations.push('Add or optimize title tag');
  }
  if (checks.seo.description.issues.length > 0) {
    checks.recommendations.push('Add or optimize meta description');
  }
  if (checks.seo.canonical.issues.length > 0) {
    checks.recommendations.push('Add canonical URL');
  }
  if (checks.seo.h1.issues.length > 0) {
    checks.recommendations.push('Ensure exactly one H1 tag per page');
  }
  if (checks.seo.images.issues.length > 0) {
    checks.recommendations.push('Add alt text to all images');
  }

  return checks;
}

