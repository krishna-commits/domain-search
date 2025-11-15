/**
 * DNS Change Detection
 */
import dns from 'dns/promises';

export interface DNSRecord {
  type: string;
  value: string | string[];
  ttl?: number;
}

export interface DNSChange {
  type: string;
  record: string;
  oldValue: string | string[];
  newValue: string | string[];
  timestamp: Date;
}

export interface DNSHistory {
  domain: string;
  records: Record<string, DNSRecord[]>;
  lastChecked: Date;
  changes: DNSChange[];
}

/**
 * Get current DNS records
 */
export async function getCurrentDNSRecords(domain: string): Promise<Record<string, DNSRecord[]>> {
  const records: Record<string, DNSRecord[]> = {};

  try {
    // A records
    try {
      const aRecords = await dns.resolve4(domain);
      records.A = aRecords.map(ip => ({ type: 'A', value: ip }));
    } catch {
      records.A = [];
    }

    // AAAA records
    try {
      const aaaaRecords = await dns.resolve6(domain);
      records.AAAA = aaaaRecords.map(ip => ({ type: 'AAAA', value: ip }));
    } catch {
      records.AAAA = [];
    }

    // MX records
    try {
      const mxRecords = await dns.resolveMx(domain);
      records.MX = mxRecords.map(mx => ({ type: 'MX', value: `${mx.priority} ${mx.exchange}`, ttl: mx.priority }));
    } catch {
      records.MX = [];
    }

    // TXT records
    try {
      const txtRecords = await dns.resolveTxt(domain);
      records.TXT = txtRecords.map(txt => ({ type: 'TXT', value: Array.isArray(txt) ? txt.join(' ') : txt }));
    } catch {
      records.TXT = [];
    }

    // CNAME records
    try {
      const cnameRecords = await dns.resolveCname(domain);
      records.CNAME = cnameRecords.map(cname => ({ type: 'CNAME', value: cname }));
    } catch {
      records.CNAME = [];
    }

    // NS records
    try {
      const nsRecords = await dns.resolveNs(domain);
      records.NS = nsRecords.map(ns => ({ type: 'NS', value: ns }));
    } catch {
      records.NS = [];
    }

    // SOA record
    try {
      const soaRecord = await dns.resolveSoa(domain);
      records.SOA = [{
        type: 'SOA',
        value: `${soaRecord.nsname} ${soaRecord.hostmaster} ${soaRecord.serial} ${soaRecord.refresh} ${soaRecord.retry} ${soaRecord.expire} ${soaRecord.minttl}`,
      }];
    } catch {
      records.SOA = [];
    }
  } catch (error) {
    console.error('DNS resolution error:', error);
  }

  return records;
}

/**
 * Compare DNS records
 */
export function compareDNSRecords(
  oldRecords: Record<string, DNSRecord[]>,
  newRecords: Record<string, DNSRecord[]>
): DNSChange[] {
  const changes: DNSChange[] = [];
  const allTypes = new Set([...Object.keys(oldRecords), ...Object.keys(newRecords)]);

  allTypes.forEach(type => {
    const old = oldRecords[type] || [];
    const new_ = newRecords[type] || [];

    // Convert to strings for comparison
    const oldValues = old.map(r => Array.isArray(r.value) ? r.value.join(' ') : r.value).sort();
    const newValues = new_.map(r => Array.isArray(r.value) ? r.value.join(' ') : r.value).sort();

    // Check for additions
    newValues.forEach(newVal => {
      if (!oldValues.includes(newVal)) {
        changes.push({
          type,
          record: type,
          oldValue: 'N/A',
          newValue: newVal,
          timestamp: new Date(),
        });
      }
    });

    // Check for removals
    oldValues.forEach(oldVal => {
      if (!newValues.includes(oldVal)) {
        changes.push({
          type,
          record: type,
          oldValue: oldVal,
          newValue: 'N/A',
          timestamp: new Date(),
        });
      }
    });

    // Check for modifications
    if (oldValues.length === newValues.length) {
      oldValues.forEach((oldVal, index) => {
        if (newValues[index] !== oldVal) {
          changes.push({
            type,
            record: type,
            oldValue: oldVal,
            newValue: newValues[index],
            timestamp: new Date(),
          });
        }
      });
    }
  });

  return changes;
}

/**
 * Detect DNS changes
 */
export async function detectDNSChanges(
  domain: string,
  previousRecords: Record<string, DNSRecord[]> | null
): Promise<{ hasChanges: boolean; changes: DNSChange[]; currentRecords: Record<string, DNSRecord[]> }> {
  const currentRecords = await getCurrentDNSRecords(domain);

  if (!previousRecords) {
    return {
      hasChanges: false,
      changes: [],
      currentRecords,
    };
  }

  const changes = compareDNSRecords(previousRecords, currentRecords);

  return {
    hasChanges: changes.length > 0,
    changes,
    currentRecords,
  };
}

/**
 * Format DNS change message
 */
export function formatDNSChangeMessage(changes: DNSChange[]): string {
  if (changes.length === 0) {
    return 'No DNS changes detected';
  }

  return changes.map(change => {
    if (change.newValue === 'N/A') {
      return `${change.type} record removed: ${change.oldValue}`;
    }
    if (change.oldValue === 'N/A') {
      return `${change.type} record added: ${change.newValue}`;
    }
    return `${change.type} record changed: ${change.oldValue} -> ${change.newValue}`;
  }).join('\n');
}

