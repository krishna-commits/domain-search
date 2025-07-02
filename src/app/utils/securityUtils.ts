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