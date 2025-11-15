import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export const dynamic = 'force-dynamic';

// Batch scan multiple domains
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domains, profile = 'deep', parallel = true } = body;

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        { error: 'domains array is required' },
        { status: 400 }
      );
    }

    if (domains.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 domains per batch scan' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const errors: any[] = [];

    if (parallel) {
      // Scan domains in parallel
      const scanPromises = domains.map(async (domain: string) => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
            process.env.NEXT_PUBLIC_BASE_URL || 
            'http://localhost:3000';
          const response = await fetch(
            `${baseUrl}/api/domain?domain=${encodeURIComponent(domain)}&profile=${profile}`
          );

          if (!response.ok) {
            throw new Error(`Scan failed for ${domain}: ${response.statusText}`);
          }

          const data = await response.json();
          return { domain, success: true, data };
        } catch (error: any) {
          return { domain, success: false, error: error.message };
        }
      });

      const scanResults = await Promise.all(scanPromises);

      scanResults.forEach(result => {
        if (result.success) {
          results.push(result);
        } else {
          errors.push(result);
        }
      });
    } else {
      // Scan domains sequentially
      for (const domain of domains) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
            process.env.NEXT_PUBLIC_BASE_URL || 
            'http://localhost:3000';
          const response = await fetch(
            `${baseUrl}/api/domain?domain=${encodeURIComponent(domain)}&profile=${profile}`
          );

          if (!response.ok) {
            throw new Error(`Scan failed for ${domain}: ${response.statusText}`);
          }

          const data = await response.json();
          results.push({ domain, success: true, data });
        } catch (error: any) {
          errors.push({ domain, success: false, error: error.message });
        }
      }
    }

    // Calculate summary statistics
    const summary = {
      total: domains.length,
      successful: results.length,
      failed: errors.length,
      averageScore: results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + (r.data?.securityScore || 0), 0) /
              results.length
          )
        : 0,
      riskDistribution: {
        low: results.filter(r => r.data?.riskAssessment?.riskLevel === 'low').length,
        medium: results.filter(r => r.data?.riskAssessment?.riskLevel === 'medium').length,
        high: results.filter(r => r.data?.riskAssessment?.riskLevel === 'high').length,
        critical: results.filter(r => r.data?.riskAssessment?.riskLevel === 'critical').length,
      },
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Batch scan failed: ${error.message}` },
      { status: 500 }
    );
  }
}

