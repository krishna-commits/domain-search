import React from 'react';

interface DomainDetails {
  domain: string;
  subdomain: string;
  publicSuffix: string;
  topLevelDomain: string;
  isIcann: boolean;
  isPrivate: boolean;
  hostname: string;
}

interface SSLInfo {
  valid: boolean;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  issuer?: string;
  subject?: string;
  algorithm?: string;
  fingerprint?: string;
}

interface DomainOverviewProps {
  details: DomainDetails;
  ssl: SSLInfo;
  emails: string[];
}

// Helper to format issuer/subject if they are objects
const formatCertEntity = (entity: any) => {
  if (!entity) return 'Unknown';
  if (typeof entity === 'string') return entity;
  if (typeof entity === 'object') {
    const parts = [];
    if (entity.commonName) parts.push(entity.commonName);
    if (entity.organization) parts.push(entity.organization);
    if (entity.location) parts.push(entity.location);
    return parts.length > 0 ? parts.join(', ') : JSON.stringify(entity);
  }
  return String(entity);
};

export default function DomainOverview({ details, ssl, emails }: DomainOverviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Domain Overview</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Domain Information</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Full Domain</dt>
                <dd className="text-sm text-gray-900 font-mono">{details.hostname}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Subdomain</dt>
                <dd className="text-sm text-gray-900">{details.subdomain || 'None'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Public Suffix</dt>
                <dd className="text-sm text-gray-900">{details.publicSuffix}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Top-Level Domain</dt>
                <dd className="text-sm text-gray-900">{details.topLevelDomain}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">ICANN Managed</dt>
                <dd className="text-sm text-gray-900">{details.isIcann ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Extracted Email Addresses</h4>
              {emails && emails.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {emails.map(email => (
                    <li key={email} className="font-mono text-blue-700">{email}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">No public email addresses found.</div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">SSL/TLS Certificate</h3>
            <div className={`p-3 rounded-md ${ssl.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Valid:</span>
                <span className={`text-sm font-medium ${ssl.valid ? 'text-green-700' : 'text-red-700'}`}>
                  {ssl.valid ? 'Yes' : 'No'}
                </span>
              </div>
              {ssl.issuer && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-medium">Issuer:</span>
                  <span className="text-sm text-gray-900">{formatCertEntity(ssl.issuer)}</span>
                </div>
              )}
              {ssl.subject && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-medium">Subject:</span>
                  <span className="text-sm text-gray-900">{formatCertEntity(ssl.subject)}</span>
                </div>
              )}
              {ssl.validFrom && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-medium">Valid From:</span>
                  <span className="text-sm text-gray-900">{formatDate(ssl.validFrom)}</span>
                </div>
              )}
              {ssl.validTo && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-medium">Expires:</span>
                  <span className="text-sm text-gray-900">{formatDate(ssl.validTo)}</span>
                </div>
              )}
              {ssl.daysRemaining !== undefined && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-medium">Days Remaining:</span>
                  <span className={`text-sm font-medium ${
                    ssl.daysRemaining > 30 ? 'text-green-700' : 
                    ssl.daysRemaining > 7 ? 'text-yellow-600' : 'text-red-700'
                  }`}>
                    {ssl.daysRemaining}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}