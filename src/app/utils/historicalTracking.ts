/**
 * Historical Tracking and Trend Analysis
 */

export interface HistoricalRecord {
  domain: string;
  timestamp: Date;
  securityScore?: number;
  riskLevel?: string;
  vulnerabilities?: number;
  sslValid?: boolean;
  sslExpiration?: Date;
  dnsRecords?: Record<string, any>;
  whoisData?: any;
  performance?: any;
  compliance?: any;
}

export interface TrendAnalysis {
  domain: string;
  period: '7d' | '30d' | '90d' | '1y';
  securityScoreTrend: Array<{ date: string; score: number }>;
  vulnerabilityTrend: Array<{ date: string; count: number }>;
  performanceTrend: Array<{ date: string; score: number }>;
  complianceTrend: Array<{ date: string; score: number }>;
  changes: Array<{
    type: string;
    date: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  summary: {
    averageScore: number;
    trend: 'improving' | 'stable' | 'declining';
    changePercentage: number;
    totalChanges: number;
  };
}

/**
 * Store historical record (in production, use a database)
 */
const historicalData: Map<string, HistoricalRecord[]> = new Map();

export function storeHistoricalRecord(record: HistoricalRecord): void {
  const domain = record.domain;
  if (!historicalData.has(domain)) {
    historicalData.set(domain, []);
  }
  historicalData.get(domain)!.push(record);
  
  // Keep only last 1000 records per domain
  const records = historicalData.get(domain)!;
  if (records.length > 1000) {
    records.shift();
  }
}

/**
 * Get historical records
 */
export function getHistoricalRecords(domain: string, limit: number = 100): HistoricalRecord[] {
  const records = historicalData.get(domain) || [];
  return records.slice(-limit).reverse();
}

/**
 * Analyze trends
 */
export function analyzeTrends(domain: string, period: '7d' | '30d' | '90d' | '1y' = '30d'): TrendAnalysis {
  const records = getHistoricalRecords(domain, 1000);
  const now = new Date();
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  
  const filteredRecords = records.filter(r => new Date(r.timestamp) >= cutoffDate);
  
  // Security score trend
  const securityScoreTrend = filteredRecords
    .filter(r => r.securityScore !== undefined)
    .map(r => ({
      date: new Date(r.timestamp).toISOString().split('T')[0],
      score: r.securityScore!,
    }));

  // Vulnerability trend
  const vulnerabilityTrend = filteredRecords
    .filter(r => r.vulnerabilities !== undefined)
    .map(r => ({
      date: new Date(r.timestamp).toISOString().split('T')[0],
      count: r.vulnerabilities!,
    }));

  // Performance trend
  const performanceTrend = filteredRecords
    .filter(r => r.performance?.performance?.grade)
    .map(r => ({
      date: new Date(r.timestamp).toISOString().split('T')[0],
      score: r.performance?.performance?.grade === 'A' ? 100 : 
             r.performance?.performance?.grade === 'B' ? 80 :
             r.performance?.performance?.grade === 'C' ? 60 :
             r.performance?.performance?.grade === 'D' ? 40 : 20,
    }));

  // Compliance trend
  const complianceTrend = filteredRecords
    .filter(r => r.compliance?.overallScore !== undefined)
    .map(r => ({
      date: new Date(r.timestamp).toISOString().split('T')[0],
      score: r.compliance.overallScore,
    }));

  // Detect changes
  const changes: Array<{
    type: string;
    date: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  for (let i = 1; i < filteredRecords.length; i++) {
    const prev = filteredRecords[i - 1];
    const curr = filteredRecords[i];

    // SSL expiration change
    if (prev.sslExpiration && curr.sslExpiration && 
        prev.sslExpiration.getTime() !== curr.sslExpiration.getTime()) {
      changes.push({
        type: 'SSL',
        date: new Date(curr.timestamp).toISOString(),
        description: 'SSL certificate expiration date changed',
        severity: 'medium',
      });
    }

    // Security score change
    if (prev.securityScore && curr.securityScore && 
        Math.abs(prev.securityScore - curr.securityScore) > 10) {
      changes.push({
        type: 'Security',
        date: new Date(curr.timestamp).toISOString(),
        description: `Security score changed from ${prev.securityScore} to ${curr.securityScore}`,
        severity: Math.abs(prev.securityScore - curr.securityScore) > 30 ? 'high' : 'medium',
      });
    }

    // Vulnerability change
    if (prev.vulnerabilities !== undefined && curr.vulnerabilities !== undefined &&
        prev.vulnerabilities !== curr.vulnerabilities) {
      changes.push({
        type: 'Vulnerability',
        date: new Date(curr.timestamp).toISOString(),
        description: `Vulnerability count changed from ${prev.vulnerabilities} to ${curr.vulnerabilities}`,
        severity: curr.vulnerabilities > prev.vulnerabilities ? 'high' : 'low',
      });
    }
  }

  // Calculate summary
  const scores = securityScoreTrend.map(t => t.score);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  let changePercentage = 0;
  
  if (scores.length >= 2) {
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    changePercentage = ((lastScore - firstScore) / firstScore) * 100;
    
    if (changePercentage > 5) {
      trend = 'improving';
    } else if (changePercentage < -5) {
      trend = 'declining';
    }
  }

  return {
    domain,
    period,
    securityScoreTrend,
    vulnerabilityTrend,
    performanceTrend,
    complianceTrend,
    changes: changes.slice(0, 50), // Limit to 50 most recent changes
    summary: {
      averageScore: Math.round(averageScore),
      trend,
      changePercentage: Math.round(changePercentage * 100) / 100,
      totalChanges: changes.length,
    },
  };
}

/**
 * Compare historical records
 */
export function compareHistoricalRecords(
  domain: string,
  date1: Date,
  date2: Date
): {
  securityScore: { before: number; after: number; change: number };
  vulnerabilities: { before: number; after: number; change: number };
  ssl: { before: boolean; after: boolean; changed: boolean };
  dns: { changed: boolean; changes: string[] };
} {
  const records = getHistoricalRecords(domain, 1000);
  
  const record1 = records.find(r => 
    Math.abs(new Date(r.timestamp).getTime() - date1.getTime()) < 24 * 60 * 60 * 1000
  );
  const record2 = records.find(r => 
    Math.abs(new Date(r.timestamp).getTime() - date2.getTime()) < 24 * 60 * 60 * 1000
  );

  return {
    securityScore: {
      before: record1?.securityScore || 0,
      after: record2?.securityScore || 0,
      change: (record2?.securityScore || 0) - (record1?.securityScore || 0),
    },
    vulnerabilities: {
      before: record1?.vulnerabilities || 0,
      after: record2?.vulnerabilities || 0,
      change: (record2?.vulnerabilities || 0) - (record1?.vulnerabilities || 0),
    },
    ssl: {
      before: record1?.sslValid || false,
      after: record2?.sslValid || false,
      changed: record1?.sslValid !== record2?.sslValid,
    },
    dns: {
      changed: JSON.stringify(record1?.dnsRecords) !== JSON.stringify(record2?.dnsRecords),
      changes: [], // Would need detailed comparison
    },
  };
}

