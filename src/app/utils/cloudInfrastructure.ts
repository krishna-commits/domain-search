/**
 * Cloud Infrastructure Detection & Security
 * - Cloud Provider Detection (AWS, Azure, GCP)
 * - Cloud Service Discovery (S3, CloudFront, etc.)
 * - Cloud Security Misconfigurations
 * - Cloud Metadata Endpoints
 * - Container Registry Detection
 * - Serverless Function Discovery
 */

import fetch from 'node-fetch';

export interface CloudInfrastructureResult {
  providers: {
    aws: boolean;
    azure: boolean;
    gcp: boolean;
    digitalOcean: boolean;
    cloudflare: boolean;
    vercel: boolean;
    netlify: boolean;
  };
  services: {
    s3Buckets: Array<{ name: string; public: boolean; accessible: boolean }>;
    cloudfront: Array<{ distribution: string; accessible: boolean }>;
    azureBlob: Array<{ container: string; public: boolean }>;
    gcsBuckets: Array<{ name: string; public: boolean }>;
    serverless: Array<{ provider: string; function: string; accessible: boolean }>;
  };
  metadata: {
    ec2Metadata: boolean;
    gcpMetadata: boolean;
    azureMetadata: boolean;
    exposed: boolean;
  };
  registries: {
    dockerHub: boolean;
    ecr: boolean;
    gcr: boolean;
    acr: boolean;
  };
  waf: {
    cloudflare: boolean;
    awsWaf: boolean;
    azureWaf: boolean;
    detected: boolean;
  };
  misconfigurations: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  score: number;
  recommendations: string[];
}

export async function detectCloudInfrastructure(
  domain: string,
  headers: Record<string, string>,
  html: string
): Promise<CloudInfrastructureResult> {
  const result: CloudInfrastructureResult = {
    providers: {
      aws: false,
      azure: false,
      gcp: false,
      digitalOcean: false,
      cloudflare: false,
      vercel: false,
      netlify: false,
    },
    services: {
      s3Buckets: [],
      cloudfront: [],
      azureBlob: [],
      gcsBuckets: [],
      serverless: [],
    },
    metadata: {
      ec2Metadata: false,
      gcpMetadata: false,
      azureMetadata: false,
      exposed: false,
    },
    registries: {
      dockerHub: false,
      ecr: false,
      gcr: false,
      acr: false,
    },
    waf: {
      cloudflare: false,
      awsWaf: false,
      azureWaf: false,
      detected: false,
    },
    misconfigurations: [],
    score: 100,
    recommendations: [],
  };

  // Detect Cloud Providers
  const serverHeader = headers['server'] || headers['x-powered-by'] || '';
  const cfRay = headers['cf-ray'];
  const xVercel = headers['x-vercel-id'];
  const xNetlify = headers['x-nf-request-id'];

  // Cloudflare Detection
  if (cfRay || serverHeader.toLowerCase().includes('cloudflare')) {
    result.providers.cloudflare = true;
    result.waf.cloudflare = true;
    result.waf.detected = true;
  }

  // Vercel Detection
  if (xVercel || serverHeader.toLowerCase().includes('vercel')) {
    result.providers.vercel = true;
  }

  // Netlify Detection
  if (xNetlify || serverHeader.toLowerCase().includes('netlify')) {
    result.providers.netlify = true;
  }

  // AWS Detection
  const awsIndicators = [
    /amazonaws/i,
    /aws/i,
    /cloudfront/i,
    /s3\.amazonaws\.com/i,
    /\.s3-[a-z0-9-]+\.amazonaws\.com/i,
    /\.s3\.[a-z0-9-]+\.amazonaws\.com/i,
  ];
  if (awsIndicators.some(pattern => pattern.test(serverHeader) || pattern.test(html))) {
    result.providers.aws = true;
  }

  // Azure Detection
  const azureIndicators = [
    /azure/i,
    /microsoft/i,
    /\.azurewebsites\.net/i,
    /\.azure\.net/i,
    /\.blob\.core\.windows\.net/i,
  ];
  if (azureIndicators.some(pattern => pattern.test(serverHeader) || pattern.test(html))) {
    result.providers.azure = true;
  }

  // GCP Detection
  const gcpIndicators = [
    /google cloud/i,
    /gcp/i,
    /\.appspot\.com/i,
    /\.cloudfunctions\.net/i,
    /\.run\.app/i,
    /\.googleapis\.com/i,
  ];
  if (gcpIndicators.some(pattern => pattern.test(serverHeader) || pattern.test(html))) {
    result.providers.gcp = true;
  }

  // DigitalOcean Detection
  if (/digitalocean/i.test(serverHeader) || /do\.spaces/i.test(html)) {
    result.providers.digitalOcean = true;
  }

  // Check for S3 Buckets in HTML/JS
  const s3Patterns = [
    /https?:\/\/([a-z0-9.-]+)\.s3\.amazonaws\.com/gi,
    /https?:\/\/([a-z0-9.-]+)\.s3-[a-z0-9-]+\.amazonaws\.com/gi,
    /https?:\/\/([a-z0-9.-]+)\.s3\.[a-z0-9-]+\.amazonaws\.com/gi,
  ];
  const s3Matches = new Set<string>();
  s3Patterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) s3Matches.add(match[1]);
    }
  });

  // Test S3 bucket accessibility
  for (const bucket of Array.from(s3Matches).slice(0, 5)) {
    try {
      const testUrl = `https://${bucket}.s3.amazonaws.com/`;
      const response = await fetch(testUrl, { method: 'HEAD', timeout: 3000 });
      const isPublic = response.status === 200 || response.status === 403;
      result.services.s3Buckets.push({
        name: bucket,
        public: isPublic,
        accessible: response.status === 200,
      });
      if (isPublic) {
        result.misconfigurations.push({
          type: 'Public S3 Bucket',
          severity: 'critical',
          description: `S3 bucket "${bucket}" is publicly accessible`,
          recommendation: 'Restrict bucket access using bucket policies and IAM',
        });
      }
    } catch {
      // Bucket not accessible or doesn't exist
    }
  }

  // Check CloudFront distributions
  const cloudfrontPattern = /https?:\/\/([a-z0-9.-]+)\.cloudfront\.net/gi;
  const cloudfrontMatches = html.matchAll(cloudfrontPattern);
  for (const match of Array.from(cloudfrontMatches).slice(0, 5)) {
    if (match[1]) {
      result.services.cloudfront.push({
        distribution: match[1],
        accessible: true,
      });
    }
  }

  // Check Azure Blob Storage
  const azureBlobPattern = /https?:\/\/([a-z0-9.-]+)\.blob\.core\.windows\.net/gi;
  const azureBlobMatches = html.matchAll(azureBlobPattern);
  for (const match of Array.from(azureBlobMatches).slice(0, 5)) {
    if (match[1]) {
      try {
        const testUrl = `https://${match[1]}.blob.core.windows.net/`;
        const response = await fetch(testUrl, { method: 'HEAD', timeout: 3000 });
        result.services.azureBlob.push({
          container: match[1],
          public: response.status === 200,
        });
        if (response.status === 200) {
          result.misconfigurations.push({
            type: 'Public Azure Blob Container',
            severity: 'critical',
            description: `Azure blob container "${match[1]}" is publicly accessible`,
            recommendation: 'Restrict container access using access policies',
          });
        }
      } catch {
        // Container not accessible
      }
    }
  }

  // Check GCS Buckets
  const gcsPattern = /https?:\/\/storage\.googleapis\.com\/([a-z0-9.-]+)/gi;
  const gcsMatches = html.matchAll(gcsPattern);
  for (const match of Array.from(gcsMatches).slice(0, 5)) {
    if (match[1]) {
      result.services.gcsBuckets.push({
        name: match[1],
        public: false, // Would need API to check
      });
    }
  }

  // Check for serverless functions
  const serverlessPatterns = [
    /\.lambda-url\.([a-z0-9-]+)\.on\.aws/gi,
    /\.cloudfunctions\.net/gi,
    /\.azurewebsites\.net/gi,
    /\.run\.app/gi,
  ];
  serverlessPatterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const provider = match[0].includes('lambda') ? 'AWS Lambda' :
                      match[0].includes('cloudfunctions') ? 'GCP Cloud Functions' :
                      match[0].includes('azurewebsites') ? 'Azure Functions' :
                      match[0].includes('run.app') ? 'GCP Cloud Run' : 'Unknown';
      result.services.serverless.push({
        provider,
        function: match[0],
        accessible: true,
      });
    }
  });

  // Check for metadata endpoints (critical security issue)
  try {
    const ec2Metadata = await fetch('http://169.254.169.254/latest/meta-data/', {
      method: 'GET',
      timeout: 2000,
    }).catch(() => null);
    if (ec2Metadata && ec2Metadata.status === 200) {
      result.metadata.ec2Metadata = true;
      result.metadata.exposed = true;
      result.misconfigurations.push({
        type: 'EC2 Metadata Endpoint Exposed',
        severity: 'critical',
        description: 'EC2 metadata endpoint is accessible from the internet',
        recommendation: 'Block access to metadata endpoint from external IPs',
      });
    }
  } catch {
    // Not accessible
  }

  // Check container registries in HTML/JS
  if (/docker\.io|dockerhub/i.test(html)) result.registries.dockerHub = true;
  if (/\.ecr\.[a-z0-9-]+\.amazonaws\.com/i.test(html)) result.registries.ecr = true;
  if (/gcr\.io|\.pkg\.dev/i.test(html)) result.registries.gcr = true;
  if (/\.azurecr\.io/i.test(html)) result.registries.acr = true;

  // AWS WAF Detection
  if (headers['x-amzn-requestid'] || headers['x-amz-request-id']) {
    result.waf.awsWaf = true;
    result.waf.detected = true;
  }

  // Azure WAF Detection
  if (headers['x-azure-ref'] || headers['x-ms-request-id']) {
    result.waf.azureWaf = true;
    result.waf.detected = true;
  }

  // Calculate score
  let score = 100;
  result.misconfigurations.forEach(misconfig => {
    if (misconfig.severity === 'critical') score -= 20;
    else if (misconfig.severity === 'high') score -= 10;
    else if (misconfig.severity === 'medium') score -= 5;
    else score -= 2;
  });
  if (result.metadata.exposed) score -= 30;
  result.score = Math.max(0, score);

  // Generate recommendations
  if (result.metadata.exposed) {
    result.recommendations.push('Block access to cloud metadata endpoints from external networks');
  }
  if (result.services.s3Buckets.some(b => b.public)) {
    result.recommendations.push('Review and restrict public S3 bucket access');
  }
  if (result.services.azureBlob.some(b => b.public)) {
    result.recommendations.push('Review and restrict public Azure blob container access');
  }
  if (!result.waf.detected && (result.providers.aws || result.providers.azure)) {
    result.recommendations.push('Consider implementing WAF protection');
  }

  return result;
}

