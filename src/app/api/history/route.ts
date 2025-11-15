import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for scan history (in production, use a database)
const scanHistory = new Map<string, {
  id: string;
  domain: string;
  timestamp: Date;
  securityScore: number;
  riskLevel: string;
  data: any;
}>();

// Save scan to history
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, securityScore, riskLevel, data } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'domain is required' },
        { status: 400 }
      );
    }

    const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    scanHistory.set(id, {
      id,
      domain,
      timestamp,
      securityScore: securityScore || 0,
      riskLevel: riskLevel || 'unknown',
      data,
    });

    return NextResponse.json({
      success: true,
      id,
      message: 'Scan saved to history',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to save scan: ${error.message}` },
      { status: 500 }
    );
  }
}

// Get scan history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let history = Array.from(scanHistory.values());

    if (domain) {
      history = history.filter(scan => scan.domain === domain);
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Paginate
    const paginated = history.slice(offset, offset + limit);

    // Calculate statistics
    const stats = history.length > 0 ? {
      totalScans: history.length,
      averageScore: Math.round(
        history.reduce((sum, scan) => sum + scan.securityScore, 0) / history.length
      ),
      riskDistribution: {
        low: history.filter(s => s.riskLevel === 'low').length,
        medium: history.filter(s => s.riskLevel === 'medium').length,
        high: history.filter(s => s.riskLevel === 'high').length,
        critical: history.filter(s => s.riskLevel === 'critical').length,
      },
      scoreTrend: history.slice(0, 10).map(s => ({
        timestamp: s.timestamp.toISOString(),
        score: s.securityScore,
      })),
    } : null;

    return NextResponse.json({
      success: true,
      history: paginated.map(scan => ({
        ...scan,
        timestamp: scan.timestamp.toISOString(),
        // Don't include full data in list, only summary
        data: undefined,
      })),
      stats,
      pagination: {
        total: history.length,
        limit,
        offset,
        hasMore: offset + limit < history.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to retrieve history: ${error.message}` },
      { status: 500 }
    );
  }
}

// Get specific scan from history
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const scan = scanHistory.get(id);
    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found in history' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scan: {
        ...scan,
        timestamp: scan.timestamp.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to retrieve scan: ${error.message}` },
      { status: 500 }
    );
  }
}

// Delete scan from history
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'id is required' },
      { status: 400 }
    );
  }

  const deleted = scanHistory.delete(id);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Scan not found in history' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Scan deleted from history',
  });
}

