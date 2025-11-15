/**
 * Specialized Scanners
 * - API Scanner
 * - Kubernetes Scanner
 * - Password Auditor
 */

import fetch from 'node-fetch';

export interface APIScannerResult {
  endpoints: Array<{
    url: string;
    method: string;
    status: number;
    authentication: boolean;
    rateLimited: boolean;
  }>;
  openEndpoints: number;
  protectedEndpoints: number;
  recommendations: string[];
}

export interface KubernetesScannerResult {
  detected: boolean;
  apiServer: string | null;
  services: string[];
  pods: string[];
  namespaces: string[];
  securityIssues: string[];
  recommendations: string[];
}

export interface PasswordAuditorResult {
  weakPasswords: Array<{
    service: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  passwordPolicy: {
    minLength: number | null;
    complexity: boolean;
    expiration: boolean;
  };
  recommendations: string[];
}

/**
 * Scan for API endpoints
 */
export async function scanAPI(hostname: string, html: string): Promise<APIScannerResult> {
  const endpoints: Array<{
    url: string;
    method: string;
    status: number;
    authentication: boolean;
    rateLimited: boolean;
  }> = [];

  // Find API endpoints in HTML
  const apiPatterns = [
    /\/api\/[^\s"']+/gi,
    /\/v\d+\/[^\s"']+/gi,
    /\/rest\/[^\s"']+/gi,
    /\/graphql/gi,
  ];

  const foundEndpoints = new Set<string>();
  for (const pattern of apiPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      foundEndpoints.add(match[0]);
    }
  }

  // Test endpoints
  for (const endpoint of Array.from(foundEndpoints).slice(0, 10)) {
    try {
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `https://${hostname}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      endpoints.push({
        url: endpoint,
        method: 'GET',
        status: response.status,
        authentication: response.status === 401 || response.status === 403,
        rateLimited: response.status === 429,
      });
    } catch (error) {
      // Endpoint not accessible
    }
  }

  const openEndpoints = endpoints.filter(e => e.status === 200 && !e.authentication).length;
  const protectedEndpoints = endpoints.filter(e => e.authentication).length;

  const recommendations: string[] = [];
  if (openEndpoints > 0) {
    recommendations.push('Some API endpoints are publicly accessible without authentication');
  }
  if (endpoints.filter(e => e.rateLimited).length === 0) {
    recommendations.push('Consider implementing rate limiting for API endpoints');
  }

  return {
    endpoints,
    openEndpoints,
    protectedEndpoints,
    recommendations,
  };
}

/**
 * Scan for Kubernetes
 */
export async function scanKubernetes(hostname: string, html: string, headers: Headers): Promise<KubernetesScannerResult> {
  const detected = /kubernetes|k8s|api\/v1|\/api\/v1\/namespaces/i.test(html) ||
                   headers.get('X-Kubernetes') !== null ||
                   headers.get('Server')?.toLowerCase().includes('kubernetes');

  if (!detected) {
    // Check for common Kubernetes paths
    const k8sPaths = [
      '/api/v1',
      '/apis',
      '/healthz',
      '/readyz',
    ];

    let k8sDetected = false;
    for (const path of k8sPaths) {
      try {
        const response = await fetch(`https://${hostname}${path}`, {
          signal: AbortSignal.timeout(2000),
        });
        if (response.ok || response.status === 401 || response.status === 403) {
          k8sDetected = true;
          break;
        }
      } catch (error) {
        // Path not accessible
      }
    }

    if (!k8sDetected) {
      return {
        detected: false,
        apiServer: null,
        services: [],
        pods: [],
        namespaces: [],
        securityIssues: [],
        recommendations: [],
      };
    }
  }

  const apiServer = detected ? `https://${hostname}/api/v1` : null;
  const services: string[] = [];
  const pods: string[] = [];
  const namespaces: string[] = [];

  const securityIssues: string[] = [];
  const recommendations: string[] = [];

  // Check for exposed Kubernetes API
  if (detected) {
    securityIssues.push('Kubernetes API may be exposed');
    recommendations.push('Ensure Kubernetes API is properly secured with authentication');
    recommendations.push('Use network policies to restrict access');
    recommendations.push('Enable RBAC (Role-Based Access Control)');
  }

  return {
    detected: true,
    apiServer,
    services,
    pods,
    namespaces,
    securityIssues,
    recommendations,
  };
}

/**
 * Audit password security
 */
export async function auditPasswords(hostname: string, html: string): Promise<PasswordAuditorResult> {
  const weakPasswords: Array<{
    service: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  // Check for default passwords
  const defaultPasswords = [
    /admin.*admin/i,
    /password.*password/i,
    /123456/i,
    /default.*default/i,
  ];

  for (const pattern of defaultPasswords) {
    if (pattern.test(html)) {
      weakPasswords.push({
        service: 'Website',
        issue: 'Default or weak password pattern detected',
        severity: 'high',
      });
    }
  }

  // Check password policy indicators
  const passwordPolicy = {
    minLength: null as number | null,
    complexity: false,
    expiration: false,
  };

  // Look for password policy hints
  if (/(min.?length|minimum.*length)/i.test(html)) {
    const lengthMatch = html.match(/(\d+).*character/i);
    passwordPolicy.minLength = lengthMatch ? parseInt(lengthMatch[1]) : null;
  }

  if (/(uppercase|lowercase|number|special.*char|complexity)/i.test(html)) {
    passwordPolicy.complexity = true;
  }

  if (/(expir|expir.*password|password.*expir)/i.test(html)) {
    passwordPolicy.expiration = true;
  }

  const recommendations: string[] = [];
  if (!passwordPolicy.complexity) {
    recommendations.push('Implement password complexity requirements');
  }
  if (!passwordPolicy.expiration) {
    recommendations.push('Consider implementing password expiration policy');
  }
  if (weakPasswords.length > 0) {
    recommendations.push('Remove default or weak passwords');
  }

  return {
    weakPasswords,
    passwordPolicy,
    recommendations,
  };
}

