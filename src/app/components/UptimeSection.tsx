'use client';
import React from 'react';

interface UptimeSectionProps {
  uptimeMonitoring: {
    domain: string;
  totalChecks: number;
    upChecks: number;
    downChecks: number;
    slowChecks: number;
    uptimePercentage: number;
    averageResponseTime: number;
    lastCheck: Date;
    lastStatus: 'up' | 'down' | 'slow';
  };
}

export default function UptimeSection({ uptimeMonitoring }: UptimeSectionProps) {
  if (!uptimeMonitoring) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
        Uptime Monitoring
      </h2>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uptime</p>
            <p className={`text-3xl font-bold ${
              uptimeMonitoring.uptimePercentage >= 99.9 ? 'text-green-600 dark:text-green-400' :
              uptimeMonitoring.uptimePercentage >= 99 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {uptimeMonitoring.uptimePercentage.toFixed(2)}%
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Response Time</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {uptimeMonitoring.averageResponseTime}ms
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Checks</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {uptimeMonitoring.totalChecks}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Status</p>
            <p className={`text-3xl font-bold capitalize ${
              uptimeMonitoring.lastStatus === 'up' ? 'text-green-600 dark:text-green-400' :
              uptimeMonitoring.lastStatus === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`}>
              {uptimeMonitoring.lastStatus}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Up Checks</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {uptimeMonitoring.upChecks}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Down Checks</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {uptimeMonitoring.downChecks}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slow Checks</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {uptimeMonitoring.slowChecks}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last checked: {new Date(uptimeMonitoring.lastCheck).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

