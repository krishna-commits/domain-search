import { NextRequest, NextResponse } from 'next/server';
import { checkSSLExpiration, needsExpirationAlert } from '@/app/utils/sslMonitoring';
import { sendEmail, generateEmailTemplate } from '@/app/utils/emailService';
import { detectDNSChanges, getCurrentDNSRecords } from '@/app/utils/dnsChangeDetection';
import { performUptimeCheck, calculateUptimeStats, shouldTriggerUptimeAlert } from '@/app/utils/uptimeMonitoring';
import { checkCompliance } from '@/app/utils/complianceChecker';

/**
 * Real-time monitoring endpoint
 * POST /api/monitoring - Start monitoring
 * GET /api/monitoring?domain=example.com - Get monitoring status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  try {
    // Perform monitoring checks
    const [sslCheck, dnsCheck, uptimeCheck] = await Promise.all([
      checkSSLExpiration(domain),
      getCurrentDNSRecords(domain),
      performUptimeCheck(domain),
    ]);

    return NextResponse.json({
      domain,
      timestamp: new Date().toISOString(),
      ssl: sslCheck,
      dns: dnsCheck,
      uptime: uptimeCheck,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Start monitoring for a domain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, email, checks } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Perform checks
    const results: any = {};

    if (!checks || checks.includes('ssl')) {
      const sslCheck = await checkSSLExpiration(domain);
      if (sslCheck && needsExpirationAlert(sslCheck.daysUntilExpiration)) {
        if (email) {
          const template = generateEmailTemplate({
            type: 'ssl_expiration',
            data: {
              domain,
              daysUntilExpiration: sslCheck.daysUntilExpiration,
              validTo: sslCheck.validTo,
            },
          });
          await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });
        }
        results.sslAlert = true;
      }
      results.ssl = sslCheck;
    }

    if (!checks || checks.includes('dns')) {
      // DNS change detection would require storing previous records
      // For now, just get current records
      const dnsRecords = await getCurrentDNSRecords(domain);
      results.dns = dnsRecords;
    }

    if (!checks || checks.includes('uptime')) {
      const uptimeCheck = await performUptimeCheck(domain);
      const stats = calculateUptimeStats([uptimeCheck]);
      
      if (shouldTriggerUptimeAlert(stats) && email) {
        const template = generateEmailTemplate({
          type: 'uptime',
          data: {
            domain,
            status: uptimeCheck.status,
            downtime: uptimeCheck.status === 'down' ? 1 : 0,
          },
        });
        await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
        results.uptimeAlert = true;
      }
      results.uptime = stats;
    }

    if (!checks || checks.includes('compliance')) {
      // Compliance check would require full scan data
      // This is a simplified version
      results.compliance = {
        message: 'Full compliance check requires complete scan data',
      };
    }

    return NextResponse.json({
      domain,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

