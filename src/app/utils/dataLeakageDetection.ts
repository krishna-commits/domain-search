/**
 * Data Leakage Detection
 * - API Keys, Passwords in Source Code
 * - PII Detection (GDPR Compliance)
 * - Database Exposure (MongoDB, Redis, etc.)
 * - Backup File Detection
 * - Git Repository Exposure
 */

import fetch from 'node-fetch';

export interface DataLeakageResult {
  secrets: Array<{
    type: string;
    pattern: string;
    location: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  pii: {
    emails: string[];
    phoneNumbers: string[];
    creditCards: string[];
    ssn: string[];
    ipAddresses: string[];
  };
  databases: Array<{
    type: string;
    endpoint: string;
    exposed: boolean;
    authentication: boolean;
  }>;
  backupFiles: Array<{
    path: string;
    type: string;
    accessible: boolean;
  }>;
  git: {
    exposed: boolean;
    endpoints: string[];
    accessible: boolean;
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

const secretPatterns = [
  { type: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/gi, severity: 'critical' as const },
  { type: 'AWS Secret Key', pattern: /aws_secret_access_key[=:]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi, severity: 'critical' as const },
  { type: 'API Key', pattern: /api[_-]?key[=:]\s*['"]?([a-z0-9]{32,})['"]?/gi, severity: 'high' as const },
  { type: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/gi, severity: 'critical' as const },
  { type: 'GitHub Personal Access Token', pattern: /github_pat_[a-zA-Z0-9_]{82}/gi, severity: 'critical' as const },
  { type: 'Google API Key', pattern: /AIza[0-9A-Za-z-_]{35}/gi, severity: 'high' as const },
  { type: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z-]{10,48}/gi, severity: 'high' as const },
  { type: 'Password', pattern: /password[=:]\s*['"]?([^'"]{8,})['"]?/gi, severity: 'critical' as const },
  { type: 'Private Key', pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi, severity: 'critical' as const },
  { type: 'JWT Token', pattern: /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, severity: 'medium' as const },
];

const backupFilePatterns = [
  { pattern: /\.bak$/i, type: 'Backup' },
  { pattern: /\.sql$/i, type: 'SQL Dump' },
  { pattern: /\.tar\.gz$/i, type: 'Archive' },
  { pattern: /\.zip$/i, type: 'Archive' },
  { pattern: /\.dump$/i, type: 'Dump' },
  { pattern: /\.old$/i, type: 'Old File' },
  { pattern: /\.orig$/i, type: 'Original' },
  { pattern: /\.backup$/i, type: 'Backup' },
  { pattern: /\.swp$/i, type: 'Swap File' },
  { pattern: /\.tmp$/i, type: 'Temporary' },
];

const commonBackupPaths = [
  '/backup',
  '/backups',
  '/backup.sql',
  '/database.sql',
  '/dump.sql',
  '/db.sql',
  '/backup.tar.gz',
  '/backup.zip',
  '/.git',
  '/.svn',
  '/.env',
  '/.env.backup',
  '/config.php.bak',
  '/wp-config.php.bak',
];

export async function detectDataLeakage(
  baseUrl: string,
  html: string,
  headers: Record<string, string>
): Promise<DataLeakageResult> {
  const result: DataLeakageResult = {
    secrets: [],
    pii: {
      emails: [],
      phoneNumbers: [],
      creditCards: [],
      ssn: [],
      ipAddresses: [],
    },
    databases: [],
    backupFiles: [],
    git: {
      exposed: false,
      endpoints: [],
      accessible: false,
    },
    vulnerabilities: [],
    score: 100,
    recommendations: [],
  };

  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  const base = `${url.protocol}//${url.hostname}`;

  // Detect secrets in HTML/source
  secretPatterns.forEach(({ type, pattern, severity }) => {
    const matches = html.matchAll(pattern);
    for (const match of Array.from(matches).slice(0, 10)) {
      const found = match[0] || match[1];
      if (found && found.length > 8) {
        result.secrets.push({
          type,
          pattern: found.substring(0, 20) + '...',
          location: 'HTML/Source',
          severity,
        });

        if (severity === 'critical' || severity === 'high') {
          result.vulnerabilities.push({
            type: `${type} Exposed`,
            severity,
            description: `${type} found in page source`,
            recommendation: 'Remove secrets from source code and use environment variables or secret management',
          });
        }
      }
    }
  });

  // PII Detection
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailPattern) || [];
  result.pii.emails = Array.from(new Set(emails)).slice(0, 20);

  const phonePattern = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
  const phones = html.match(phonePattern) || [];
  result.pii.phoneNumbers = Array.from(new Set(phones)).slice(0, 10);

  const creditCardPattern = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  const cards = html.match(creditCardPattern) || [];
  // Basic Luhn check would be better
  result.pii.creditCards = Array.from(new Set(cards)).slice(0, 5);

  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
  const ssns = html.match(ssnPattern) || [];
  result.pii.ssn = Array.from(new Set(ssns)).slice(0, 5);

  const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  const ips = html.match(ipPattern) || [];
  result.pii.ipAddresses = Array.from(new Set(ips)).slice(0, 10);

  // Database Exposure Detection
  const dbEndpoints = [
    { type: 'MongoDB', port: 27017, path: '' },
    { type: 'Redis', port: 6379, path: '' },
    { type: 'Elasticsearch', port: 9200, path: '/_cluster/health' },
    { type: 'MySQL', port: 3306, path: '' },
    { type: 'PostgreSQL', port: 5432, path: '' },
  ];

  for (const db of dbEndpoints) {
    try {
      const testUrl = `http://${url.hostname}:${db.port}${db.path}`;
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 2000,
      }).catch(() => null);

      if (response && (response.status === 200 || response.status === 401)) {
        result.databases.push({
          type: db.type,
          endpoint: testUrl,
          exposed: true,
          authentication: response.status === 401,
        });

        result.vulnerabilities.push({
          type: `${db.type} Database Exposed`,
          severity: response.status === 200 ? 'critical' : 'high',
          description: `${db.type} database is accessible from the internet`,
          recommendation: 'Restrict database access to internal networks only',
        });
      }
    } catch {
      // Database not accessible
    }
  }

  // Backup File Detection
  for (const path of commonBackupPaths) {
    try {
      const testUrl = base + path;
      const response = await fetch(testUrl, {
        method: 'HEAD',
        timeout: 3000,
      }).catch(() => null);

      if (response && response.status === 200) {
        const contentType = response.headers.get('content-type') || '';
        result.backupFiles.push({
          path,
          type: backupFilePatterns.find(p => path.match(p.pattern))?.type || 'Unknown',
          accessible: true,
        });

        result.vulnerabilities.push({
          type: 'Backup File Exposed',
          severity: 'high',
          description: `Backup file is accessible at ${path}`,
          recommendation: 'Remove backup files from web-accessible directories',
        });
      }
    } catch {
      // File not accessible
    }
  }

  // Git Repository Exposure
  const gitPaths = ['/.git/', '/.git/config', '/.git/HEAD'];
  for (const path of gitPaths) {
    try {
      const testUrl = base + path;
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 3000,
      }).catch(() => null);

      if (response && response.status === 200) {
        result.git.exposed = true;
        result.git.endpoints.push(path);
        result.git.accessible = true;

        result.vulnerabilities.push({
          type: 'Git Repository Exposed',
          severity: 'critical',
          description: `Git repository is accessible at ${path}`,
          recommendation: 'Remove .git directory from web-accessible locations',
        });
      }
    } catch {
      // Path not accessible
    }
  }

  // Calculate score
  let score = 100;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 25;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 8;
    else score -= 3;
  });
  result.secrets.forEach(secret => {
    if (secret.severity === 'critical') score -= 20;
    else if (secret.severity === 'high') score -= 10;
  });
  if (result.pii.emails.length > 10 || result.pii.creditCards.length > 0) {
    score -= 15;
    result.recommendations.push('Review PII exposure for GDPR compliance');
  }
  result.score = Math.max(0, score);

  // Generate recommendations
  if (result.secrets.length > 0) {
    result.recommendations.push('Remove all secrets from source code and use secure secret management');
  }
  if (result.databases.some(db => db.exposed)) {
    result.recommendations.push('Restrict database access to internal networks');
  }
  if (result.backupFiles.length > 0) {
    result.recommendations.push('Remove backup files from web-accessible directories');
  }
  if (result.git.exposed) {
    result.recommendations.push('Remove .git directory from web server');
  }

  return result;
}

