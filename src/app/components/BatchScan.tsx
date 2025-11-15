'use client';
import React, { useState } from 'react';

interface BatchScanProps {
  onScanComplete?: (results: any) => void;
}

export default function BatchScan({ onScanComplete }: BatchScanProps) {
  const [domains, setDomains] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    const domainList = domains.split('\n').map(d => d.trim()).filter(Boolean);
    
    if (domainList.length === 0) {
      setError('Please enter at least one domain');
      return;
    }

    if (domainList.length > 50) {
      setError('Maximum 50 domains per batch scan');
      return;
    }

    setScanning(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/batch-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domains: domainList,
          profile: 'deep',
          parallel: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Batch scan failed');
      }

      const data = await response.json();
      setResults(data);
      if (onScanComplete) {
        onScanComplete(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to perform batch scan');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Batch Domain Scan</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Domains (one per line, max 50)
          </label>
          <textarea
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder="example.com&#10;example2.com&#10;example3.com"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={scanning || !domains.trim()}
          className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {scanning ? 'Scanning...' : `Scan ${domains.split('\n').filter(d => d.trim()).length} Domain(s)`}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {results && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Batch Scan Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{results.summary?.total}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Successful:</span>
                <span className="ml-2 font-medium text-green-600 dark:text-green-400">{results.summary?.successful}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                <span className="ml-2 font-medium text-red-600 dark:text-red-400">{results.summary?.failed}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{results.summary?.averageScore}/100</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

