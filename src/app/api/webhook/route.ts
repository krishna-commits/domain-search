import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export const dynamic = 'force-dynamic';

// Webhook handler for scan completion notifications
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, scanData } = body;

    if (!webhookUrl || !scanData) {
      return NextResponse.json(
        { error: 'webhookUrl and scanData are required' },
        { status: 400 }
      );
    }

    // Send webhook notification
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Domain-Security-Scanner/1.0',
        },
        body: JSON.stringify({
          event: 'scan.completed',
          timestamp: new Date().toISOString(),
          data: scanData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook notification sent successfully',
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to send webhook: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: `Invalid request: ${error.message}` },
      { status: 400 }
    );
  }
}

// GET endpoint to test webhook configuration
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const webhookUrl = searchParams.get('url');

  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'webhookUrl parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Test webhook with a simple ping
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Domain-Security-Scanner/1.0',
      },
      body: JSON.stringify({
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook notification',
      }),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      message: response.ok
        ? 'Webhook test successful'
        : 'Webhook test failed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook test failed: ${error.message}` },
      { status: 500 }
    );
  }
}

