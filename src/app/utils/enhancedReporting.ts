/**
 * Enhanced Reporting System
 * - Executive Summary Reports
 * - Visual Analytics
 * - Trend Charts
 * - Comparative Analysis
 */

import { getHistoricalRecords, analyzeTrends } from './historicalTracking';

export interface ExecutiveReport {
  domain: string;
  timestamp: Date;
  summary: {
    securityScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    keyFindings: string[];
    criticalIssues: number;
    warnings: number;
    recommendations: number;
  };
  security: {
    ssl: { status: string; grade: string; issues: string[] };
    headers: { score: number; grade: string; missing: string[] };
    cookies: { score: number; grade: string; issues: string[] };
    vulnerabilities: { count: number; critical: number; high: number; medium: number; low: number };
  };
  performance: {
    score: number;
    grade: string;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
    recommendations: string[];
  };
  compliance: {
    gdpr: { score: number; status: string; issues: string[] };
    pciDss: { score: number; status: string; issues: string[] };
    hipaa: { score: number; status: string; issues: string[] };
  };
  trends: {
    securityScore: { trend: 'improving' | 'stable' | 'declining'; change: number };
    vulnerabilities: { trend: 'improving' | 'stable' | 'declining'; change: number };
    performance: { trend: 'improving' | 'stable' | 'declining'; change: number };
  };
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    recommendation: string;
    impact: string;
  }>;
}

/**
 * Generate enhanced executive report
 */
export function generateEnhancedExecutiveReport(
  domain: string,
  currentScan: any,
  historicalData?: any
): ExecutiveReport {
  const securityScore = currentScan.securityScore || 0;
  const riskLevel = currentScan.riskAssessment?.riskLevel || 'low';
  const overallGrade = calculateOverallGrade(securityScore);

  // Security analysis
  const sslStatus = currentScan.ssl?.valid ? 'Valid' : 'Invalid';
  const sslGrade = currentScan.ssl?.valid ? 'A' : 'F';
  const sslIssues: string[] = [];
  if (!currentScan.ssl?.valid) sslIssues.push('Invalid SSL certificate');
  if (currentScan.ssl?.validTo) {
    const daysUntilExpiration = Math.floor(
      (new Date(currentScan.ssl.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiration < 30) {
      sslIssues.push(`SSL certificate expires in ${daysUntilExpiration} days`);
    }
  }

  const headersScore = currentScan.security?.headers
    ? (Object.values(currentScan.security.headers).filter((h: any) => h.present).length /
        Object.keys(currentScan.security.headers).length) *
      100
    : 0;
  const headersGrade = headersScore >= 90 ? 'A' : headersScore >= 70 ? 'B' : headersScore >= 50 ? 'C' : 'D';
  const missingHeaders = currentScan.security?.headers
    ? Object.entries(currentScan.security.headers)
        .filter(([_, h]: [string, any]) => !h.present)
        .map(([name]) => name)
    : [];

  const cookiesScore = currentScan.cookies?.score || 0;
  const cookiesGrade = cookiesScore >= 90 ? 'A' : cookiesScore >= 70 ? 'B' : cookiesScore >= 50 ? 'C' : 'D';
  const cookieIssues: string[] = [];
  if (cookiesScore < 100) {
    cookieIssues.push('Cookie security issues detected');
  }

  const vulnerabilities = currentScan.vulnerabilities || [];
  const vulnCounts = {
    critical: vulnerabilities.filter((v: any) => v.severity === 'critical').length,
    high: vulnerabilities.filter((v: any) => v.severity === 'high').length,
    medium: vulnerabilities.filter((v: any) => v.severity === 'medium').length,
    low: vulnerabilities.filter((v: any) => v.severity === 'low').length,
  };

  // Performance analysis
  const performanceScore = currentScan.coreWebVitals?.performanceScore || 0;
  const performanceGrade = currentScan.coreWebVitals?.performanceGrade || 'F';
  const performanceRecommendations = currentScan.coreWebVitals?.recommendations || [];

  // Compliance analysis
  const compliance = currentScan.compliance || {};
  const gdpr = {
    score: compliance.gdpr?.score || 0,
    status: compliance.gdpr?.passed ? 'Compliant' : 'Non-Compliant',
    issues: compliance.gdpr?.issues || [],
  };
  const pciDss = {
    score: compliance.pciDss?.score || 0,
    status: compliance.pciDss?.passed ? 'Compliant' : 'Non-Compliant',
    issues: compliance.pciDss?.issues || [],
  };
  const hipaa = {
    score: compliance.hipaa?.score || 0,
    status: compliance.hipaa?.passed ? 'Compliant' : 'Non-Compliant',
    issues: compliance.hipaa?.issues || [],
  };

  // Trend analysis
  const trends = historicalData
    ? analyzeTrends(domain, '30d')
    : {
        securityScore: { trend: 'stable' as const, change: 0 },
        vulnerabilities: { trend: 'stable' as const, change: 0 },
        performance: { trend: 'stable' as const, change: 0 },
      };

  // Key findings
  const keyFindings: string[] = [];
  if (securityScore < 60) keyFindings.push('Security score is below acceptable threshold');
  if (vulnCounts.critical > 0) keyFindings.push(`${vulnCounts.critical} critical vulnerabilities detected`);
  if (!currentScan.ssl?.valid) keyFindings.push('Invalid SSL certificate');
  if (headersScore < 70) keyFindings.push('Missing critical security headers');
  if (performanceScore < 70) keyFindings.push('Performance issues detected');
  if (!gdpr.status.includes('Compliant')) keyFindings.push('GDPR compliance issues');

  // Recommendations
  const recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    recommendation: string;
    impact: string;
  }> = [];

  // Critical recommendations
  if (vulnCounts.critical > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'Security',
      issue: `${vulnCounts.critical} critical vulnerabilities`,
      recommendation: 'Immediately patch critical vulnerabilities',
      impact: 'High risk of security breach',
    });
  }
  if (!currentScan.ssl?.valid) {
    recommendations.push({
      priority: 'critical',
      category: 'SSL/TLS',
      issue: 'Invalid SSL certificate',
      recommendation: 'Install and configure valid SSL certificate',
      impact: 'Data transmission is not encrypted',
    });
  }

  // High priority recommendations
  if (headersScore < 70) {
    recommendations.push({
      priority: 'high',
      category: 'Security Headers',
      issue: 'Missing security headers',
      recommendation: `Implement missing headers: ${missingHeaders.slice(0, 3).join(', ')}`,
      impact: 'Increased risk of XSS, clickjacking, and other attacks',
    });
  }
  if (vulnCounts.high > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Security',
      issue: `${vulnCounts.high} high-severity vulnerabilities`,
      recommendation: 'Patch high-severity vulnerabilities',
      impact: 'Moderate risk of security breach',
    });
  }

  // Medium priority recommendations
  if (performanceScore < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'Performance',
      issue: 'Performance below optimal',
      recommendation: performanceRecommendations[0] || 'Optimize website performance',
      impact: 'Poor user experience and SEO ranking',
    });
  }
  if (cookiesScore < 100) {
    recommendations.push({
      priority: 'medium',
      category: 'Cookie Security',
      issue: 'Cookie security issues',
      recommendation: 'Implement secure cookie flags (Secure, HttpOnly, SameSite)',
      impact: 'Risk of cookie theft and session hijacking',
    });
  }

  // Low priority recommendations
  if (vulnCounts.medium > 0) {
    recommendations.push({
      priority: 'low',
      category: 'Security',
      issue: `${vulnCounts.medium} medium-severity vulnerabilities`,
      recommendation: 'Address medium-severity vulnerabilities',
      impact: 'Low to moderate risk',
    });
  }

  // Add recommendations from scan
  if (currentScan.recommendations) {
    currentScan.recommendations.forEach((rec: string) => {
      recommendations.push({
        priority: 'medium',
        category: 'General',
        issue: 'Security improvement needed',
        recommendation: rec,
        impact: 'Improved security posture',
      });
    });
  }

  return {
    domain,
    timestamp: new Date(),
    summary: {
      securityScore,
      riskLevel,
      overallGrade,
      keyFindings,
      criticalIssues: vulnCounts.critical,
      warnings: vulnCounts.high + vulnCounts.medium,
      recommendations: recommendations.length,
    },
    security: {
      ssl: { status: sslStatus, grade: sslGrade, issues: sslIssues },
      headers: { score: headersScore, grade: headersGrade, missing: missingHeaders },
      cookies: { score: cookiesScore, grade: cookiesGrade, issues: cookieIssues },
      vulnerabilities: {
        count: vulnerabilities.length,
        ...vulnCounts,
      },
    },
    performance: {
      score: performanceScore,
      grade: performanceGrade,
      coreWebVitals: {
        lcp: currentScan.coreWebVitals?.lcp || 0,
        fid: currentScan.coreWebVitals?.fid || 0,
        cls: currentScan.coreWebVitals?.cls || 0,
      },
      recommendations: performanceRecommendations,
    },
    compliance: {
      gdpr,
      pciDss,
      hipaa,
    },
    trends: {
      securityScore: {
        trend: trends.summary?.trend || 'stable',
        change: trends.summary?.changePercentage || 0,
      },
      vulnerabilities: {
        trend: 'stable',
        change: 0,
      },
      performance: {
        trend: 'stable',
        change: 0,
      },
    },
    recommendations: recommendations.slice(0, 20), // Limit to top 20
  };
}

/**
 * Calculate overall grade
 */
function calculateOverallGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate comparative report
 */
export function generateComparativeReport(
  domains: Array<{ domain: string; scan: any }>
): {
  domains: string[];
  comparison: {
    securityScores: Array<{ domain: string; score: number }>;
    vulnerabilityCounts: Array<{ domain: string; count: number }>;
    performanceScores: Array<{ domain: string; score: number }>;
    complianceScores: Array<{ domain: string; gdpr: number; pciDss: number; hipaa: number }>;
  };
  rankings: {
    security: Array<{ domain: string; rank: number; score: number }>;
    performance: Array<{ domain: string; rank: number; score: number }>;
    compliance: Array<{ domain: string; rank: number; score: number }>;
  };
} {
  const securityScores = domains.map((d) => ({
    domain: d.domain,
    score: d.scan.securityScore || 0,
  }));

  const vulnerabilityCounts = domains.map((d) => ({
    domain: d.domain,
    count: d.scan.vulnerabilities?.length || 0,
  }));

  const performanceScores = domains.map((d) => ({
    domain: d.domain,
    score: d.scan.coreWebVitals?.performanceScore || 0,
  }));

  const complianceScores = domains.map((d) => ({
    domain: d.domain,
    gdpr: d.scan.compliance?.gdpr?.score || 0,
    pciDss: d.scan.compliance?.pciDss?.score || 0,
    hipaa: d.scan.compliance?.hipaa?.score || 0,
  }));

  // Rankings
  const securityRankings = securityScores
    .map((s, i) => ({ domain: s.domain, rank: 0, score: s.score }))
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const performanceRankings = performanceScores
    .map((s, i) => ({ domain: s.domain, rank: 0, score: s.score }))
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const complianceRankings = complianceScores
    .map((c, i) => ({
      domain: c.domain,
      rank: 0,
      score: (c.gdpr + c.pciDss + c.hipaa) / 3,
    }))
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return {
    domains: domains.map((d) => d.domain),
    comparison: {
      securityScores,
      vulnerabilityCounts,
      performanceScores,
      complianceScores,
    },
    rankings: {
      security: securityRankings,
      performance: performanceRankings,
      compliance: complianceRankings,
    },
  };
}

