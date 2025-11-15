'use client';
import React from 'react';

interface ComplianceSectionProps {
  compliance: {
    domain: string;
    gdpr: { name: string; passed: boolean; score: number; issues: string[]; recommendations: string[] };
    pciDss: { name: string; passed: boolean; score: number; issues: string[]; recommendations: string[] };
    hipaa: { name: string; passed: boolean; score: number; issues: string[]; recommendations: string[] };
    overallScore: number;
    overallStatus: 'compliant' | 'non-compliant' | 'partial';
  };
}

export default function ComplianceSection({ compliance }: ComplianceSectionProps) {
  if (!compliance) return null;

  // Handle both old and new compliance structures
  const overallStatus = (compliance as any).overallStatus || (compliance as any).overall?.status || 'non-compliant';
  const overallScore = (compliance as any).overallScore || (compliance as any).overall?.score || 0;
  
  // Handle GDPR
  const gdpr = (compliance as any).gdpr || (compliance as any).gdpr || null;
  const gdprScore = gdpr?.score || 0;
  const gdprPassed = gdpr?.compliant || gdpr?.passed || false;
  const gdprIssues = gdpr?.issues || gdpr?.articles?.filter((a: any) => a.status !== 'compliant').map((a: any) => a.article) || [];

  // Handle PCI-DSS
  const pciDss = (compliance as any).pciDss || (compliance as any).pciDss || null;
  const pciDssScore = pciDss?.score || 0;
  const pciDssPassed = pciDss?.compliant || pciDss?.passed || false;
  const pciDssIssues = pciDss?.issues || pciDss?.requirements?.filter((r: any) => r.status !== 'compliant').map((r: any) => r.requirement) || [];

  // Handle HIPAA
  const hipaa = (compliance as any).hipaa || (compliance as any).hipaa || null;
  const hipaaScore = hipaa?.score || 0;
  const hipaaPassed = hipaa?.compliant || hipaa?.passed || false;
  const hipaaIssues = hipaa?.issues || hipaa?.safeguards?.filter((s: any) => s.status !== 'compliant').map((s: any) => s.safeguard) || [];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
        Compliance Checking
      </h2>
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Overall Compliance</h3>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              overallStatus === 'compliant' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              overallStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {overallStatus && typeof overallStatus === 'string' ? overallStatus.toUpperCase() : 'N/A'}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {overallScore}/100
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GDPR */}
          {gdpr && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">GDPR</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  gdprPassed ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {gdprPassed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {gdprScore}/100
              </p>
              {gdprIssues && Array.isArray(gdprIssues) && gdprIssues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Issues:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                    {gdprIssues.slice(0, 3).map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* PCI-DSS */}
          {pciDss && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">PCI-DSS</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  pciDssPassed ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {pciDssPassed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {pciDssScore}/100
              </p>
              {pciDssIssues && Array.isArray(pciDssIssues) && pciDssIssues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Issues:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                    {pciDssIssues.slice(0, 3).map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* HIPAA */}
          {hipaa && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">HIPAA</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  hipaaPassed ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {hipaaPassed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {hipaaScore}/100
              </p>
              {hipaaIssues && Array.isArray(hipaaIssues) && hipaaIssues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Issues:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                    {hipaaIssues.slice(0, 3).map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

