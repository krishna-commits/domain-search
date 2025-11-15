/**
 * WAF Detection & Bypass Testing
 * - Cloudflare Detection
 * - AWS WAF Detection
 * - Azure WAF Detection
 * - Bypass Technique Testing
 */

import fetch from 'node-fetch';

export interface WAFDetectionResult {
  detected: boolean;
  type: string | null;
  version: string | null;
  headers: Record<string, string>;
  bypassTechniques: Array<{
    technique: string;
    tested: boolean;
    successful: boolean;
    description: string;
  }>;
  protection: {
    sqlInjection: boolean;
    xss: boolean;
    pathTraversal: boolean;
    rateLimiting: boolean;
  };
  vulnerabilities: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  score: number;
  recommendations: string[];
}

export async function detectWAF(
  baseUrl: string,
  headers: Record<string, string>
): Promise<WAFDetectionResult> {
  const result: WAFDetectionResult = {
    detected: false,
    type: null,
    version: null,
    headers: {},
    bypassTechniques: [],
    protection: {
      sqlInjection: false,
      xss: false,
      pathTraversal: false,
      rateLimiting: false,
    },
    vulnerabilities: [],
    score: 100,
    recommendations: [],
  };

  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  const base = `${url.protocol}//${url.hostname}`;

  // Cloudflare Detection
  if (headers['cf-ray'] || headers['cf-request-id'] || headers['server']?.includes('cloudflare')) {
    result.detected = true;
    result.type = 'Cloudflare';
    result.headers['cf-ray'] = headers['cf-ray'] || '';
    result.headers['cf-request-id'] = headers['cf-request-id'] || '';
    if (headers['cf-request-id']) {
      result.version = 'Detected';
    }
  }

  // AWS WAF Detection
  if (headers['x-amzn-requestid'] || headers['x-amz-request-id'] || headers['x-amzn-trace-id']) {
    result.detected = true;
    if (!result.type) {
      result.type = 'AWS WAF';
    }
    result.headers['x-amzn-requestid'] = headers['x-amzn-requestid'] || '';
    result.headers['x-amz-request-id'] = headers['x-amz-request-id'] || '';
  }

  // Azure WAF Detection
  if (headers['x-azure-ref'] || headers['x-ms-request-id']) {
    result.detected = true;
    if (!result.type) {
      result.type = 'Azure WAF';
    }
    result.headers['x-azure-ref'] = headers['x-azure-ref'] || '';
    result.headers['x-ms-request-id'] = headers['x-ms-request-id'] || '';
  }

  // ModSecurity Detection
  if (headers['server']?.includes('mod_security') || headers['x-modsecurity']) {
    result.detected = true;
    if (!result.type) {
      result.type = 'ModSecurity';
    }
  }

  // Sucuri Detection
  if (headers['x-sucuri-id'] || headers['server']?.includes('sucuri')) {
    result.detected = true;
    if (!result.type) {
      result.type = 'Sucuri';
    }
  }

  // Test WAF Protection
  const testPayloads = [
    { type: 'SQL Injection', payload: "' OR '1'='1", protection: 'sqlInjection' as const },
    { type: 'XSS', payload: '<script>alert(1)</script>', protection: 'xss' as const },
    { type: 'Path Traversal', payload: '../../../etc/passwd', protection: 'pathTraversal' as const },
  ];

  for (const test of testPayloads) {
    try {
      const testUrl = `${base}/?test=${encodeURIComponent(test.payload)}`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'WAF-Test' },
        timeout: 5000,
      }).catch(() => null);

      if (response) {
        // Check if WAF blocked the request
        const blocked = response.status === 403 || 
                       response.status === 406 || 
                       response.status === 413 ||
                       response.headers.get('x-waf') ||
                       response.headers.get('cf-blocked') ||
                       response.headers.get('x-sucuri-block');

        if (blocked) {
          result.protection[test.protection] = true;
        } else {
          result.bypassTechniques.push({
            technique: test.type,
            tested: true,
            successful: true,
            description: `WAF did not block ${test.type} payload`,
          });
        }
      }
    } catch {
      // Test failed
    }
  }

  // Rate Limiting Test
  try {
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(fetch(base, {
        method: 'GET',
        timeout: 3000,
      }).catch(() => null));
    }
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r && (r.status === 429 || r.headers.get('x-ratelimit-remaining')));
    result.protection.rateLimiting = rateLimited || false;
  } catch {
    // Test failed
  }

  // Generate vulnerabilities
  if (result.detected && !result.protection.sqlInjection) {
    result.vulnerabilities.push({
      type: 'SQL Injection Not Blocked',
      severity: 'high',
      description: 'WAF does not appear to block SQL injection attempts',
      recommendation: 'Configure WAF rules to block SQL injection patterns',
    });
  }

  if (result.detected && !result.protection.xss) {
    result.vulnerabilities.push({
      type: 'XSS Not Blocked',
      severity: 'high',
      description: 'WAF does not appear to block XSS attempts',
      recommendation: 'Configure WAF rules to block XSS patterns',
    });
  }

  if (!result.detected) {
    result.vulnerabilities.push({
      type: 'No WAF Detected',
      severity: 'medium',
      description: 'No WAF protection detected',
      recommendation: 'Consider implementing WAF protection',
    });
  }

  // Calculate score
  let score = 100;
  if (!result.detected) score -= 20;
  if (!result.protection.sqlInjection) score -= 15;
  if (!result.protection.xss) score -= 15;
  if (!result.protection.rateLimiting) score -= 10;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 20;
    else if (vuln.severity === 'high') score -= 10;
    else if (vuln.severity === 'medium') score -= 5;
  });
  result.score = Math.max(0, score);

  // Generate recommendations
  if (!result.detected) {
    result.recommendations.push('Consider implementing WAF protection');
  }
  if (result.detected && !result.protection.sqlInjection) {
    result.recommendations.push('Configure WAF to block SQL injection attempts');
  }
  if (result.detected && !result.protection.xss) {
    result.recommendations.push('Configure WAF to block XSS attempts');
  }
  if (!result.protection.rateLimiting) {
    result.recommendations.push('Implement rate limiting protection');
  }

  return result;
}

