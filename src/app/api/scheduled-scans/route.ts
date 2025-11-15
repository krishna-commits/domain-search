import { NextResponse } from 'next/server';
import { setTimeout as delay } from 'timers/promises';

export const dynamic = 'force-dynamic';

// In-memory storage for scheduled scans (in production, use a database)
const scheduledScans = new Map<string, {
  id: string;
  domain: string;
  schedule: string; // cron expression
  profile: string;
  webhookUrl?: string;
  lastRun?: Date;
  nextRun?: Date;
  enabled: boolean;
}>();

// Schedule a new scan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, schedule, profile = 'deep', webhookUrl, enabled = true } = body;

    if (!domain || !schedule) {
      return NextResponse.json(
        { error: 'domain and schedule are required' },
        { status: 400 }
      );
    }

    // Validate cron expression (basic validation)
    const cronPattern = /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    if (!cronPattern.test(schedule)) {
      return NextResponse.json(
        { error: 'Invalid cron expression format' },
        { status: 400 }
      );
    }

    const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nextRun = calculateNextRun(schedule);

    scheduledScans.set(id, {
      id,
      domain,
      schedule,
      profile,
      webhookUrl,
      enabled,
      nextRun,
    });

    return NextResponse.json({
      success: true,
      id,
      message: 'Scheduled scan created successfully',
      nextRun: nextRun.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to create scheduled scan: ${error.message}` },
      { status: 500 }
    );
  }
}

// Get all scheduled scans
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  let scans = Array.from(scheduledScans.values());

  if (domain) {
    scans = scans.filter(scan => scan.domain === domain);
  }

  return NextResponse.json({
    success: true,
    scans: scans.map(scan => ({
      ...scan,
      lastRun: scan.lastRun?.toISOString(),
      nextRun: scan.nextRun?.toISOString(),
    })),
  });
}

// Update a scheduled scan
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, enabled, schedule, webhookUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const scan = scheduledScans.get(id);
    if (!scan) {
      return NextResponse.json(
        { error: 'Scheduled scan not found' },
        { status: 404 }
      );
    }

    if (enabled !== undefined) scan.enabled = enabled;
    if (schedule) {
      scan.schedule = schedule;
      scan.nextRun = calculateNextRun(schedule);
    }
    if (webhookUrl !== undefined) scan.webhookUrl = webhookUrl;

    scheduledScans.set(id, scan);

    return NextResponse.json({
      success: true,
      message: 'Scheduled scan updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to update scheduled scan: ${error.message}` },
      { status: 500 }
    );
  }
}

// Delete a scheduled scan
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'id is required' },
      { status: 400 }
    );
  }

  const deleted = scheduledScans.delete(id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Scheduled scan not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Scheduled scan deleted successfully',
  });
}

// Calculate next run time from cron expression
function calculateNextRun(cron: string): Date {
  // Simplified cron parser - in production, use a proper cron library
  const now = new Date();
  const nextRun = new Date(now);
  
  // For demo purposes, add 1 hour
  // In production, use a library like node-cron to properly parse cron expressions
  nextRun.setHours(nextRun.getHours() + 1);
  
  return nextRun;
}

