import { Headers } from 'node-fetch';

/**
 * Grade security headers using Mozilla Observatory methodology
 */
export function gradeSecurityHeaders(headers: Headers) {
  const grades: Record<string, { grade: string; score: number; issues: string[] }> = {};
  
  // Content Security Policy
  const csp = headers.get('content-security-policy');
  grades.csp = gradeCSP(csp);

  // Strict Transport Security
  const hsts = headers.get('strict-transport-security');
  grades.hsts = gradeHSTS(hsts);

  // X-Frame-Options
  const xfo = headers.get('x-frame-options');
  grades.xFrameOptions = gradeXFrameOptions(xfo);

  // X-Content-Type-Options
  const xcto = headers.get('x-content-type-options');
  grades.xContentTypeOptions = gradeXContentTypeOptions(xcto);

  // Referrer-Policy
  const referrerPolicy = headers.get('referrer-policy');
  grades.referrerPolicy = gradeReferrerPolicy(referrerPolicy);

  // Permissions-Policy
  const permissionsPolicy = headers.get('permissions-policy');
  grades.permissionsPolicy = gradePermissionsPolicy(permissionsPolicy);

  // Calculate overall grade
  const overallGrade = calculateOverallGrade(grades);

  return {
    overall: overallGrade,
    grades,
    recommendations: generateHeaderRecommendations(grades),
  };
}

function gradeCSP(csp: string | null): { grade: string; score: number; issues: string[] } {
  if (!csp) {
    return { grade: 'F', score: 0, issues: ['Content Security Policy header is missing'] };
  }

  let score = 100;
  const issues: string[] = [];

  // Check for unsafe-inline
  if (csp.includes("'unsafe-inline'")) {
    score -= 30;
    issues.push('CSP allows unsafe-inline');
  }

  // Check for unsafe-eval
  if (csp.includes("'unsafe-eval'")) {
    score -= 20;
    issues.push('CSP allows unsafe-eval');
  }

  // Check for default-src
  if (!csp.includes('default-src')) {
    score -= 20;
    issues.push('CSP missing default-src directive');
  }

  // Check for script-src
  if (!csp.includes('script-src')) {
    score -= 10;
    issues.push('CSP missing script-src directive');
  }

  // Check for object-src
  if (!csp.includes('object-src')) {
    score -= 10;
    issues.push('CSP missing object-src directive');
  }

  if (score >= 90) return { grade: 'A+', score, issues };
  if (score >= 80) return { grade: 'A', score, issues };
  if (score >= 70) return { grade: 'B', score, issues };
  if (score >= 60) return { grade: 'C', score, issues };
  if (score >= 50) return { grade: 'D', score, issues };
  return { grade: 'F', score, issues };
}

function gradeHSTS(hsts: string | null): { grade: string; score: number; issues: string[] } {
  if (!hsts) {
    return { grade: 'F', score: 0, issues: ['Strict Transport Security header is missing'] };
  }

  let score = 100;
  const issues: string[] = [];

  // Check for max-age
  if (!hsts.includes('max-age')) {
    score -= 50;
    issues.push('HSTS missing max-age directive');
  } else {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1], 10);
      if (maxAge < 31536000) { // Less than 1 year
        score -= 20;
        issues.push('HSTS max-age should be at least 1 year (31536000 seconds)');
      }
    }
  }

  // Check for includeSubDomains
  if (!hsts.includes('includeSubDomains')) {
    score -= 10;
    issues.push('HSTS should include includeSubDomains directive');
  }

  // Check for preload
  if (!hsts.includes('preload')) {
    score -= 10;
    issues.push('HSTS should include preload directive for maximum security');
  }

  if (score >= 90) return { grade: 'A+', score, issues };
  if (score >= 80) return { grade: 'A', score, issues };
  if (score >= 70) return { grade: 'B', score, issues };
  if (score >= 60) return { grade: 'C', score, issues };
  if (score >= 50) return { grade: 'D', score, issues };
  return { grade: 'F', score, issues };
}

function gradeXFrameOptions(xfo: string | null): { grade: string; score: number; issues: string[] } {
  if (!xfo) {
    return { grade: 'F', score: 0, issues: ['X-Frame-Options header is missing'] };
  }

  const upper = xfo.toUpperCase();
  if (upper === 'DENY' || upper === 'SAMEORIGIN') {
    return { grade: 'A+', score: 100, issues: [] };
  }

  return { grade: 'C', score: 50, issues: ['X-Frame-Options should be DENY or SAMEORIGIN'] };
}

function gradeXContentTypeOptions(xcto: string | null): { grade: string; score: number; issues: string[] } {
  if (!xcto) {
    return { grade: 'F', score: 0, issues: ['X-Content-Type-Options header is missing'] };
  }

  if (xcto.toUpperCase() === 'NOSNIFF') {
    return { grade: 'A+', score: 100, issues: [] };
  }

  return { grade: 'F', score: 0, issues: ['X-Content-Type-Options should be nosniff'] };
}

function gradeReferrerPolicy(rp: string | null): { grade: string; score: number; issues: string[] } {
  if (!rp) {
    return { grade: 'F', score: 0, issues: ['Referrer-Policy header is missing'] };
  }

  const policy = rp.toLowerCase();
  if (policy === 'no-referrer' || policy === 'strict-origin-when-cross-origin') {
    return { grade: 'A+', score: 100, issues: [] };
  }

  if (policy === 'same-origin' || policy === 'strict-origin') {
    return { grade: 'A', score: 90, issues: [] };
  }

  return { grade: 'C', score: 60, issues: ['Referrer-Policy should be more restrictive'] };
}

function gradePermissionsPolicy(pp: string | null): { grade: string; score: number; issues: string[] } {
  if (!pp) {
    return { grade: 'F', score: 0, issues: ['Permissions-Policy header is missing'] };
  }

  // Check if restrictive policies are set
  const restrictive = pp.includes('geolocation=()') || 
                       pp.includes('camera=()') || 
                       pp.includes('microphone=()');

  if (restrictive) {
    return { grade: 'A', score: 90, issues: [] };
  }

  return { grade: 'C', score: 60, issues: ['Permissions-Policy should restrict unnecessary features'] };
}

function calculateOverallGrade(grades: Record<string, { grade: string; score: number; issues: string[] }>): { grade: string; score: number } {
  const scores = Object.values(grades).map(g => g.score);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  if (averageScore >= 90) return { grade: 'A+', score: averageScore };
  if (averageScore >= 80) return { grade: 'A', score: averageScore };
  if (averageScore >= 70) return { grade: 'B', score: averageScore };
  if (averageScore >= 60) return { grade: 'C', score: averageScore };
  if (averageScore >= 50) return { grade: 'D', score: averageScore };
  return { grade: 'F', score: averageScore };
}

function generateHeaderRecommendations(grades: Record<string, { grade: string; score: number; issues: string[] }>): string[] {
  const recommendations: string[] = [];

  Object.entries(grades).forEach(([header, grade]) => {
    if (grade.grade === 'F' || grade.score < 70) {
      recommendations.push(`${header}: ${grade.issues.join(', ')}`);
    }
  });

  return recommendations;
}

