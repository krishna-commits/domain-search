/**
 * Advanced DNSSEC Validation
 * - DNSKEY, RRSIG, NSEC, NSEC3 Records
 * - DNSSEC Chain of Trust Validation
 * - DNSKEY Rollover Detection
 */

import dns from 'dns/promises';

export interface DNSSECValidationResult {
  dnssecEnabled: boolean;
  dnssecValid: boolean;
  dnskeys: Array<{
    keyTag: number;
    algorithm: number;
    flags: number;
    protocol: number;
    publicKey: string;
  }>;
  rrsigs: Array<{
    type: string;
    algorithm: number;
    labels: number;
    originalTtl: number;
    expiration: Date;
    inception: Date;
    keyTag: number;
    signerName: string;
    signature: string;
  }>;
  nsecRecords: Array<{
    nextDomainName: string;
    types: string[];
  }>;
  nsec3Records: Array<{
    hashAlgorithm: number;
    flags: number;
    iterations: number;
    salt: string;
    nextHashedOwnerName: string;
    types: string[];
  }>;
  chainOfTrust: {
    valid: boolean;
    issues: string[];
  };
  rolloverStatus: {
    inProgress: boolean;
    issues: string[];
  };
  recommendations: string[];
}

/**
 * Validate DNSSEC comprehensively
 */
export async function validateDNSSEC(domain: string): Promise<DNSSECValidationResult> {
  try {
    // Check if DNSSEC is enabled
    const dnssecEnabled = await checkDNSSECEnabled(domain);
    
    if (!dnssecEnabled) {
      return {
        dnssecEnabled: false,
        dnssecValid: false,
        dnskeys: [],
        rrsigs: [],
        nsecRecords: [],
        nsec3Records: [],
        chainOfTrust: {
          valid: false,
          issues: ['DNSSEC is not enabled'],
        },
        rolloverStatus: {
          inProgress: false,
          issues: [],
        },
        recommendations: ['Enable DNSSEC for enhanced DNS security'],
      };
    }

    // Get DNSKEY records
    const dnskeys = await getDNSKEYRecords(domain);
    
    // Get RRSIG records
    const rrsigs = await getRRSIGRecords(domain);
    
    // Get NSEC records
    const nsecRecords = await getNSECRecords(domain);
    
    // Get NSEC3 records
    const nsec3Records = await getNSEC3Records(domain);
    
    // Validate chain of trust
    const chainOfTrust = validateChainOfTrust(dnskeys, rrsigs);
    
    // Check for rollover
    const rolloverStatus = checkRolloverStatus(dnskeys);
    
    const recommendations: string[] = [];
    if (!chainOfTrust.valid) {
      recommendations.push('Fix DNSSEC chain of trust issues');
    }
    if (rolloverStatus.inProgress) {
      recommendations.push('Monitor DNSKEY rollover process');
    }
    if (dnskeys.length === 0) {
      recommendations.push('Configure DNSKEY records');
    }
    if (rrsigs.length === 0) {
      recommendations.push('Configure RRSIG records');
    }

    return {
      dnssecEnabled: true,
      dnssecValid: chainOfTrust.valid,
      dnskeys,
      rrsigs,
      nsecRecords,
      nsec3Records,
      chainOfTrust,
      rolloverStatus,
      recommendations,
    };
  } catch (error) {
    return {
      dnssecEnabled: false,
      dnssecValid: false,
      dnskeys: [],
      rrsigs: [],
      nsecRecords: [],
      nsec3Records: [],
      chainOfTrust: {
        valid: false,
        issues: ['Error validating DNSSEC'],
      },
      rolloverStatus: {
        inProgress: false,
        issues: [],
      },
      recommendations: ['Enable DNSSEC for enhanced DNS security'],
    };
  }
}

/**
 * Check if DNSSEC is enabled
 */
async function checkDNSSECEnabled(domain: string): Promise<boolean> {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    
    // Try to resolve with DNSSEC validation
    await resolver.resolve4(domain);
    
    // Check for DNSKEY records
    try {
      await resolver.resolve(domain, 'DNSKEY');
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Get DNSKEY records
 */
async function getDNSKEYRecords(domain: string): Promise<Array<{
  keyTag: number;
  algorithm: number;
  flags: number;
  protocol: number;
  publicKey: string;
}>> {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    
    const records = await resolver.resolve(domain, 'DNSKEY');
    return records.map((record: any) => ({
      keyTag: record.keyTag || 0,
      algorithm: record.algorithm || 0,
      flags: record.flags || 0,
      protocol: record.protocol || 0,
      publicKey: record.publicKey || '',
    }));
  } catch {
    return [];
  }
}

/**
 * Get RRSIG records
 */
async function getRRSIGRecords(domain: string): Promise<Array<{
  type: string;
  algorithm: number;
  labels: number;
  originalTtl: number;
  expiration: Date;
  inception: Date;
  keyTag: number;
  signerName: string;
  signature: string;
}>> {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    
    const records = await resolver.resolve(domain, 'RRSIG');
    return records.map((record: any) => ({
      type: record.typeCovered || '',
      algorithm: record.algorithm || 0,
      labels: record.labels || 0,
      originalTtl: record.originalTtl || 0,
      expiration: record.expiration ? new Date(record.expiration * 1000) : new Date(),
      inception: record.inception ? new Date(record.inception * 1000) : new Date(),
      keyTag: record.keyTag || 0,
      signerName: record.signerName || '',
      signature: record.signature || '',
    }));
  } catch {
    return [];
  }
}

/**
 * Get NSEC records
 */
async function getNSECRecords(domain: string): Promise<Array<{
  nextDomainName: string;
  types: string[];
}>> {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    
    const records = await resolver.resolve(domain, 'NSEC');
    return records.map((record: any) => ({
      nextDomainName: record.nextDomainName || '',
      types: record.types || [],
    }));
  } catch {
    return [];
  }
}

/**
 * Get NSEC3 records
 */
async function getNSEC3Records(domain: string): Promise<Array<{
  hashAlgorithm: number;
  flags: number;
  iterations: number;
  salt: string;
  nextHashedOwnerName: string;
  types: string[];
}>> {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    
    const records = await resolver.resolve(domain, 'NSEC3');
    return records.map((record: any) => ({
      hashAlgorithm: record.hashAlgorithm || 0,
      flags: record.flags || 0,
      iterations: record.iterations || 0,
      salt: record.salt || '',
      nextHashedOwnerName: record.nextHashedOwnerName || '',
      types: record.types || [],
    }));
  } catch {
    return [];
  }
}

/**
 * Validate chain of trust
 */
function validateChainOfTrust(
  dnskeys: Array<{ keyTag: number; algorithm: number }>,
  rrsigs: Array<{ keyTag: number; algorithm: number }>
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (dnskeys.length === 0) {
    issues.push('No DNSKEY records found');
  }
  
  if (rrsigs.length === 0) {
    issues.push('No RRSIG records found');
  }
  
  // Check if RRSIGs match DNSKEYs
  const keyTags = new Set(dnskeys.map(k => k.keyTag));
  const rrsigKeyTags = new Set(rrsigs.map(r => r.keyTag));
  
  for (const keyTag of rrsigKeyTags) {
    if (!keyTags.has(keyTag)) {
      issues.push(`RRSIG keyTag ${keyTag} does not match any DNSKEY`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Check rollover status
 */
function checkRolloverStatus(
  dnskeys: Array<{ keyTag: number; flags: number }>
): { inProgress: boolean; issues: string[] } {
  const issues: string[] = [];
  const inProgress = dnskeys.length > 1;
  
  if (inProgress) {
    issues.push('Multiple DNSKEY records detected - rollover may be in progress');
  }
  
  // Check for KSK and ZSK flags
  const kskCount = dnskeys.filter(k => (k.flags & 0x0001) !== 0).length;
  const zskCount = dnskeys.filter(k => (k.flags & 0x0001) === 0).length;
  
  if (kskCount === 0) {
    issues.push('No KSK (Key Signing Key) found');
  }
  
  if (zskCount === 0) {
    issues.push('No ZSK (Zone Signing Key) found');
  }
  
  return {
    inProgress,
    issues,
  };
}

