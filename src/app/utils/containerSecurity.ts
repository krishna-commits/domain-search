/**
 * Container & Orchestration Security
 * - Docker Security Analysis
 * - Kubernetes Security
 * - Container Registry Exposure
 * - Container Misconfigurations
 */

import fetch from 'node-fetch';

export interface ContainerSecurityResult {
  docker: {
    detected: boolean;
    exposed: boolean;
    endpoints: string[];
    vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
  kubernetes: {
    detected: boolean;
    apiExposed: boolean;
    endpoints: string[];
    misconfigurations: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
  registries: {
    dockerHub: boolean;
    ecr: boolean;
    gcr: boolean;
    acr: boolean;
    exposed: boolean;
    publicImages: Array<{
      registry: string;
      image: string;
      public: boolean;
    }>;
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

export async function scanContainerSecurity(
  baseUrl: string,
  html: string,
  headers: Record<string, string>
): Promise<ContainerSecurityResult> {
  const result: ContainerSecurityResult = {
    docker: {
      detected: false,
      exposed: false,
      endpoints: [],
      vulnerabilities: [],
    },
    kubernetes: {
      detected: false,
      apiExposed: false,
      endpoints: [],
      misconfigurations: [],
    },
    registries: {
      dockerHub: false,
      ecr: false,
      gcr: false,
      acr: false,
      exposed: false,
      publicImages: [],
    },
    vulnerabilities: [],
    score: 100,
    recommendations: [],
  };

  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  const base = `${url.protocol}//${url.hostname}`;

  // Docker Detection
  const dockerIndicators = [
    /docker/i,
    /containerd/i,
    /\.docker\./i,
  ];

  if (dockerIndicators.some(pattern => pattern.test(html) || pattern.test(JSON.stringify(headers)))) {
    result.docker.detected = true;
  }

  // Check Docker API endpoint
  const dockerEndpoints = [
    '/docker',
    '/v1.40',
    '/v1.41',
    '/v1.42',
  ];

  for (const endpoint of dockerEndpoints) {
    try {
      const testUrl = base + endpoint;
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 3000,
      }).catch(() => null);

      if (response && (response.status === 200 || response.status === 401)) {
        result.docker.exposed = true;
        result.docker.endpoints.push(testUrl);
        result.vulnerabilities.push({
          type: 'Docker API Exposed',
          severity: 'critical',
          description: `Docker API endpoint is accessible at ${testUrl}`,
          recommendation: 'Restrict Docker API access and use TLS authentication',
        });
      }
    } catch {
      // Endpoint not accessible
    }
  }

  // Kubernetes Detection
  const k8sIndicators = [
    /kubernetes/i,
    /k8s/i,
    /kube-system/i,
  ];

  if (k8sIndicators.some(pattern => pattern.test(html))) {
    result.kubernetes.detected = true;
  }

  // Check Kubernetes API endpoint
  const k8sEndpoints = [
    '/api/v1',
    '/apis',
    '/healthz',
    '/readyz',
  ];

  for (const endpoint of k8sEndpoints) {
    try {
      const testUrl = base + endpoint;
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 3000,
      }).catch(() => null);

      if (response && (response.status === 200 || response.status === 401 || response.status === 403)) {
        result.kubernetes.apiExposed = true;
        result.kubernetes.endpoints.push(testUrl);
        result.vulnerabilities.push({
          type: 'Kubernetes API Exposed',
          severity: 'critical',
          description: `Kubernetes API endpoint is accessible at ${testUrl}`,
          recommendation: 'Restrict Kubernetes API access and enable RBAC',
        });
      }
    } catch {
      // Endpoint not accessible
    }
  }

  // Container Registry Detection
  const registryPatterns = [
    { pattern: /docker\.io|dockerhub/i, registry: 'dockerHub' },
    { pattern: /\.ecr\.[a-z0-9-]+\.amazonaws\.com/i, registry: 'ecr' },
    { pattern: /gcr\.io|\.pkg\.dev/i, registry: 'gcr' },
    { pattern: /\.azurecr\.io/i, registry: 'acr' },
  ];

  registryPatterns.forEach(({ pattern, registry }) => {
    if (pattern.test(html)) {
      if (registry === 'dockerHub') result.registries.dockerHub = true;
      if (registry === 'ecr') result.registries.ecr = true;
      if (registry === 'gcr') result.registries.gcr = true;
      if (registry === 'acr') result.registries.acr = true;
      result.registries.exposed = true;
    }
  });

  // Extract container images from HTML
  const imagePatterns = [
    /([a-z0-9.-]+\/[a-z0-9.-]+):([a-z0-9.-]+)/gi,
    /([a-z0-9.-]+\.azurecr\.io\/[a-z0-9.-]+)/gi,
    /([a-z0-9.-]+\.ecr\.[a-z0-9-]+\.amazonaws\.com\/[a-z0-9.-]+)/gi,
  ];

  imagePatterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of Array.from(matches).slice(0, 10)) {
      const image = match[0];
      const registry = image.includes('azurecr') ? 'ACR' :
                      image.includes('ecr') ? 'ECR' :
                      image.includes('gcr') ? 'GCR' : 'Docker Hub';
      result.registries.publicImages.push({
        registry,
        image,
        public: false, // Would need API to check
      });
    }
  });

  // Kubernetes Misconfigurations
  if (result.kubernetes.detected) {
    result.kubernetes.misconfigurations.push({
      type: 'RBAC Not Verified',
      severity: 'high',
      description: 'Cannot verify if RBAC is properly configured',
    });
  }

  // Calculate score
  let score = 100;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 30;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 8;
    else score -= 3;
  });
  if (result.docker.exposed) score -= 25;
  if (result.kubernetes.apiExposed) score -= 30;
  result.score = Math.max(0, score);

  // Generate recommendations
  if (result.docker.exposed) {
    result.recommendations.push('Restrict Docker API access and enable TLS authentication');
  }
  if (result.kubernetes.apiExposed) {
    result.recommendations.push('Restrict Kubernetes API access and enable RBAC');
  }
  if (result.registries.exposed) {
    result.recommendations.push('Review container registry access policies');
  }

  return result;
}

