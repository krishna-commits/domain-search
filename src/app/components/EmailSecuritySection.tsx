'use client';
import React from 'react';

interface EmailSecuritySectionProps {
  emailSecurity: {
    spf: { found: boolean; record: string | null; valid: boolean; issues: string[] };
    dkim: { found: boolean; record: string | null; valid: boolean; issues: string[] };
    dmarc: { found: boolean; record: string | null; valid: boolean; issues: string[] };
    score: number;
  };
}

export default function EmailSecuritySection({ emailSecurity }: EmailSecuritySectionProps) {
  const getStatusBadge = (found: boolean, valid: boolean) => {
    if (!found) return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Not Found</span>;
    if (valid) return <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Valid</span>;
    return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Issues Found</span>;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Email Security (SPF/DKIM/DMARC)</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Email Security Score</span>
            <span className={`text-2xl font-bold ${
              emailSecurity.score >= 80 ? 'text-green-600' :
              emailSecurity.score >= 60 ? 'text-yellow-600' :
              emailSecurity.score >= 40 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {emailSecurity.score}/100
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* SPF */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">SPF (Sender Policy Framework)</h3>
              {getStatusBadge(emailSecurity.spf.found, emailSecurity.spf.valid)}
            </div>
            {emailSecurity.spf.found && emailSecurity.spf.record && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Record:</p>
                <code className="block bg-gray-50 p-2 rounded text-xs font-mono break-all">
                  {emailSecurity.spf.record}
                </code>
              </div>
            )}
            {emailSecurity.spf.issues.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-yellow-700 mb-1">Issues:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {emailSecurity.spf.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* DKIM */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">DKIM (DomainKeys Identified Mail)</h3>
              {getStatusBadge(emailSecurity.dkim.found, emailSecurity.dkim.valid)}
            </div>
            {emailSecurity.dkim.found && emailSecurity.dkim.record && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Record:</p>
                <code className="block bg-gray-50 p-2 rounded text-xs font-mono break-all">
                  {emailSecurity.dkim.record}
                </code>
              </div>
            )}
            {!emailSecurity.dkim.found && (
              <p className="text-sm text-gray-500 mt-2">DKIM record not found. Configure DKIM for email authentication.</p>
            )}
          </div>

          {/* DMARC */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">DMARC (Domain-based Message Authentication)</h3>
              {getStatusBadge(emailSecurity.dmarc.found, emailSecurity.dmarc.valid)}
            </div>
            {emailSecurity.dmarc.found && emailSecurity.dmarc.record && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Record:</p>
                <code className="block bg-gray-50 p-2 rounded text-xs font-mono break-all">
                  {emailSecurity.dmarc.record}
                </code>
              </div>
            )}
            {emailSecurity.dmarc.issues.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-yellow-700 mb-1">Issues:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {emailSecurity.dmarc.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

