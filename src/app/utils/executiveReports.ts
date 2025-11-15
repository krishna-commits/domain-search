/**
 * Executive Summary Reports
 */

export interface ExecutiveReport {
  domain: string;
  timestamp: Date;
  summary: {
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    securityGrade: string;
    complianceStatus: string;
    performanceGrade: string;
  };
  keyFindings: Array<{
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
  }>;
  recommendations: Array<{
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    estimatedEffort: string;
  }>;
  metrics: {
    securityScore: number;
    complianceScore: number;
    performanceScore: number;
    uptime: number;
    vulnerabilities: number;
    criticalIssues: number;
  };
  trends: {
    securityTrend: 'improving' | 'stable' | 'declining';
    performanceTrend: 'improving' | 'stable' | 'declining';
    complianceTrend: 'improving' | 'stable' | 'declining';
  };
}

/**
 * Generate executive summary report
 */
export function generateExecutiveReport(
  domain: string,
  scanData: {
    securityScore?: number;
    riskAssessment?: { riskLevel: string };
    compliance?: { overallScore: number; overallStatus: string };
    performance?: { performance?: { grade: string } };
    uptimeMonitoring?: { uptimePercentage: number };
    vulnerabilities?: any[];
    recommendations?: string[];
  },
  historicalData?: any
): ExecutiveReport {
  // Calculate overall score
  const securityScore = scanData.securityScore || 0;
  const complianceScore = scanData.compliance?.overallScore || 0;
  const performanceScore = scanData.performance?.performance?.grade === 'A' ? 100 :
                           scanData.performance?.performance?.grade === 'B' ? 80 :
                           scanData.performance?.performance?.grade === 'C' ? 60 :
                           scanData.performance?.performance?.grade === 'D' ? 40 : 20;
  
  const overallScore = Math.round((securityScore + complianceScore + performanceScore) / 3);

  // Determine risk level
  const riskLevel = (scanData.riskAssessment?.riskLevel || 'low') as 'low' | 'medium' | 'high' | 'critical';

  // Security grade
  const securityGrade = getGrade(securityScore);

  // Compliance status
  const complianceStatus = scanData.compliance?.overallStatus || 'non-compliant';

  // Performance grade
  const performanceGrade = scanData.performance?.performance?.grade || 'F';

  // Key findings
  const keyFindings: ExecutiveReport['keyFindings'] = [];

  if (securityScore < 70) {
    keyFindings.push({
      category: 'Security',
      severity: securityScore < 50 ? 'critical' : 'high',
      description: `Security score is ${securityScore}/100`,
      impact: 'High risk of security breaches',
    });
  }

  if (scanData.compliance && scanData.compliance.overallScore < 80) {
    keyFindings.push({
      category: 'Compliance',
      severity: scanData.compliance.overallScore < 60 ? 'high' : 'medium',
      description: `Compliance score is ${scanData.compliance.overallScore}/100`,
      impact: 'Risk of non-compliance penalties',
    });
  }

  if (scanData.vulnerabilities && scanData.vulnerabilities.length > 0) {
    const criticalVulns = scanData.vulnerabilities.filter((v: any) => v.severity === 'critical').length;
    if (criticalVulns > 0) {
      keyFindings.push({
        category: 'Vulnerabilities',
        severity: 'critical',
        description: `${criticalVulns} critical vulnerabilities found`,
        impact: 'Immediate security risk',
      });
    }
  }

  if (scanData.uptimeMonitoring && scanData.uptimeMonitoring.uptimePercentage < 99) {
    keyFindings.push({
      category: 'Uptime',
      severity: scanData.uptimeMonitoring.uptimePercentage < 95 ? 'high' : 'medium',
      description: `Uptime is ${scanData.uptimeMonitoring.uptimePercentage}%`,
      impact: 'Service availability issues',
    });
  }

  // Recommendations
  const recommendations: ExecutiveReport['recommendations'] = [];

  if (scanData.recommendations) {
    scanData.recommendations.forEach((rec: string, index: number) => {
      if (index < 10) { // Limit to top 10
        recommendations.push({
          priority: rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('urgent') ? 'critical' :
                   rec.toLowerCase().includes('high') || rec.toLowerCase().includes('important') ? 'high' :
                   rec.toLowerCase().includes('medium') ? 'medium' : 'low',
          category: 'Security',
          description: rec,
          estimatedEffort: '1-2 weeks',
        });
      }
    });
  }

  // Trends
  const trends = {
    securityTrend: 'stable' as 'improving' | 'stable' | 'declining',
    performanceTrend: 'stable' as 'improving' | 'stable' | 'declining',
    complianceTrend: 'stable' as 'improving' | 'stable' | 'declining',
  };

  if (historicalData) {
    // Analyze trends from historical data
    // This would require comparing current data with historical data
  }

  return {
    domain,
    timestamp: new Date(),
    summary: {
      overallScore,
      riskLevel,
      securityGrade,
      complianceStatus,
      performanceGrade,
    },
    keyFindings,
    recommendations,
    metrics: {
      securityScore,
      complianceScore,
      performanceScore,
      uptime: scanData.uptimeMonitoring?.uptimePercentage || 0,
      vulnerabilities: scanData.vulnerabilities?.length || 0,
      criticalIssues: scanData.vulnerabilities?.filter((v: any) => v.severity === 'critical').length || 0,
    },
    trends,
  };
}

/**
 * Get grade from score
 */
function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Format report as HTML
 */
export function formatReportAsHTML(report: ExecutiveReport): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Executive Summary - ${report.domain}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 5px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .card h3 { margin-top: 0; }
    .score { font-size: 2em; font-weight: bold; }
    .findings { margin: 20px 0; }
    .finding { padding: 10px; margin: 10px 0; border-left: 4px solid; }
    .critical { border-color: #d32f2f; background: #ffebee; }
    .high { border-color: #f57c00; background: #fff3e0; }
    .medium { border-color: #fbc02d; background: #fffde7; }
    .low { border-color: #388e3c; background: #e8f5e9; }
    .recommendations { margin: 20px 0; }
    .recommendation { padding: 10px; margin: 10px 0; background: #f5f5f5; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Executive Summary Report</h1>
    <p><strong>Domain:</strong> ${report.domain}</p>
    <p><strong>Date:</strong> ${report.timestamp.toLocaleDateString()}</p>
  </div>

  <div class="summary">
    <div class="card">
      <h3>Overall Score</h3>
      <div class="score">${report.summary.overallScore}/100</div>
    </div>
    <div class="card">
      <h3>Risk Level</h3>
      <div class="score">${report.summary.riskLevel.toUpperCase()}</div>
    </div>
    <div class="card">
      <h3>Security Grade</h3>
      <div class="score">${report.summary.securityGrade}</div>
    </div>
    <div class="card">
      <h3>Compliance</h3>
      <div class="score">${report.summary.complianceStatus}</div>
    </div>
  </div>

  <div class="findings">
    <h2>Key Findings</h2>
    ${report.keyFindings.map(f => `
      <div class="finding ${f.severity}">
        <strong>${f.category}</strong> - ${f.description}
        <p>${f.impact}</p>
      </div>
    `).join('')}
  </div>

  <div class="recommendations">
    <h2>Recommendations</h2>
    ${report.recommendations.map(r => `
      <div class="recommendation">
        <strong>[${r.priority.toUpperCase()}]</strong> ${r.description}
        <p><em>Estimated effort: ${r.estimatedEffort}</em></p>
      </div>
    `).join('')}
  </div>

  <div class="metrics">
    <h2>Key Metrics</h2>
    <ul>
      <li>Security Score: ${report.metrics.securityScore}/100</li>
      <li>Compliance Score: ${report.metrics.complianceScore}/100</li>
      <li>Performance Score: ${report.metrics.performanceScore}/100</li>
      <li>Uptime: ${report.metrics.uptime}%</li>
      <li>Vulnerabilities: ${report.metrics.vulnerabilities}</li>
      <li>Critical Issues: ${report.metrics.criticalIssues}</li>
    </ul>
  </div>
</body>
</html>
  `;
}

