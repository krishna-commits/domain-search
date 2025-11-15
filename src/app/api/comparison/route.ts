import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export const dynamic = 'force-dynamic';

// Compare multiple domains
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domains, profile = 'deep' } = body;

    if (!domains || !Array.isArray(domains) || domains.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 domains are required for comparison' },
        { status: 400 }
      );
    }

    if (domains.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 domains per comparison' },
        { status: 400 }
      );
    }

    // Scan all domains in parallel
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      process.env.NEXT_PUBLIC_BASE_URL || 
      'http://localhost:3000';
    const scanPromises = domains.map(async (domain: string) => {
      try {
        const response = await fetch(
          `${baseUrl}/api/domain?domain=${encodeURIComponent(domain)}&profile=${profile}`
        );

        if (!response.ok) {
          throw new Error(`Scan failed for ${domain}`);
        }

        const data = await response.json();
        return { domain, success: true, data };
      } catch (error: any) {
        return { domain, success: false, error: error.message };
      }
    });

    const scanResults = await Promise.all(scanPromises);

    // Extract comparison data
    const comparison = scanResults
      .filter(r => r.success)
      .map(r => ({
        domain: r.domain,
        securityScore: r.data?.securityScore || 0,
        riskLevel: r.data?.riskAssessment?.riskLevel || 'unknown',
        sslValid: r.data?.ssl?.valid || false,
        headersCount: r.data?.security?.headers
          ? Object.values(r.data.security.headers).filter((h: any) => h.present).length
          : 0,
        totalHeaders: r.data?.security?.headers
          ? Object.keys(r.data.security.headers).length
          : 0,
        cookiesScore: r.data?.cookies?.score || 0,
        cspScore: r.data?.csp?.score || 0,
        emailSecurityScore: r.data?.emailSecurity?.score || 0,
        dnsScore: r.data?.dnsAnalysis?.score || 0,
        ipReputationScore: r.data?.ipReputation?.reputationScore || 0,
      }));

    // Calculate rankings
    const ranked = [...comparison].sort((a, b) => b.securityScore - a.securityScore);

    // Find best and worst
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];

    // Calculate averages
    const averages = {
      securityScore: Math.round(
        comparison.reduce((sum, d) => sum + d.securityScore, 0) / comparison.length
      ),
      headersCount: Math.round(
        comparison.reduce((sum, d) => sum + d.headersCount, 0) / comparison.length
      ),
      cookiesScore: Math.round(
        comparison.reduce((sum, d) => sum + d.cookiesScore, 0) / comparison.length
      ),
      cspScore: Math.round(
        comparison.reduce((sum, d) => sum + d.cspScore, 0) / comparison.length
      ),
      emailSecurityScore: Math.round(
        comparison.reduce((sum, d) => sum + d.emailSecurityScore, 0) / comparison.length
      ),
      dnsScore: Math.round(
        comparison.reduce((sum, d) => sum + d.dnsScore, 0) / comparison.length
      ),
      ipReputationScore: Math.round(
        comparison.reduce((sum, d) => sum + d.ipReputationScore, 0) / comparison.length
      ),
    };

    return NextResponse.json({
      success: true,
      comparison,
      ranked,
      best,
      worst,
      averages,
      errors: scanResults.filter(r => !r.success),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Comparison failed: ${error.message}` },
      { status: 500 }
    );
  }
}

