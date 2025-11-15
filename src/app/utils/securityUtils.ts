import { Headers } from 'node-fetch';

// Check security headers
export const analyzeSecurityHeaders = (headers: Headers) => {
  const securityHeaders = [
    'content-security-policy',
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'referrer-policy',
    'permissions-policy',
    'cross-origin-opener-policy',
    'cross-origin-embedder-policy'
  ];

  const results: Record<string, { present: boolean; value: string | null }> = {};

  for (const header of securityHeaders) {
    const value = headers.get(header);
    results[header] = {
      present: !!value,
      value: value
    };
  }

  return results;
};

// Check security protocols
export const checkSecurityProtocols = (tlsVersion: string | undefined, ciphers: string[] | undefined) => {
  const weakProtocols = ['SSLv2', 'SSLv3', 'TLSv1', 'TLSv1.1'];
  const weakCiphers = [
    'RC4', 'DES', '3DES', 'MD5', 'SHA1', 'CBC', 
    'EXP', 'NULL', 'ANON', 'ADH', 'IDEA'
  ];

  tlsVersion = tlsVersion || 'Unknown';
  ciphers = ciphers || [];

  const protocolStatus = !weakProtocols.includes(tlsVersion);
  const cipherStatus = !ciphers.some(cipher => 
    weakCiphers.some(weak => cipher.includes(weak))
  );

  return {
    tlsVersion,
    tlsStatus: protocolStatus ? 'secure' : 'insecure',
    ciphers,
    cipherStatus: cipherStatus ? 'secure' : 'insecure'
  };
};

// Analyze cookies from Set-Cookie headers
export const analyzeCookies = (headers: Headers) => {
  const setCookieHeaders = headers.get('set-cookie');
  if (!setCookieHeaders) {
    return { cookies: [], issues: [], score: 100 };
  }

  const cookies: any[] = [];
  const issues: string[] = [];
  const cookieStrings = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders as string];

  cookieStrings.forEach((cookieStr, index) => {
    const cookie: any = { index, name: '', value: '', secure: false, httpOnly: false, sameSite: null, expires: null, maxAge: null, domain: null, path: null };
    
    const parts = cookieStr.split(';').map((p: string) => p.trim());
    const [nameValue] = parts;
    const [name, value] = nameValue.split('=');
    cookie.name = name;
    cookie.value = value || '';

    parts.slice(1).forEach((part: string) => {
      const lowerPart = part.toLowerCase();
      if (lowerPart === 'secure') cookie.secure = true;
      if (lowerPart === 'httponly') cookie.httpOnly = true;
      if (lowerPart.startsWith('samesite=')) {
        cookie.sameSite = part.split('=')[1]?.toLowerCase() || null;
      }
      if (lowerPart.startsWith('expires=')) {
        cookie.expires = part.split('=')[1] || null;
      }
      if (lowerPart.startsWith('max-age=')) {
        cookie.maxAge = parseInt(part.split('=')[1] || '0', 10);
      }
      if (lowerPart.startsWith('domain=')) {
        cookie.domain = part.split('=')[1] || null;
      }
      if (lowerPart.startsWith('path=')) {
        cookie.path = part.split('=')[1] || null;
      }
    });

    cookies.push(cookie);

    // Check for security issues
    if (!cookie.secure) issues.push(`Cookie "${cookie.name}" missing Secure flag`);
    if (!cookie.httpOnly) issues.push(`Cookie "${cookie.name}" missing HttpOnly flag`);
    if (!cookie.sameSite || cookie.sameSite === 'none') {
      if (!cookie.secure) {
        issues.push(`Cookie "${cookie.name}" has SameSite=None without Secure flag`);
      }
    }
  });

  const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20));
  return { cookies, issues, score };
};

// Validate Content Security Policy
export const validateCSP = (cspHeader: string | null) => {
  if (!cspHeader) {
    return { valid: false, issues: ['CSP header is missing'], score: 0 };
  }

  const issues: string[] = [];
  const directives = cspHeader.split(';').map(d => d.trim()).filter(Boolean);
  const directiveMap: Record<string, string[]> = {};

  directives.forEach(dir => {
    const [name, ...values] = dir.split(/\s+/);
    directiveMap[name.toLowerCase()] = values;
  });

  // Check for unsafe-inline
  ['script-src', 'style-src'].forEach(directive => {
    if (directiveMap[directive]?.includes("'unsafe-inline'")) {
      issues.push(`${directive} allows unsafe-inline`);
    }
  });

  // Check for unsafe-eval
  if (directiveMap['script-src']?.includes("'unsafe-eval'")) {
    issues.push('script-src allows unsafe-eval');
  }

  // Check for missing default-src
  if (!directiveMap['default-src']) {
    issues.push('Missing default-src directive');
  }

  const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 25));
  return { valid: issues.length === 0, issues, score, directives: directiveMap };
};

// Check for mixed content (HTTP resources on HTTPS page)
export const detectMixedContent = (html: string, baseUrl: string) => {
  const mixedContent: any[] = [];
  const httpRegex = /https?:\/\/([^"'\s>]+)/gi;
  let match;

  while ((match = httpRegex.exec(html)) !== null) {
    const url = match[0];
    if (url.startsWith('http://')) {
      mixedContent.push({
        url,
        type: 'http',
        context: html.substring(Math.max(0, match.index - 50), Math.min(html.length, match.index + match[0].length + 50))
      });
    }
  }

  // Check for protocol-relative URLs
  const protocolRelativeRegex = /\/\/([^"'\s>]+)/gi;
  while ((match = protocolRelativeRegex.exec(html)) !== null) {
    mixedContent.push({
      url: match[0],
      type: 'protocol-relative',
      context: html.substring(Math.max(0, match.index - 50), Math.min(html.length, match.index + match[0].length + 50))
    });
  }

  return {
    found: mixedContent.length > 0,
    count: mixedContent.length,
    items: mixedContent,
    score: mixedContent.length === 0 ? 100 : Math.max(0, 100 - (mixedContent.length * 10))
  };
};

// Check HSTS preload status
export const checkHSTSPreload = async (domain: string): Promise<{ preloaded: boolean; eligible: boolean; errors?: string[] }> => {
  try {
    const response = await fetch(`https://hstspreload.org/api/v2/status?domain=${domain}`);
    if (!response.ok) {
      return { preloaded: false, eligible: false, errors: ['Failed to check HSTS preload status'] };
    }
    const data = await response.json();
    return {
      preloaded: data.status === 'preloaded',
      eligible: data.status === 'preloadable' || data.status === 'preloaded',
      errors: data.errors || []
    };
  } catch {
    return { preloaded: false, eligible: false, errors: ['Error checking HSTS preload'] };
  }
};

// Analyze email security (SPF, DKIM, DMARC)
export const analyzeEmailSecurity = (txtRecords: string[], domain: string) => {
  const results: any = {
    spf: { found: false, record: null, valid: false, issues: [] },
    dkim: { found: false, record: null, valid: false, issues: [] },
    dmarc: { found: false, record: null, valid: false, issues: [] }
  };

  txtRecords.forEach(record => {
    const upperRecord = record.toUpperCase();
    
    // SPF check
    if (upperRecord.startsWith('V=SPF1')) {
      results.spf.found = true;
      results.spf.record = record;
      results.spf.valid = true;
      
      if (!upperRecord.includes('~ALL') && !upperRecord.includes('-ALL')) {
        results.spf.issues.push('SPF record should end with -ALL or ~ALL for better security');
      }
      if (upperRecord.includes('+ALL')) {
        results.spf.issues.push('SPF record contains +ALL which allows all IPs');
        results.spf.valid = false;
      }
    }

    // DMARC check
    if (upperRecord.startsWith('V=DMARC1')) {
      results.dmarc.found = true;
      results.dmarc.record = record;
      results.dmarc.valid = true;
      
      if (!upperRecord.includes('P=REJECT') && !upperRecord.includes('P=QUARANTINE')) {
        results.dmarc.issues.push('DMARC policy should be REJECT or QUARANTINE for better security');
      }
      if (!upperRecord.includes('RUA=')) {
        results.dmarc.issues.push('DMARC record missing RUA (aggregate reports)');
      }
    }
  });

  // DKIM is typically in a subdomain _domainkey, check separately
  // This is a simplified check - full DKIM validation requires DNS lookup
  results.dkim.found = false; // Will be checked via DNS lookup
  results.dkim.record = null;

  const score = [
    results.spf.found && results.spf.valid ? 33 : 0,
    results.dmarc.found && results.dmarc.valid ? 33 : 0,
    results.dkim.found && results.dkim.valid ? 34 : 0
  ].reduce((a, b) => a + b, 0);

  return { ...results, score };
};