/**
 * Domain Reputation & Monitoring
 * - Domain Age Analysis
 * - Reputation Scoring
 * - Domain Hijacking Risk Assessment
 * - DNS Tunneling Detection
 * - Domain Parking Detection
 */

import fetch from 'node-fetch';

export interface DomainReputationResult {
  age: {
    registrationDate: string | null;
    expirationDate: string | null;
    ageInDays: number | null;
    ageCategory: 'new' | 'young' | 'mature' | 'old';
  };
  reputation: {
    score: number;
    factors: Array<{
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
    }>;
    blacklisted: boolean;
    blacklists: string[];
  };
  hijacking: {
    risk: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      factor: string;
      severity: string;
      description: string;
    }>;
    registrar: {
      name: string | null;
      reputation: 'good' | 'medium' | 'poor' | 'unknown';
    };
    lockStatus: boolean | null;
  };
  dnsTunneling: {
    detected: boolean;
    suspicious: boolean;
    indicators: string[];
  };
  parking: {
    detected: boolean;
    type: string | null;
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

export async function analyzeDomainReputation(
  domain: string,
  whoisData: any,
  dnsRecords: any
): Promise<DomainReputationResult> {
  const result: DomainReputationResult = {
    age: {
      registrationDate: null,
      expirationDate: null,
      ageInDays: null,
      ageCategory: 'new',
    },
    reputation: {
      score: 50,
      factors: [],
      blacklisted: false,
      blacklists: [],
    },
    hijacking: {
      risk: 'low',
      factors: [],
      registrar: {
        name: null,
        reputation: 'unknown',
      },
      lockStatus: null,
    },
    dnsTunneling: {
      detected: false,
      suspicious: false,
      indicators: [],
    },
    parking: {
      detected: false,
      type: null,
    },
    vulnerabilities: [],
    score: 100,
    recommendations: [],
  };

  // Domain Age Analysis
  if (whoisData) {
    const regDate = whoisData.creationDate || whoisData.created || whoisData.registered;
    const expDate = whoisData.expirationDate || whoisData.expires || whoisData.expiry;

    if (regDate) {
      result.age.registrationDate = regDate;
      const reg = new Date(regDate);
      const now = new Date();
      const ageInDays = Math.floor((now.getTime() - reg.getTime()) / (1000 * 60 * 60 * 24));
      result.age.ageInDays = ageInDays;

      if (ageInDays < 30) result.age.ageCategory = 'new';
      else if (ageInDays < 365) result.age.ageCategory = 'young';
      else if (ageInDays < 3650) result.age.ageCategory = 'mature';
      else result.age.ageCategory = 'old';

      if (ageInDays < 30) {
        result.reputation.factors.push({
          factor: 'New Domain',
          impact: 'negative',
          description: 'Domain is less than 30 days old',
        });
        result.reputation.score -= 20;
      } else if (ageInDays > 365) {
        result.reputation.factors.push({
          factor: 'Established Domain',
          impact: 'positive',
          description: 'Domain is over 1 year old',
        });
        result.reputation.score += 15;
      }
    }

    if (expDate) {
      result.age.expirationDate = expDate;
      const exp = new Date(expDate);
      const now = new Date();
      const daysUntilExpiry = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 30) {
        result.hijacking.risk = 'critical';
        result.hijacking.factors.push({
          factor: 'Expiring Soon',
          severity: 'critical',
          description: `Domain expires in ${daysUntilExpiry} days`,
        });
        result.vulnerabilities.push({
          type: 'Domain Expiring Soon',
          severity: 'critical',
          description: `Domain expires in ${daysUntilExpiry} days`,
          recommendation: 'Renew domain registration immediately',
        });
      } else if (daysUntilExpiry < 90) {
        result.hijacking.risk = 'high';
        result.hijacking.factors.push({
          factor: 'Expiring Soon',
          severity: 'high',
          description: `Domain expires in ${daysUntilExpiry} days`,
        });
      }
    }

    // Registrar Information
    const registrar = whoisData.registrar || whoisData.registrarName;
    if (registrar) {
      result.hijacking.registrar.name = registrar;
      // Known reputable registrars
      const reputableRegistrars = ['godaddy', 'namecheap', 'google', 'cloudflare', 'name.com'];
      const poorRegistrars = ['freenom', 'some-cheap-registrar'];
      
      if (reputableRegistrars.some(r => registrar.toLowerCase().includes(r))) {
        result.hijacking.registrar.reputation = 'good';
        result.reputation.score += 10;
      } else if (poorRegistrars.some(r => registrar.toLowerCase().includes(r))) {
        result.hijacking.registrar.reputation = 'poor';
        result.reputation.score -= 10;
      } else {
        result.hijacking.registrar.reputation = 'medium';
      }
    }

    // Domain Lock Status
    const status = whoisData.status || whoisData.domainStatus || [];
    const statusStr = Array.isArray(status) ? status.join(' ') : String(status);
    if (statusStr.toLowerCase().includes('clienttransferprohibited') ||
        statusStr.toLowerCase().includes('clienthold') ||
        statusStr.toLowerCase().includes('servertransferprohibited')) {
      result.hijacking.lockStatus = true;
      result.hijacking.risk = 'low';
      result.reputation.score += 10;
    } else {
      result.hijacking.lockStatus = false;
      result.hijacking.risk = 'medium';
      result.hijacking.factors.push({
        factor: 'No Transfer Lock',
        severity: 'medium',
        description: 'Domain does not have transfer lock enabled',
      });
    }
  }

  // DNS Tunneling Detection
  if (dnsRecords) {
    const txtRecords = dnsRecords.TXT || [];
    const suspiciousPatterns = [
      /[a-z0-9]{50,}/i, // Long random strings
      /base64/i,
      /tunnel/i,
      /exfil/i,
    ];

    txtRecords.forEach((txt: any) => {
      const txtStr = typeof txt === 'string' ? txt : txt.data || '';
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(txtStr)) {
          result.dnsTunneling.suspicious = true;
          result.dnsTunneling.indicators.push('Suspicious TXT record pattern');
        }
      });
    });

    // Check for unusually long subdomains (potential tunneling)
    const cnameRecords = dnsRecords.CNAME || [];
    cnameRecords.forEach((cname: any) => {
      const cnameStr = typeof cname === 'string' ? cname : cname.data || '';
      if (cnameStr.length > 100) {
        result.dnsTunneling.suspicious = true;
        result.dnsTunneling.indicators.push('Unusually long CNAME record');
      }
    });
  }

  if (result.dnsTunneling.suspicious) {
    result.vulnerabilities.push({
      type: 'Potential DNS Tunneling',
      severity: 'medium',
      description: 'Suspicious DNS patterns detected that may indicate DNS tunneling',
      recommendation: 'Review DNS records for unusual patterns',
    });
  }

  // Domain Parking Detection (simplified - would need actual page analysis)
  // This would typically require fetching the page and checking for parking indicators

  // Calculate final scores
  result.reputation.score = Math.max(0, Math.min(100, result.reputation.score));

  // Calculate overall score
  let score = 100;
  result.vulnerabilities.forEach(vuln => {
    if (vuln.severity === 'critical') score -= 30;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 8;
    else score -= 3;
  });
  if (result.hijacking.risk === 'critical') score -= 25;
  else if (result.hijacking.risk === 'high') score -= 15;
  else if (result.hijacking.risk === 'medium') score -= 8;
  if (result.dnsTunneling.suspicious) score -= 10;
  result.score = Math.max(0, score);

  // Generate recommendations
  if (result.hijacking.risk === 'critical' || result.hijacking.risk === 'high') {
    result.recommendations.push('Renew domain registration and enable transfer lock');
  }
  if (!result.hijacking.lockStatus) {
    result.recommendations.push('Enable domain transfer lock to prevent unauthorized transfers');
  }
  if (result.dnsTunneling.suspicious) {
    result.recommendations.push('Review DNS records for potential tunneling activity');
  }
  if (result.age.ageCategory === 'new') {
    result.recommendations.push('New domains may have lower reputation - monitor closely');
  }

  return result;
}

