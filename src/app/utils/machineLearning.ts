/**
 * Machine Learning and Anomaly Detection
 */

export interface AnomalyDetectionResult {
  domain: string;
  timestamp: Date;
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    score: number;
  }>;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  anomalyScore: number;
}

export interface PatternRecognitionResult {
  domain: string;
  patterns: Array<{
    type: string;
    confidence: number;
    description: string;
  }>;
}

/**
 * Simple anomaly detection based on statistical analysis
 */
export function detectAnomalies(
  domain: string,
  currentData: {
    securityScore?: number;
    responseTime?: number;
    vulnerabilityCount?: number;
    sslExpiration?: number;
  },
  historicalData: Array<{
    securityScore?: number;
    responseTime?: number;
    vulnerabilityCount?: number;
    sslExpiration?: number;
  }>
): AnomalyDetectionResult {
  const anomalies: AnomalyDetectionResult['anomalies'] = [];

  // Security score anomaly
  if (currentData.securityScore !== undefined && historicalData.length > 0) {
    const scores = historicalData.map(d => d.securityScore || 0).filter(s => s > 0);
    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const stdDev = calculateStdDev(scores, avgScore);
      const deviation = Math.abs(currentData.securityScore - avgScore);
      
      if (deviation > 2 * stdDev) {
        anomalies.push({
          type: 'Security Score Anomaly',
          severity: deviation > 3 * stdDev ? 'critical' : 'high',
          description: `Security score deviates significantly from historical average (${avgScore.toFixed(1)})`,
          score: deviation / stdDev,
        });
      }
    }
  }

  // Response time anomaly
  if (currentData.responseTime !== undefined && historicalData.length > 0) {
    const responseTimes = historicalData.map(d => d.responseTime || 0).filter(t => t > 0);
    if (responseTimes.length > 0) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const stdDev = calculateStdDev(responseTimes, avgTime);
      const deviation = Math.abs(currentData.responseTime - avgTime);
      
      if (deviation > 2 * stdDev) {
        anomalies.push({
          type: 'Response Time Anomaly',
          severity: deviation > 3 * stdDev ? 'high' : 'medium',
          description: `Response time deviates significantly from historical average (${avgTime.toFixed(0)}ms)`,
          score: deviation / stdDev,
        });
      }
    }
  }

  // Vulnerability count anomaly
  if (currentData.vulnerabilityCount !== undefined && historicalData.length > 0) {
    const vulnCounts = historicalData.map(d => d.vulnerabilityCount || 0);
    const avgVulns = vulnCounts.reduce((a, b) => a + b, 0) / vulnCounts.length;
    
    if (currentData.vulnerabilityCount > avgVulns * 2) {
      anomalies.push({
        type: 'Vulnerability Spike',
        severity: currentData.vulnerabilityCount > avgVulns * 3 ? 'critical' : 'high',
        description: `Vulnerability count increased significantly from historical average (${avgVulns.toFixed(1)})`,
        score: currentData.vulnerabilityCount / avgVulns,
      });
    }
  }

  // SSL expiration anomaly
  if (currentData.sslExpiration !== undefined && currentData.sslExpiration < 30) {
    anomalies.push({
      type: 'SSL Expiration Warning',
      severity: currentData.sslExpiration < 7 ? 'critical' : 'high',
      description: `SSL certificate expiring soon (${currentData.sslExpiration} days)`,
      score: 30 - currentData.sslExpiration,
    });
  }

  // Calculate overall risk
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
  const highAnomalies = anomalies.filter(a => a.severity === 'high').length;
  
  let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (criticalAnomalies > 0) overallRisk = 'critical';
  else if (highAnomalies > 0) overallRisk = 'high';
  else if (anomalies.length > 0) overallRisk = 'medium';

  // Calculate anomaly score (0-100, higher is more anomalous)
  const anomalyScore = Math.min(100, anomalies.reduce((sum, a) => sum + a.score, 0) * 10);

  return {
    domain,
    timestamp: new Date(),
    anomalies,
    overallRisk,
    anomalyScore: Math.round(anomalyScore),
  };
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Pattern recognition
 */
export function recognizePatterns(
  domain: string,
  data: Array<{
    securityScore?: number;
    responseTime?: number;
    vulnerabilityCount?: number;
    timestamp: Date;
  }>
): PatternRecognitionResult {
  const patterns: PatternRecognitionResult['patterns'] = [];

  if (data.length < 2) {
    return { domain, patterns: [] };
  }

  // Trend pattern
  const scores = data.map(d => d.securityScore || 0).filter(s => s > 0);
  if (scores.length >= 2) {
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const trend = lastScore > firstScore ? 'improving' : lastScore < firstScore ? 'declining' : 'stable';
    
    patterns.push({
      type: 'Security Score Trend',
      confidence: 0.8,
      description: `Security score is ${trend} (${firstScore} -> ${lastScore})`,
    });
  }

  // Cyclical pattern
  const responseTimes = data.map(d => d.responseTime || 0).filter(t => t > 0);
  if (responseTimes.length >= 7) {
    // Check for weekly pattern
    const weeklyAvg = responseTimes.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const overallAvg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    if (Math.abs(weeklyAvg - overallAvg) < overallAvg * 0.1) {
      patterns.push({
        type: 'Weekly Performance Pattern',
        confidence: 0.6,
        description: 'Response time shows consistent weekly pattern',
      });
    }
  }

  // Vulnerability pattern
  const vulnCounts = data.map(d => d.vulnerabilityCount || 0);
  const increasingVulns = vulnCounts.every((v, i) => i === 0 || v >= vulnCounts[i - 1]);
  const decreasingVulns = vulnCounts.every((v, i) => i === 0 || v <= vulnCounts[i - 1]);
  
  if (increasingVulns && vulnCounts.length >= 3) {
    patterns.push({
      type: 'Vulnerability Accumulation',
      confidence: 0.7,
      description: 'Vulnerability count is consistently increasing',
    });
  } else if (decreasingVulns && vulnCounts.length >= 3) {
    patterns.push({
      type: 'Vulnerability Remediation',
      confidence: 0.7,
      description: 'Vulnerability count is consistently decreasing',
    });
  }

  return {
    domain,
    patterns,
  };
}

/**
 * Predict future security score
 */
export function predictSecurityScore(
  historicalScores: number[],
  days: number = 7
): { predictedScore: number; confidence: number; trend: 'improving' | 'stable' | 'declining' } {
  if (historicalScores.length < 2) {
    return { predictedScore: historicalScores[0] || 0, confidence: 0, trend: 'stable' };
  }

  // Simple linear regression
  const n = historicalScores.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalScores;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict future score
  const predictedScore = Math.max(0, Math.min(100, slope * (n + days) + intercept));
  
  // Calculate confidence based on data points
  const confidence = Math.min(0.9, n / 30);
  
  // Determine trend
  const trend = slope > 1 ? 'improving' : slope < -1 ? 'declining' : 'stable';

  return {
    predictedScore: Math.round(predictedScore),
    confidence: Math.round(confidence * 100) / 100,
    trend,
  };
}

