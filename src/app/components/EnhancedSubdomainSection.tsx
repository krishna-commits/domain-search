'use client';
import React from 'react';

interface EnhancedSubdomainSectionProps {
  enhancedSubdomains: string[];
  subdomainAnalysis: {
    total: number;
    subdomains: Array<{ subdomain: string; type: string }>;
    categories: {
      www: number;
      mail: number;
      api: number;
      admin: number;
      test: number;
      other: number;
    };
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

export default function EnhancedSubdomainSection({ 
  enhancedSubdomains, 
  subdomainAnalysis 
}: EnhancedSubdomainSectionProps) {
  if (!enhancedSubdomains || enhancedSubdomains.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
        Enhanced Subdomain Enumeration
      </h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Subdomains</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{subdomainAnalysis.total}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">WWW</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{subdomainAnalysis.categories.www}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">API</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{subdomainAnalysis.categories.api}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</p>
            <p className={`text-2xl font-bold capitalize ${
              subdomainAnalysis.riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
              subdomainAnalysis.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {subdomainAnalysis.riskLevel}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Subdomain Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Mail</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{subdomainAnalysis.categories.mail}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{subdomainAnalysis.categories.admin}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Test/Dev</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{subdomainAnalysis.categories.test}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Other</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{subdomainAnalysis.categories.other}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">All Subdomains</h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {enhancedSubdomains.slice(0, 50).map((subdomain, index) => {
                const analysis = subdomainAnalysis.subdomains.find(s => s.subdomain === subdomain);
                return (
                  <div key={index} className="p-2 border rounded bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-900 dark:text-white">{subdomain}</code>
                      {analysis && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {analysis.type}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {enhancedSubdomains.length > 50 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                ... and {enhancedSubdomains.length - 50} more subdomains
              </p>
            )}
          </div>
        </div>

        {subdomainAnalysis.recommendations.length > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Recommendations</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
              {subdomainAnalysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

