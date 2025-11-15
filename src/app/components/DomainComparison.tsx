'use client';
import React, { useState } from 'react';

interface DomainComparisonProps {
  onComparisonComplete?: (results: any) => void;
}

export default function DomainComparison({ onComparisonComplete }: DomainComparisonProps) {
  const [domains, setDomains] = useState('');
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    const domainList = domains.split('\n').map(d => d.trim()).filter(Boolean);
    
    if (domainList.length < 2) {
      setError('Please enter at least 2 domains for comparison');
      return;
    }

    if (domainList.length > 10) {
      setError('Maximum 10 domains per comparison');
      return;
    }

    setComparing(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domains: domainList,
          profile: 'deep',
        }),
      });

      if (!response.ok) {
        throw new Error('Comparison failed');
      }

      const data = await response.json();
      setResults(data);
      if (onComparisonComplete) {
        onComparisonComplete(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to compare domains');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Domain Comparison</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Domains to Compare (2-10 domains, one per line)
          </label>
          <textarea
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder="example.com&#10;example2.com&#10;example3.com"
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={comparing || !domains.trim()}
          className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {comparing ? 'Comparing...' : 'Compare Domains'}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {results && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Comparison Results</h4>
              
              {/* Rankings */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rankings</h5>
                <div className="space-y-2">
                  {results.ranked?.map((domain: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">#{index + 1}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{domain.domain}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Score: {domain.securityScore}/100</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          domain.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          domain.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          domain.riskLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {domain.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best and Worst */}
              {results.best && results.worst && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Best</p>
                    <p className="font-medium text-gray-900 dark:text-white">{results.best.domain}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{results.best.securityScore}/100</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Worst</p>
                    <p className="font-medium text-gray-900 dark:text-white">{results.worst.domain}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{results.worst.securityScore}/100</p>
                  </div>
                </div>
              )}

              {/* Averages */}
              {results.averages && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Averages</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Security Score:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{results.averages.securityScore}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Headers:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{results.averages.headersCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Cookies Score:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{results.averages.cookiesScore}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">CSP Score:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{results.averages.cspScore}/100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

