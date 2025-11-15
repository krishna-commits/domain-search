/**
 * Supply Chain Security
 * - Third-Party Dependency Scanning
 * - Known Vulnerability Detection
 * - Malicious Package Detection
 * - Package Manager Security
 */

import fetch from 'node-fetch';

export interface SupplyChainSecurityResult {
  dependencies: {
    npm: Array<{ name: string; version: string; vulnerabilities: number }>;
    pip: Array<{ name: string; version: string; vulnerabilities: number }>;
    maven: Array<{ name: string; version: string; vulnerabilities: number }>;
    nuget: Array<{ name: string; version: string; vulnerabilities: number }>;
    composer: Array<{ name: string; version: string; vulnerabilities: number }>;
  };
  vulnerabilities: Array<{
    package: string;
    version: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    cve: string | null;
    description: string;
    fixedIn: string | null;
  }>;
  malicious: Array<{
    package: string;
    type: string;
    description: string;
  }>;
  outdated: Array<{
    package: string;
    current: string;
    latest: string;
  }>;
  lockFiles: {
    packageLock: boolean;
    yarnLock: boolean;
    requirementsTxt: boolean;
    pomXml: boolean;
    composerJson: boolean;
  };
  score: number;
  recommendations: string[];
}

export async function scanSupplyChain(
  baseUrl: string,
  html: string
): Promise<SupplyChainSecurityResult> {
  const result: SupplyChainSecurityResult = {
    dependencies: {
      npm: [],
      pip: [],
      maven: [],
      nuget: [],
      composer: [],
    },
    vulnerabilities: [],
    malicious: [],
    outdated: [],
    lockFiles: {
      packageLock: false,
      yarnLock: false,
      requirementsTxt: false,
      pomXml: false,
      composerJson: false,
    },
    score: 100,
    recommendations: [],
  };

  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  const base = `${url.protocol}//${url.hostname}`;

  // Check for lock files
  const lockFilePaths = [
    '/package-lock.json',
    '/yarn.lock',
    '/requirements.txt',
    '/pom.xml',
    '/composer.json',
    '/composer.lock',
  ];

  for (const path of lockFilePaths) {
    try {
      const response = await fetch(base + path, {
        method: 'HEAD',
        timeout: 3000,
      }).catch(() => null);

      if (response && response.status === 200) {
        if (path.includes('package-lock.json')) result.lockFiles.packageLock = true;
        if (path.includes('yarn.lock')) result.lockFiles.yarnLock = true;
        if (path.includes('requirements.txt')) result.lockFiles.requirementsTxt = true;
        if (path.includes('pom.xml')) result.lockFiles.pomXml = true;
        if (path.includes('composer.json')) result.lockFiles.composerJson = true;

        // Try to fetch and parse
        if (path.includes('package-lock.json') || path.includes('yarn.lock')) {
          try {
            const content = await fetch(base + path, { timeout: 3000 }).then(r => r.json()).catch(() => null);
            if (content && content.dependencies) {
              for (const [name, pkg] of Object.entries(content.dependencies)) {
                const pkgInfo = pkg as any;
                const version = pkgInfo.version || 'unknown';
                result.dependencies.npm.push({
                  name,
                  version,
                  vulnerabilities: 0, // Would need npm audit API
                });
              }
            }
          } catch {
            // Cannot parse
          }
        }
      }
    } catch {
      // File not accessible
    }
  }

  // Detect packages in HTML/JS
  const npmPatterns = [
    /node_modules\/([^/]+)\//g,
    /from\s+['"]([^'"]+)['"]/g,
    /require\(['"]([^'"]+)['"]\)/g,
  ];

  const detectedPackages = new Set<string>();
  npmPatterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !match[1].startsWith('.') && !match[1].startsWith('/')) {
        detectedPackages.add(match[1].split('/')[0]);
      }
    }
  });

  // Check for known vulnerable packages (simplified - would use real vulnerability DB)
  const vulnerablePackages: Record<string, { severity: string; cve: string; description: string }> = {
    'lodash': { severity: 'medium', cve: 'CVE-2021-23337', description: 'Command injection vulnerability' },
    'axios': { severity: 'high', cve: 'CVE-2021-3749', description: 'SSRF vulnerability' },
    'express': { severity: 'medium', cve: 'CVE-2022-24999', description: 'Prototype pollution' },
  };

  for (const pkg of Array.from(detectedPackages).slice(0, 20)) {
    if (vulnerablePackages[pkg.toLowerCase()]) {
      const vuln = vulnerablePackages[pkg.toLowerCase()];
      result.vulnerabilities.push({
        package: pkg,
        version: 'unknown',
        severity: vuln.severity as any,
        cve: vuln.cve,
        description: vuln.description,
        fixedIn: null,
      });
    }
  }

  // Check for typosquatting (common malicious packages)
  const maliciousPatterns = [
    /crossenv|cross-env/i,
    /colors\.js/i,
    /faker/i,
    /event-stream/i,
  ];

  maliciousPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      const match = html.match(pattern);
      if (match) {
        result.malicious.push({
          package: match[0],
          type: 'Typosquatting',
          description: 'Potential typosquatting package detected',
        });
      }
    }
  });

  // Calculate score
  let score = 100;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 20;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 8;
    else score -= 3;
  });
  result.malicious.forEach(() => score -= 25);
  if (!result.lockFiles.packageLock && !result.lockFiles.yarnLock && result.dependencies.npm.length > 0) {
    score -= 10;
    result.recommendations.push('Use lock files (package-lock.json or yarn.lock) to ensure consistent dependencies');
  }
  result.score = Math.max(0, score);

  // Generate recommendations
  if (result.vulnerabilities.length > 0) {
    result.recommendations.push('Update vulnerable packages to patched versions');
  }
  if (result.malicious.length > 0) {
    result.recommendations.push('Review and remove potentially malicious packages');
  }
  if (result.dependencies.npm.length > 0) {
    result.recommendations.push('Run npm audit regularly to check for vulnerabilities');
  }

  return result;
}

