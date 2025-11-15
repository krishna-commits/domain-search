/**
 * Real-Time Monitoring System
 * - Continuous Domain Monitoring
 * - Change Detection
 * - Automated Alerting
 */

import { storeHistoricalRecord, getHistoricalRecords } from './historicalTracking';

export interface MonitoringConfig {
  domain: string;
  interval: number; // minutes
  alertThresholds: {
    securityScore: number;
    vulnerabilityCount: number;
    sslExpirationDays: number;
  };
  alertChannels: string[]; // email, webhook, sms
}

export interface MonitoringResult {
  domain: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical';
  changes: Array<{
    type: string;
    field: string;
    oldValue: any;
    newValue: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

/**
 * Monitor domain continuously
 */
export async function monitorDomain(
  domain: string,
  currentScan: any,
  config: MonitoringConfig
): Promise<MonitoringResult> {
  const historicalRecords = await getHistoricalRecords(domain, 2);
  const previousScan = historicalRecords.length > 0 ? historicalRecords[0] : null;

  const changes: Array<{
    type: string;
    field: string;
    oldValue: any;
    newValue: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  const alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }> = [];

  // Detect changes
  if (previousScan) {
    // Security score changes
    if (currentScan.securityScore !== undefined && 
        previousScan.securityScore !== undefined && 
        currentScan.securityScore !== previousScan.securityScore) {
      const currentScore = currentScan.securityScore;
      const previousScore = previousScan.securityScore;
      const diff = currentScore - previousScore;
      changes.push({
        type: 'security_score',
        field: 'securityScore',
        oldValue: previousScore,
        newValue: currentScore,
        severity: diff < -10 ? 'high' : diff < -5 ? 'medium' : 'low',
      });

      if (currentScan.securityScore < config.alertThresholds.securityScore) {
        alerts.push({
          type: 'security_score',
          severity: 'high',
          message: `Security score dropped to ${currentScan.securityScore}`,
          timestamp: new Date(),
        });
      }
    }

    // Vulnerability changes
    const currentVulns = currentScan.vulnerabilities?.length || 0;
    const previousVulns = previousScan.vulnerabilities || 0;
    if (currentVulns !== previousVulns) {
      changes.push({
        type: 'vulnerabilities',
        field: 'vulnerabilityCount',
        oldValue: previousVulns,
        newValue: currentVulns,
        severity: currentVulns > previousVulns ? 'high' : 'low',
      });

      if (currentVulns > config.alertThresholds.vulnerabilityCount) {
        alerts.push({
          type: 'vulnerabilities',
          severity: 'high',
          message: `Vulnerability count increased to ${currentVulns}`,
          timestamp: new Date(),
        });
      }
    }

    // SSL expiration changes
    if (currentScan.ssl?.validTo) {
      const expirationDate = new Date(currentScan.ssl.validTo);
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration < config.alertThresholds.sslExpirationDays) {
        alerts.push({
          type: 'ssl_expiration',
          severity: daysUntilExpiration < 7 ? 'critical' : 'high',
          message: `SSL certificate expires in ${daysUntilExpiration} days`,
          timestamp: new Date(),
        });
      }
    }
  }

  // Determine status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (currentScan.securityScore !== undefined) {
    if (currentScan.securityScore < 60) {
      status = 'critical';
    } else if (currentScan.securityScore < 80) {
      status = 'warning';
    }
  }

  if (alerts.some(a => a.severity === 'critical')) {
    status = 'critical';
  } else if (alerts.some(a => a.severity === 'high')) {
    status = 'warning';
  }

  return {
    domain,
    timestamp: new Date(),
    status,
    changes,
    alerts,
  };
}

/**
 * Setup continuous monitoring
 */
export function setupContinuousMonitoring(
  domain: string,
  config: MonitoringConfig,
  onAlert: (alert: any) => void
): () => void {
  let intervalId: NodeJS.Timeout | null = null;

  const startMonitoring = async () => {
    // This would trigger a scan and check for changes
    // For now, it's a placeholder
  };

  intervalId = setInterval(startMonitoring, config.interval * 60 * 1000);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

