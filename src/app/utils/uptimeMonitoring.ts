/**
 * Uptime Monitoring
 */
import fetch from 'node-fetch';

export interface UptimeCheck {
  domain: string;
  timestamp: Date;
  status: 'up' | 'down' | 'slow';
  responseTime: number;
  statusCode: number;
  error?: string;
}

export interface UptimeStats {
  domain: string;
  totalChecks: number;
  upChecks: number;
  downChecks: number;
  slowChecks: number;
  uptimePercentage: number;
  averageResponseTime: number;
  lastCheck: Date;
  lastStatus: 'up' | 'down' | 'slow';
}

/**
 * Perform uptime check
 */
export async function performUptimeCheck(domain: string, timeout: number = 10000): Promise<UptimeCheck> {
  const startTime = Date.now();
  const url = `https://${domain}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DomainSecurityScanner/1.0)',
      },
      timeout,
    } as any);

    const responseTime = Date.now() - startTime;
    const statusCode = response.status;

    let status: 'up' | 'down' | 'slow' = 'up';
    if (responseTime > 3000) {
      status = 'slow';
    } else if (!response.ok) {
      status = 'down';
    }

    return {
      domain,
      timestamp: new Date(),
      status,
      responseTime,
      statusCode,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      domain,
      timestamp: new Date(),
      status: 'down',
      responseTime,
      statusCode: 0,
      error: error.message || 'Connection failed',
    };
  }
}

/**
 * Calculate uptime statistics
 */
export function calculateUptimeStats(checks: UptimeCheck[]): UptimeStats {
  if (checks.length === 0) {
    return {
      domain: '',
      totalChecks: 0,
      upChecks: 0,
      downChecks: 0,
      slowChecks: 0,
      uptimePercentage: 0,
      averageResponseTime: 0,
      lastCheck: new Date(),
      lastStatus: 'down',
    };
  }

  const domain = checks[0].domain;
  const totalChecks = checks.length;
  const upChecks = checks.filter(c => c.status === 'up').length;
  const downChecks = checks.filter(c => c.status === 'down').length;
  const slowChecks = checks.filter(c => c.status === 'slow').length;
  const uptimePercentage = (upChecks / totalChecks) * 100;
  const averageResponseTime = checks.reduce((sum, c) => sum + c.responseTime, 0) / totalChecks;
  const lastCheck = checks[checks.length - 1].timestamp;
  const lastStatus = checks[checks.length - 1].status;

  return {
    domain,
    totalChecks,
    upChecks,
    downChecks,
    slowChecks,
    uptimePercentage: Math.round(uptimePercentage * 100) / 100,
    averageResponseTime: Math.round(averageResponseTime),
    lastCheck,
    lastStatus,
  };
}

/**
 * Check if uptime alert should be triggered
 */
export function shouldTriggerUptimeAlert(
  stats: UptimeStats,
  thresholds: {
    uptimeThreshold?: number;
    consecutiveDown?: number;
    slowThreshold?: number;
  } = {}
): boolean {
  const {
    uptimeThreshold = 99,
    consecutiveDown = 3,
    slowThreshold = 5,
  } = thresholds;

  // Check uptime percentage
  if (stats.uptimePercentage < uptimeThreshold) {
    return true;
  }

  // Check consecutive down checks (would need to track this separately)
  // For now, check if last status is down
  if (stats.lastStatus === 'down') {
    return true;
  }

  // Check slow response threshold
  if (stats.slowChecks >= slowThreshold) {
    return true;
  }

  return false;
}

/**
 * Get uptime status message
 */
export function getUptimeStatusMessage(stats: UptimeStats): string {
  if (stats.uptimePercentage >= 99.9) {
    return `Excellent uptime: ${stats.uptimePercentage}%`;
  }
  if (stats.uptimePercentage >= 99) {
    return `Good uptime: ${stats.uptimePercentage}%`;
  }
  if (stats.uptimePercentage >= 95) {
    return `Moderate uptime: ${stats.uptimePercentage}%`;
  }
  return `Poor uptime: ${stats.uptimePercentage}%`;
}

