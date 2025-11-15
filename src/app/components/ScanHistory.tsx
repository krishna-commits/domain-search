'use client';
import React, { useState, useEffect } from 'react';

export default function ScanHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadHistory();
  }, [domain]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const url = domain 
        ? `/api/history?domain=${encodeURIComponent(domain)}`
        : '/api/history';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scan History</h3>
        <button
          onClick={loadHistory}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Filter by domain..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
        />
      </div>

      {stats && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Scans:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{stats.totalScans}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{stats.averageScore}/100</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Low Risk:</span>
              <span className="ml-2 font-medium text-green-600 dark:text-green-400">{stats.riskDistribution?.low || 0}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Critical:</span>
              <span className="ml-2 font-medium text-red-600 dark:text-red-400">{stats.riskDistribution?.critical || 0}</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No scan history found</div>
      ) : (
        <div className="space-y-2">
          {history.map((scan) => (
            <div
              key={scan.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{scan.domain}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(scan.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{scan.securityScore}/100</p>
                  <p className={`text-xs px-2 py-1 rounded ${
                    scan.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    scan.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    scan.riskLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {scan.riskLevel?.toUpperCase() || 'UNKNOWN'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

