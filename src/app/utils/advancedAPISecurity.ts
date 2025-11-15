/**
 * Advanced API Security Testing
 * - OpenAPI/Swagger Discovery
 * - WebSocket Security Analysis
 * - OAuth/OIDC Deep Testing
 * - JWT Security Validation
 * - API Versioning Analysis
 * - Rate Limiting Bypass Testing
 */

import fetch from 'node-fetch';

export interface AdvancedAPISecurityResult {
  openAPI: {
    found: boolean;
    endpoints: string[];
    version: string | null;
    exposed: boolean;
    authentication: boolean;
  };
  websocket: {
    endpoints: Array<{
      url: string;
      secure: boolean;
      authentication: boolean;
      subprotocols: string[];
    }>;
    vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
  oauth: {
    endpoints: {
      authorization: string | null;
      token: string | null;
      userinfo: string | null;
      introspection: string | null;
    };
    flows: string[];
    vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
  jwt: {
    tokens: Array<{
      location: string;
      algorithm: string | null;
      expired: boolean;
      valid: boolean;
    }>;
    vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
  versioning: {
    detected: boolean;
    methods: string[];
    versions: string[];
  };
  rateLimiting: {
    detected: boolean;
    bypassPossible: boolean;
    methods: string[];
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

const commonOpenAPIPaths = [
  '/openapi.json',
  '/openapi.yaml',
  '/openapi.yml',
  '/swagger.json',
  '/swagger.yaml',
  '/swagger.yml',
  '/api-docs',
  '/api-docs/swagger.json',
  '/v1/swagger.json',
  '/v2/swagger.json',
  '/swagger-ui.html',
  '/swagger/index.html',
  '/api/swagger.json',
  '/docs',
  '/api/docs',
];

const commonOAuthPaths = [
  '/oauth/authorize',
  '/oauth/token',
  '/oauth2/authorize',
  '/oauth2/token',
  '/auth/authorize',
  '/auth/token',
  '/.well-known/oauth-authorization-server',
  '/.well-known/openid-configuration',
];

export async function testAdvancedAPISecurity(
  baseUrl: string,
  html: string,
  headers: Record<string, string>
): Promise<AdvancedAPISecurityResult> {
  const result: AdvancedAPISecurityResult = {
    openAPI: {
      found: false,
      endpoints: [],
      version: null,
      exposed: false,
      authentication: false,
    },
    websocket: {
      endpoints: [],
      vulnerabilities: [],
    },
    oauth: {
      endpoints: {
        authorization: null,
        token: null,
        userinfo: null,
        introspection: null,
      },
      flows: [],
      vulnerabilities: [],
    },
    jwt: {
      tokens: [],
      vulnerabilities: [],
    },
    versioning: {
      detected: false,
      methods: [],
      versions: [],
    },
    rateLimiting: {
      detected: false,
      bypassPossible: false,
      methods: [],
    },
    vulnerabilities: [],
    score: 100,
    recommendations: [],
  };

  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  const base = `${url.protocol}//${url.hostname}`;

  // OpenAPI/Swagger Discovery
  for (const path of commonOpenAPIPaths) {
    try {
      const testUrl = base + path;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 3000,
      }).catch(() => null);

      if (response && response.status === 200) {
        result.openAPI.found = true;
        result.openAPI.exposed = true;
        result.openAPI.endpoints.push(testUrl);
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('json')) {
          try {
            const data = await response.json();
            if (data.openapi) {
              result.openAPI.version = `OpenAPI ${data.openapi}`;
            } else if (data.swagger) {
              result.openAPI.version = `Swagger ${data.swagger}`;
            }
            if (data.security && data.security.length > 0) {
              result.openAPI.authentication = true;
            }
          } catch {
            // Not JSON
          }
        }

        result.vulnerabilities.push({
          type: 'OpenAPI/Swagger Exposed',
          severity: 'high',
          description: `OpenAPI/Swagger documentation is publicly accessible at ${testUrl}`,
          recommendation: 'Restrict access to API documentation or require authentication',
        });
      }
    } catch {
      // Path not accessible
    }
  }

  // WebSocket Detection
  const wsPatterns = [
    /ws[s]?:\/\/[^\s'"]+/gi,
    /['"](wss?:\/\/[^'"]+)['"]/gi,
    /WebSocket\(['"]([^'"]+)['"]/gi,
  ];

  const wsEndpoints = new Set<string>();
  wsPatterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const wsUrl = match[1] || match[0];
      if (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://')) {
        wsEndpoints.add(wsUrl);
      } else if (wsUrl.startsWith('/')) {
        wsEndpoints.add(`ws${url.protocol === 'https:' ? 's' : ''}://${url.hostname}${wsUrl}`);
      }
    }
  });

  // Test WebSocket endpoints
  for (const wsUrl of Array.from(wsEndpoints).slice(0, 5)) {
    const isSecure = wsUrl.startsWith('wss://');
    result.websocket.endpoints.push({
      url: wsUrl,
      secure: isSecure,
      authentication: false, // Would need actual connection test
      subprotocols: [],
    });

    if (!isSecure) {
      result.websocket.vulnerabilities.push({
        type: 'Insecure WebSocket',
        severity: 'high',
        description: `WebSocket endpoint uses unencrypted ws:// protocol: ${wsUrl}`,
      });
      result.vulnerabilities.push({
        type: 'Insecure WebSocket Connection',
        severity: 'high',
        description: 'WebSocket connection is not encrypted',
        recommendation: 'Use WSS (WebSocket Secure) for all WebSocket connections',
      });
    }
  }

  // OAuth/OIDC Discovery
  for (const path of commonOAuthPaths) {
    try {
      const testUrl = base + path;
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 3000,
      }).catch(() => null);

      if (response && response.status === 200) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('json')) {
          try {
            const data = await response.json();
            if (path.includes('openid-configuration')) {
              result.oauth.endpoints.authorization = data.authorization_endpoint;
              result.oauth.endpoints.token = data.token_endpoint;
              result.oauth.endpoints.userinfo = data.userinfo_endpoint;
              result.oauth.endpoints.introspection = data.introspection_endpoint;
              result.oauth.flows = data.response_types_supported || [];
            } else if (path.includes('oauth-authorization-server')) {
              result.oauth.endpoints.authorization = data.authorization_endpoint;
              result.oauth.endpoints.token = data.token_endpoint;
              result.oauth.flows = data.grant_types_supported || [];
            }
          } catch {
            // Not JSON
          }
        }
      }
    } catch {
      // Path not accessible
    }
  }

  // OAuth Vulnerabilities
  if (result.oauth.endpoints.authorization && !result.oauth.endpoints.authorization.startsWith('https://')) {
    result.oauth.vulnerabilities.push({
      type: 'Insecure OAuth Authorization Endpoint',
      severity: 'critical',
      description: 'OAuth authorization endpoint uses HTTP instead of HTTPS',
    });
    result.vulnerabilities.push({
      type: 'Insecure OAuth Configuration',
      severity: 'critical',
      description: 'OAuth endpoints should use HTTPS',
      recommendation: 'Ensure all OAuth endpoints use HTTPS',
    });
  }

  // JWT Detection in HTML/Headers
  const jwtPattern = /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g;
  const jwtMatches = html.match(jwtPattern) || [];
  const headerJWT = headers['authorization']?.match(/Bearer\s+(eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/i);
  if (headerJWT) jwtMatches.push(headerJWT[1]);

  for (const token of jwtMatches.slice(0, 5)) {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const algorithm = header.alg || 'unknown';
        const expired = payload.exp ? payload.exp < Date.now() / 1000 : false;

        result.jwt.tokens.push({
          location: 'HTML/Headers',
          algorithm,
          expired,
          valid: !expired && algorithm !== 'none',
        });

        if (algorithm === 'none' || algorithm === 'HS256') {
          result.jwt.vulnerabilities.push({
            type: algorithm === 'none' ? 'JWT Algorithm None' : 'Weak JWT Algorithm',
            severity: algorithm === 'none' ? 'critical' : 'high',
            description: `JWT uses ${algorithm === 'none' ? 'none' : 'weak'} algorithm`,
          });
          result.vulnerabilities.push({
            type: 'Weak JWT Algorithm',
            severity: algorithm === 'none' ? 'critical' : 'high',
            description: `JWT tokens use ${algorithm} algorithm which is insecure`,
            recommendation: 'Use RS256 or ES256 for JWT signing',
          });
        }
      }
    } catch {
      // Invalid JWT
    }
  }

  // API Versioning Detection
  const versionPatterns = [
    /\/v\d+\//g,
    /\/api\/v\d+\//g,
    /version[=:]\s*['"]?v?(\d+)['"]?/gi,
  ];
  const versions = new Set<string>();
  versionPatterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) versions.add(match[1]);
      else if (match[0]) {
        const vMatch = match[0].match(/v(\d+)/i);
        if (vMatch) versions.add(vMatch[1]);
      }
    }
  });

  if (versions.size > 0) {
    result.versioning.detected = true;
    result.versioning.versions = Array.from(versions);
    result.versioning.methods = ['URL Path', 'Query Parameter'];
  }

  // Rate Limiting Detection (basic)
  try {
    const testResponse = await fetch(base, {
      method: 'GET',
      timeout: 3000,
    }).catch(() => null);

    if (testResponse) {
      const rateLimitHeader = testResponse.headers.get('x-ratelimit-limit') ||
                              testResponse.headers.get('ratelimit-limit') ||
                              testResponse.headers.get('x-rate-limit-limit');
      if (rateLimitHeader) {
        result.rateLimiting.detected = true;
        result.rateLimiting.methods = ['HTTP Headers'];
      }
    }
  } catch {
    // Cannot test
  }

  // Calculate score
  let score = 100;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 25;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 8;
    else score -= 3;
  });
  if (result.openAPI.exposed) score -= 15;
  if (result.websocket.endpoints.some(e => !e.secure)) score -= 10;
  result.score = Math.max(0, score);

  // Generate recommendations
  if (result.openAPI.exposed) {
    result.recommendations.push('Restrict access to OpenAPI/Swagger documentation');
  }
  if (result.websocket.endpoints.some(e => !e.secure)) {
    result.recommendations.push('Use WSS for all WebSocket connections');
  }
  if (result.jwt.vulnerabilities.length > 0) {
    result.recommendations.push('Use strong algorithms (RS256/ES256) for JWT signing');
  }
  if (!result.rateLimiting.detected) {
    result.recommendations.push('Implement rate limiting for API endpoints');
  }

  return result;
}

