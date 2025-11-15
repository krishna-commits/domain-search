import { NextResponse } from 'next/server';
import { publishToConfluence, testConfluenceConnection, ConfluenceConfig } from '@/integrations/confluence-integration';

export const dynamic = 'force-dynamic';

/**
 * POST /api/confluence
 * Publish scan results to Confluence
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config, scanData, pageTitle } = body;

    if (!config || !scanData) {
      return NextResponse.json(
        { error: 'config and scanData are required' },
        { status: 400 }
      );
    }

    // Validate config
    const confluenceConfig: ConfluenceConfig = {
      baseUrl: config.baseUrl,
      username: config.username,
      apiToken: config.apiToken,
      spaceKey: config.spaceKey,
      parentPageId: config.parentPageId,
    };

    if (!confluenceConfig.baseUrl || !confluenceConfig.username || !confluenceConfig.apiToken || !confluenceConfig.spaceKey) {
      return NextResponse.json(
        { error: 'Missing required Confluence configuration (baseUrl, username, apiToken, spaceKey)' },
        { status: 400 }
      );
    }

    // Publish to Confluence
    const result = await publishToConfluence(confluenceConfig, scanData, pageTitle);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to publish to Confluence' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pageId: result.pageId,
      pageUrl: result.pageUrl,
      message: 'Scan results published to Confluence successfully',
    });
  } catch (error: any) {
    console.error('Confluence publish error:', error);
    return NextResponse.json(
      { error: `Failed to publish to Confluence: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/confluence?action=test
 * Test Confluence connection
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'test') {
      const baseUrl = searchParams.get('baseUrl');
      const username = searchParams.get('username');
      const apiToken = searchParams.get('apiToken');
      const spaceKey = searchParams.get('spaceKey');

      if (!baseUrl || !username || !apiToken || !spaceKey) {
        return NextResponse.json(
          { error: 'Missing required parameters: baseUrl, username, apiToken, spaceKey' },
          { status: 400 }
        );
      }

      const config: ConfluenceConfig = {
        baseUrl,
        username,
        apiToken,
        spaceKey,
      };

      const result = await testConfluenceConnection(config);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Connection test failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Confluence connection successful',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=test' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Connection test failed: ${error.message}` },
      { status: 500 }
    );
  }
}

