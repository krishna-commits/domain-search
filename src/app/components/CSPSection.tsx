'use client';
import React from 'react';

interface CSPSectionProps {
  csp: {
    valid: boolean;
    issues: string[];
    score: number;
    directives?: Record<string, string[]>;
  };
}

export default function CSPSection({ csp }: CSPSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Content Security Policy (CSP)</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">CSP Security Score</span>
            <span className={`text-2xl font-bold ${
              csp.score >= 80 ? 'text-green-600' :
              csp.score >= 60 ? 'text-yellow-600' :
              csp.score >= 40 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {csp.score}/100
            </span>
          </div>
        </div>

        <div className="mb-4">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            csp.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {csp.valid ? 'Valid CSP' : 'Invalid or Missing CSP'}
          </span>
        </div>

        {csp.issues.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">Issues Found:</p>
            <ul className="list-disc list-inside text-sm text-yellow-700">
              {csp.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {csp.directives && Object.keys(csp.directives).length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">CSP Directives</h3>
            <div className="space-y-2">
              {Object.entries(csp.directives).map(([directive, values]) => (
                <div key={directive} className="border rounded p-3">
                  <p className="font-medium text-gray-700 mb-1">{directive}:</p>
                  <code className="text-sm text-gray-600 font-mono">
                    {values.join(' ')}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

