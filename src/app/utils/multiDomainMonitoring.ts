/**
 * Multi-Domain Monitoring Dashboard
 */

export interface DomainGroup {
  id: string;
  name: string;
  domains: string[];
  tags: string[];
  createdAt: Date;
}

export interface DomainStatus {
  domain: string;
  lastScan: Date;
  securityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  vulnerabilities: number;
  alerts: number;
}

export interface MultiDomainDashboard {
  domains: DomainStatus[];
  groups: DomainGroup[];
  summary: {
    totalDomains: number;
    healthyDomains: number;
    warningDomains: number;
    criticalDomains: number;
    averageScore: number;
    totalVulnerabilities: number;
    totalAlerts: number;
  };
}

/**
 * Domain groups storage (in production, use a database)
 */
const domainGroups: Map<string, DomainGroup> = new Map();
const domainStatuses: Map<string, DomainStatus> = new Map();

/**
 * Create domain group
 */
export function createDomainGroup(name: string, domains: string[], tags: string[] = []): DomainGroup {
  const group: DomainGroup = {
    id: Date.now().toString(),
    name,
    domains,
    tags,
    createdAt: new Date(),
  };
  
  domainGroups.set(group.id, group);
  return group;
}

/**
 * Get domain group
 */
export function getDomainGroup(id: string): DomainGroup | null {
  return domainGroups.get(id) || null;
}

/**
 * Get all domain groups
 */
export function getAllDomainGroups(): DomainGroup[] {
  return Array.from(domainGroups.values());
}

/**
 * Update domain status
 */
export function updateDomainStatus(status: DomainStatus): void {
  domainStatuses.set(status.domain, status);
}

/**
 * Get domain status
 */
export function getDomainStatus(domain: string): DomainStatus | null {
  return domainStatuses.get(domain) || null;
}

/**
 * Get all domain statuses
 */
export function getAllDomainStatuses(): DomainStatus[] {
  return Array.from(domainStatuses.values());
}

/**
 * Get multi-domain dashboard
 */
export function getMultiDomainDashboard(domainFilter?: string[], groupFilter?: string[]): MultiDomainDashboard {
  let domains = getAllDomainStatuses();
  
  // Filter by domain list
  if (domainFilter && domainFilter.length > 0) {
    domains = domains.filter(d => domainFilter.includes(d.domain));
  }
  
  // Filter by group
  if (groupFilter && groupFilter.length > 0) {
    const groupDomains = new Set<string>();
    groupFilter.forEach(groupId => {
      const group = getDomainGroup(groupId);
      if (group) {
        group.domains.forEach(d => groupDomains.add(d));
      }
    });
    domains = domains.filter(d => groupDomains.has(d.domain));
  }

  // Calculate summary
  const totalDomains = domains.length;
  const healthyDomains = domains.filter(d => d.status === 'healthy').length;
  const warningDomains = domains.filter(d => d.status === 'warning').length;
  const criticalDomains = domains.filter(d => d.status === 'critical').length;
  const averageScore = domains.length > 0 
    ? Math.round(domains.reduce((sum, d) => sum + d.securityScore, 0) / domains.length)
    : 0;
  const totalVulnerabilities = domains.reduce((sum, d) => sum + d.vulnerabilities, 0);
  const totalAlerts = domains.reduce((sum, d) => sum + d.alerts, 0);

  return {
    domains,
    groups: getAllDomainGroups(),
    summary: {
      totalDomains,
      healthyDomains,
      warningDomains,
      criticalDomains,
      averageScore,
      totalVulnerabilities,
      totalAlerts,
    },
  };
}

/**
 * Bulk update domain statuses
 */
export function bulkUpdateDomainStatuses(statuses: DomainStatus[]): void {
  statuses.forEach(status => {
    updateDomainStatus(status);
  });
}

/**
 * Compare domains
 */
export function compareDomains(domains: string[]): {
  domains: Array<{
    domain: string;
    securityScore: number;
    riskLevel: string;
    vulnerabilities: number;
    uptime: number;
  }>;
  average: {
    securityScore: number;
    vulnerabilities: number;
    uptime: number;
  };
  ranking: Array<{
    domain: string;
    rank: number;
    score: number;
  }>;
} {
  const statuses = domains.map(d => getDomainStatus(d)).filter((s): s is DomainStatus => s !== null);
  
  const domainData = statuses.map(s => ({
    domain: s.domain,
    securityScore: s.securityScore,
    riskLevel: s.riskLevel,
    vulnerabilities: s.vulnerabilities,
    uptime: s.uptime,
  }));

  const average = {
    securityScore: statuses.length > 0 
      ? Math.round(statuses.reduce((sum, s) => sum + s.securityScore, 0) / statuses.length)
      : 0,
    vulnerabilities: statuses.length > 0
      ? Math.round(statuses.reduce((sum, s) => sum + s.vulnerabilities, 0) / statuses.length)
      : 0,
    uptime: statuses.length > 0
      ? Math.round(statuses.reduce((sum, s) => sum + s.uptime, 0) / statuses.length)
      : 0,
  };

  // Ranking
  const ranking = statuses
    .map(s => ({
      domain: s.domain,
      rank: 0,
      score: s.securityScore,
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return {
    domains: domainData,
    average,
    ranking,
  };
}

/**
 * Get domain health status
 */
export function getDomainHealthStatus(domain: string): 'healthy' | 'warning' | 'critical' | 'unknown' {
  const status = getDomainStatus(domain);
  if (!status) return 'unknown';

  if (status.securityScore >= 80 && status.vulnerabilities === 0 && status.uptime >= 99) {
    return 'healthy';
  }
  
  if (status.securityScore < 50 || status.vulnerabilities > 5 || status.uptime < 95) {
    return 'critical';
  }
  
  return 'warning';
}

