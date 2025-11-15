'use client';
import React, { useState, useEffect } from 'react';

interface DashboardProps {
  onDomainSelect?: (domain: string) => void;
}

export default function Dashboard({ onDomainSelect }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load scan history for statistics
      const historyResponse = await fetch('/api/history?limit=10');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setRecentScans(historyData.history || []);
        
        // Calculate statistics
        if (historyData.stats) {
          setStats(historyData.stats);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Scans</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalScans || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore || 0}/100</p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Low Risk</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.riskDistribution?.low || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Critical Risk</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.riskDistribution?.critical || 0}</p>
          </div>
        </div>
      )}

      {/* Recent Scans */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Scans</h3>
        {recentScans.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent scans</p>
        ) : (
          <div className="space-y-2">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => onDomainSelect && onDomainSelect(scan.domain)}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
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
    </div>
  );
}

