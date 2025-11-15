/**
 * Automation Features
 * - Scheduled Scanning
 * - Batch Processing
 * - Webhook Integration
 * - Automated Alerts
 */

import fetch from 'node-fetch';

export interface ScheduledScan {
  id: string;
  domain: string;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string; // HH:MM format
    days?: number[]; // For weekly/monthly
    cron?: string; // For custom schedules
  };
  config: {
    profile: 'quick' | 'standard' | 'deep';
    customConfig?: any;
  };
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  webhooks?: string[];
  emailNotifications?: string[];
}

export interface BatchScan {
  id: string;
  domains: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  results: Array<{
    domain: string;
    status: 'success' | 'failed';
    result?: any;
    error?: string;
  }>;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Schedule a scan
 */
export function scheduleScan(config: Omit<ScheduledScan, 'id' | 'lastRun' | 'nextRun'>): ScheduledScan {
  const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const nextRun = calculateNextRun(config.schedule);
  
  return {
    id,
    ...config,
    lastRun: undefined,
    nextRun,
  };
}

/**
 * Calculate next run time
 */
function calculateNextRun(schedule: ScheduledScan['schedule']): Date {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  
  let nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  
  if (nextRun <= now) {
    // If time has passed today, schedule for tomorrow
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  if (schedule.type === 'weekly' && schedule.days) {
    // Find next matching day
    const currentDay = now.getDay();
    const nextDay = schedule.days.find(d => d > currentDay) || schedule.days[0];
    const daysUntilNext = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;
    nextRun.setDate(nextRun.getDate() + daysUntilNext);
  } else if (schedule.type === 'monthly' && schedule.days) {
    // Find next matching day of month
    const currentDay = now.getDate();
    const nextDay = schedule.days.find(d => d > currentDay) || schedule.days[0];
    if (nextDay > currentDay) {
      nextRun.setDate(nextDay);
    } else {
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(nextDay);
    }
  }
  
  return nextRun;
}

/**
 * Create batch scan
 */
export function createBatchScan(domains: string[]): BatchScan {
  const id = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    domains,
    status: 'pending',
    progress: {
      total: domains.length,
      completed: 0,
      failed: 0,
    },
    results: [],
    createdAt: new Date(),
  };
}

/**
 * Update batch scan progress
 */
export function updateBatchScanProgress(
  batchScan: BatchScan,
  domain: string,
  result?: any,
  error?: string
): BatchScan {
  const results = [...batchScan.results];
  
  if (result) {
    results.push({
      domain,
      status: 'success',
      result,
    });
    batchScan.progress.completed++;
  } else if (error) {
    results.push({
      domain,
      status: 'failed',
      error,
    });
    batchScan.progress.failed++;
  }
  
  const isComplete = batchScan.progress.completed + batchScan.progress.failed >= batchScan.progress.total;
  
  return {
    ...batchScan,
    status: isComplete ? 'completed' : 'running',
    progress: {
      ...batchScan.progress,
    },
    results,
    completedAt: isComplete ? new Date() : batchScan.completedAt,
  };
}

/**
 * Send webhook notification
 */
export async function sendWebhookNotification(
  webhookUrl: string,
  event: string,
  data: any
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data,
      }),
      signal: AbortSignal.timeout(5000),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Webhook notification error:', error);
    return false;
  }
}

/**
 * Send email notification
 */
export async function sendEmailNotification(
  email: string,
  subject: string,
  body: string
): Promise<boolean> {
  // Email notification would be implemented using email service
  // For now, return true as placeholder
  console.log(`Email notification to ${email}: ${subject}`);
  return true;
}

/**
 * Process scheduled scans
 */
export function processScheduledScans(
  scheduledScans: ScheduledScan[]
): Array<{ scan: ScheduledScan; shouldRun: boolean }> {
  const now = new Date();
  
  return scheduledScans
    .filter(scan => scan.enabled)
    .map(scan => ({
      scan,
      shouldRun: scan.nextRun ? scan.nextRun <= now : false,
    }))
    .filter(item => item.shouldRun);
}

/**
 * Update scheduled scan after run
 */
export function updateScheduledScanAfterRun(scan: ScheduledScan): ScheduledScan {
  return {
    ...scan,
    lastRun: new Date(),
    nextRun: calculateNextRun(scan.schedule),
  };
}

