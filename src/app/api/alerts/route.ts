import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export const dynamic = 'force-dynamic';

// In-memory storage for alert configurations (in production, use a database)
const alertConfigs = new Map<string, {
  id: string;
  domain: string;
  threshold: number;
  webhookUrl?: string;
  email?: string;
  enabled: boolean;
  lastAlert?: Date;
}>();

// Create or update alert configuration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, threshold = 80, webhookUrl, email, enabled = true } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'domain is required' },
        { status: 400 }
      );
    }

    if (threshold < 0 || threshold > 100) {
      return NextResponse.json(
        { error: 'threshold must be between 0 and 100' },
        { status: 400 }
      );
    }

    const id = `alert_${domain}_${Date.now()}`;
    
    alertConfigs.set(id, {
      id,
      domain,
      threshold,
      webhookUrl,
      email,
      enabled,
    });

    return NextResponse.json({
      success: true,
      id,
      message: 'Alert configuration created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to create alert: ${error.message}` },
      { status: 500 }
    );
  }
}

// Get alert configurations
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  let alerts = Array.from(alertConfigs.values());

  if (domain) {
    alerts = alerts.filter(alert => alert.domain === domain);
  }

  return NextResponse.json({
    success: true,
    alerts: alerts.map(alert => ({
      ...alert,
      lastAlert: alert.lastAlert?.toISOString(),
    })),
  });
}

// Check if alert should be triggered
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { domain, securityScore } = body;

    if (!domain || securityScore === undefined) {
      return NextResponse.json(
        { error: 'domain and securityScore are required' },
        { status: 400 }
      );
    }

    // Find alerts for this domain
    const domainAlerts = Array.from(alertConfigs.values()).filter(
      alert => alert.domain === domain && alert.enabled
    );

    const triggeredAlerts: any[] = [];

    for (const alert of domainAlerts) {
      if (securityScore < alert.threshold) {
        // Alert threshold breached
        const alertMessage = {
          domain,
          securityScore,
          threshold: alert.threshold,
          message: `Security score ${securityScore} is below threshold of ${alert.threshold}`,
          timestamp: new Date().toISOString(),
        };

        // Send webhook notification
        if (alert.webhookUrl) {
          try {
            await fetch(alert.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(alertMessage),
            });
          } catch (error) {
            console.error('Failed to send webhook alert:', error);
          }
        }

        // Send email notification (would need email service integration)
        if (alert.email) {
          // TODO: Integrate with email service
          console.log('Email alert would be sent to:', alert.email);
        }

        alert.lastAlert = new Date();
        alertConfigs.set(alert.id, alert);
        triggeredAlerts.push(alert.id);
      }
    }

    return NextResponse.json({
      success: true,
      triggered: triggeredAlerts.length > 0,
      alertsTriggered: triggeredAlerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to check alerts: ${error.message}` },
      { status: 500 }
    );
  }
}

// Delete alert configuration
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'id is required' },
      { status: 400 }
    );
  }

  const deleted = alertConfigs.delete(id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Alert configuration not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Alert configuration deleted successfully',
  });
}

