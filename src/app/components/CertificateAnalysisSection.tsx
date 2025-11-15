'use client';
import React from 'react';

interface CertificateAnalysisSectionProps {
  certificateAnalysis: {
    valid: boolean;
    chain: any[];
    certificate: any;
    issues: string[];
    recommendations: string[];
    grade: string;
  };
  certificateTransparency?: {
    found: boolean;
    certificates: any[];
    total: number;
    message: string;
  };
}

export default function CertificateAnalysisSection({ 
  certificateAnalysis, 
  certificateTransparency 
}: CertificateAnalysisSectionProps) {
  if (!certificateAnalysis) return null;

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    if (grade === 'B') return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    if (grade === 'C') return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">Certificate Chain Analysis</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certificate Grade</span>
            <span className={`text-3xl font-bold px-4 py-2 rounded ${getGradeColor(certificateAnalysis.grade)}`}>
              {certificateAnalysis.grade}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Certificate Valid</p>
            <p className={`text-lg font-medium ${
              certificateAnalysis.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {certificateAnalysis.valid ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chain Length</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {certificateAnalysis.chain.length} certificate(s)
            </p>
          </div>
        </div>

        {certificateAnalysis.issues.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">Issues Found</h3>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
              {certificateAnalysis.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {certificateAnalysis.recommendations.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Recommendations</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
              {certificateAnalysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {certificateTransparency && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Certificate Transparency</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {certificateTransparency.found 
                ? `Found ${certificateTransparency.total} certificate(s) in CT logs`
                : certificateTransparency.message}
            </p>
            {certificateTransparency.certificates.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Most recent certificates logged in Certificate Transparency logs
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

