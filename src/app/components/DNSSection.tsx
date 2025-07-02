import React, { useState } from 'react';

interface DNSRecord {
  name?: string;
  type?: number;
  TTL?: number;
  data?: string;
  exchange?: string;
  priority?: number;
}

interface DNSSectionProps {
  dns: any;
  dnssec: any;
  rawDns?: Record<string, any>;
}

const DNS_TYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  99: 'SPF'
};

// Add explanations for DNS record types
const DNS_TYPE_EXPLANATIONS: Record<string, string> = {
  A: 'IPv4 address record',
  AAAA: 'IPv6 address record',
  MX: 'Mail exchange record',
  TXT: 'Text record',
  NS: 'Name server record',
  CNAME: 'Canonical name record',
  SOA: 'Start of authority record',
  SRV: 'Service locator',
  PTR: 'Pointer record (reverse DNS)',
  SPF: 'Sender Policy Framework',
  NAPTR: 'Naming Authority Pointer',
  CAA: 'Certification Authority Authorization',
  CERT: 'Certificate record',
  DNSKEY: 'DNSSEC public key',
  DS: 'Delegation signer',
  LOC: 'Location record',
  SMIMEA: 'S/MIME cert association',
  SSHFP: 'SSH public key fingerprint',
  TLSA: 'TLSA record for DANE',
  URI: 'Uniform Resource Identifier',
};

const resolvers = [
  null, // system default
  '8.8.8.8', // Google
  '1.1.1.1', // Cloudflare
  '9.9.9.9', // Quad9
];

async function fetchFromGoogleDNS(domain: string, type: string) {
  const url = `https://dns.google/resolve?name=${domain}&type=${type}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer.map(ans => ans.data);
}

async function getDNSRecords(domain: string, type: string) {
  return await fetchFromGoogleDNS(domain, type);
}

export default function DNSSection({ dns, dnssec, rawDns }: DNSSectionProps) {
  // Copy to clipboard helper
  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const renderRecords = (records: any[], title: string, recordType?: string) => {
    if (!records || records.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="font-medium text-gray-700 mb-2">{title}</h3>
        <div className="bg-gray-50 rounded-md p-3 font-mono text-sm overflow-x-auto">
          {records.map((record, index) => {
            // Only render if record.data or record.exchange is present
            const value = recordType === 'MX' ? record.exchange : record.data;
            if (!value) return null;
            return (
              <div key={index} className="py-1 flex items-center group hover:bg-blue-50 rounded transition">
                {recordType === 'MX' ? (
                  <>
                    <span className="text-indigo-600">{record.exchange}</span>{' '}
                    <span className="text-gray-500">Priority: {record.priority}</span>{' '}
                    <span className="text-gray-500">TTL: {record.TTL}</span>
                    <button
                      className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                      onClick={() => handleCopy(record.exchange, `${title}-mx-${index}`)}
                      title="Copy"
                    >
                      {copied === `${title}-mx-${index}` ? 'Copied!' : 'Copy'}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-indigo-600">{record.name || 'N/A'}</span>{' '}
                    <span className="text-gray-500">TTL: {record.TTL}</span>{' '}
                    <span className="text-green-600">{record.data}</span>
                    <button
                      className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                      onClick={() => handleCopy(record.data || '', `${title}-data-${index}`)}
                      title="Copy"
                    >
                      {copied === `${title}-data-${index}` ? 'Copied!' : 'Copy'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to get primary NS and default TTL
  const getSummary = () => {
    const primaryNS = dns.NS && dns.NS.length > 0 ? dns.NS[0].data : 'N/A';
    const defaultTTL = dns.A && dns.A.length > 0 ? dns.A[0].TTL : (dns.NS && dns.NS.length > 0 ? dns.NS[0].TTL : 'N/A');
    return { primaryNS, defaultTTL };
  };
  const summary = getSummary();

  // Helper to render all raw DNS records
  const renderAllRawDns = () => {
    if (!rawDns) return null;
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-3">All DNS Records (Raw)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(rawDns).sort().map((type) => {
            const hasRecords = rawDns[type] && rawDns[type].length > 0;
            return (
              <div
                key={type}
                className={`rounded-lg p-4 mb-2 shadow transition-all border-2 ${hasRecords ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'} flex flex-col`}
              >
                <div className="flex items-center mb-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-bold mr-2 ${hasRecords ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}
                    title={DNS_TYPE_EXPLANATIONS[type] || ''}
                  >
                    {type}
                  </span>
                  {DNS_TYPE_EXPLANATIONS[type] && (
                    <span className="ml-1 text-gray-400" title={DNS_TYPE_EXPLANATIONS[type]}>ⓘ</span>
                  )}
                </div>
                {hasRecords ? (
                  Array.isArray(rawDns[type]) ? (
                    rawDns[type].map((val: any, idx: number) => (
                      <div key={idx} className="flex items-center group hover:bg-blue-50 rounded transition mb-1">
                        <pre className="bg-white rounded p-2 text-xs font-mono text-gray-800 overflow-x-auto border border-green-100 flex-1 mb-0">
                          {typeof val === 'string' ? val : JSON.stringify(val, null, 2)}
                        </pre>
                        <button
                          className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                          onClick={() => handleCopy(typeof val === 'string' ? val : JSON.stringify(val, null, 2), `${type}-raw-${idx}`)}
                          title="Copy"
                        >
                          {copied === `${type}-raw-${idx}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ))
                  ) : null
                ) : (
                  <span className="text-sm text-red-600 font-semibold">No records found</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">DNS Configuration</h2>
      {renderAllRawDns()}
    </div>
  );
}