/**
 * API Security Testing
 * - API Authentication Analysis
 * - Rate Limiting Detection
 */

import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

export interface APIAuthenticationResult {
  authenticationMethods: string[];
  apiKeyDetected: boolean;
  bearerTokenDetected: boolean;
  basicAuthDetected: boolean;
  oauthDetected: boolean;
  jwtDetected: boolean;
  authenticationRequired: boolean;
  score: number;
  recommendations: string[];
}

export interface RateLimitingResult {
  rateLimitingDetected: boolean;
  rateLimitHeaders: string[];
  rateLimitWindow: number | null;
  rateLimitMax: number | null;
  rateLimitRemaining: number | null;
  rateLimitReset: number | null;
  recommendations: string[];
}

/**
 * Analyze API authentication methods
 */
export async function analyzeAPIAuthentication(
  hostname: string,
  apiEndpoints: Array<{ url: string; method: string }>
): Promise<APIAuthenticationResult> {
  const authenticationMethods: string[] = [];
  let apiKeyDetected = false;
  let bearerTokenDetected = false;
  let basicAuthDetected = false;
  let oauthDetected = false;
  let jwtDetected = false;
  let authenticationRequired = false;

  // Test a few endpoints
  const testEndpoints = apiEndpoints.slice(0, 3);

  for (const endpoint of testEndpoints) {
    try {
      const url = endpoint.url.startsWith('http') 
        ? endpoint.url 
        : `https://${hostname}${endpoint.url.startsWith('/') ? '' : '/'}${endpoint.url}`;

      // Test without authentication
      const response = await fetch(url, {
        method: endpoint.method || 'GET',
        signal: AbortSignal.timeout(3000),
      });

      if (response.status === 401 || response.status === 403) {
        authenticationRequired = true;
        const authHeader = response.headers.get('WWW-Authenticate');
        
        if (authHeader) {
          if (authHeader.toLowerCase().includes('bearer')) {
            bearerTokenDetected = true;
            authenticationMethods.push('Bearer Token');
          }
          if (authHeader.toLowerCase().includes('basic')) {
            basicAuthDetected = true;
            authenticationMethods.push('Basic Auth');
          }
          if (authHeader.toLowerCase().includes('oauth')) {
            oauthDetected = true;
            authenticationMethods.push('OAuth');
          }
        }
      }

      // Check response headers for auth hints
      const headers = response.headers;
      if (headers.get('X-API-Key') || headers.get('API-Key')) {
        apiKeyDetected = true;
        authenticationMethods.push('API Key');
      }

      // Check for JWT in responses or documentation
      const responseText = await response.text();
      if (/jwt|json.?web.?token|\.eyJ/i.test(responseText)) {
        jwtDetected = true;
        authenticationMethods.push('JWT');
      }
    } catch (error) {
      // Endpoint not accessible
    }
  }

  let score = 0;
  const recommendations: string[] = [];

  if (authenticationRequired) {
    score += 30;
  } else {
    recommendations.push('Protect API endpoints with authentication');
  }

  if (bearerTokenDetected || jwtDetected) {
    score += 25;
  } else if (authenticationRequired) {
    recommendations.push('Consider using Bearer tokens or JWT for API authentication');
  }

  if (apiKeyDetected) {
    score += 20;
  } else if (authenticationRequired) {
    recommendations.push('Consider API key authentication for programmatic access');
  }

  if (oauthDetected) {
    score += 15;
  } else {
    recommendations.push('Consider OAuth 2.0 for third-party integrations');
  }

  if (basicAuthDetected) {
    score += 10;
    recommendations.push('Avoid Basic Auth - use more secure authentication methods');
  }

  return {
    authenticationMethods: [...new Set(authenticationMethods)],
    apiKeyDetected,
    bearerTokenDetected,
    basicAuthDetected,
    oauthDetected,
    jwtDetected,
    authenticationRequired,
    score,
    recommendations,
  };
}

/**
 * Detect rate limiting
 */
export async function detectRateLimiting(
  hostname: string,
  apiEndpoints: Array<{ url: string; method: string }>
): Promise<RateLimitingResult> {
  let rateLimitingDetected = false;
  const rateLimitHeaders: string[] = [];
  let rateLimitWindow: number | null = null;
  let rateLimitMax: number | null = null;
  let rateLimitRemaining: number | null = null;
  let rateLimitReset: number | null = null;

  // Test an endpoint with multiple rapid requests
  if (apiEndpoints.length > 0) {
    const testEndpoint = apiEndpoints[0];
    const url = testEndpoint.url.startsWith('http')
      ? testEndpoint.url
      : `https://${hostname}${testEndpoint.url.startsWith('/') ? '' : '/'}${testEndpoint.url}`;

    try {
      // Make multiple rapid requests
      const requests = Array(5).fill(null).map(() =>
        fetch(url, {
          method: testEndpoint.method || 'GET',
          signal: AbortSignal.timeout(2000),
        })
      );

      const responses = await Promise.all(requests);

      for (const response of responses) {
        // Check for rate limit headers
        const headers = [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
          'X-RateLimit-Window',
          'RateLimit-Limit',
          'RateLimit-Remaining',
          'RateLimit-Reset',
          'Retry-After',
        ];

        for (const header of headers) {
          const value = response.headers.get(header);
          if (value) {
            rateLimitingDetected = true;
            rateLimitHeaders.push(header);

            if (header.includes('Limit')) {
              rateLimitMax = parseInt(value) || null;
            }
            if (header.includes('Remaining')) {
              rateLimitRemaining = parseInt(value) || null;
            }
            if (header.includes('Reset') || header.includes('Retry')) {
              rateLimitReset = parseInt(value) || null;
            }
            if (header.includes('Window')) {
              rateLimitWindow = parseInt(value) || null;
            }
          }
        }

        // Check for 429 status (Too Many Requests)
        if (response.status === 429) {
          rateLimitingDetected = true;
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            rateLimitReset = parseInt(retryAfter) || null;
          }
        }
      }
    } catch (error) {
      // Error testing rate limiting
    }
  }

  const recommendations: string[] = [];
  if (!rateLimitingDetected) {
    recommendations.push('Implement rate limiting to prevent abuse');
    recommendations.push('Add rate limit headers (X-RateLimit-*) for API consumers');
  } else {
    recommendations.push('Rate limiting is implemented - ensure limits are appropriate');
  }

  return {
    rateLimitingDetected,
    rateLimitHeaders,
    rateLimitWindow,
    rateLimitMax,
    rateLimitRemaining,
    rateLimitReset,
    recommendations,
  };
}
