'use client';
import React from 'react';

interface PortScanSectionProps {
  portScan: {
    total: number;
    open: number;
    closed: number;
    openPorts: Array<{ port: number; service: string; banner?: string; responseTime?: number }>;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

export default function PortScanSection({ portScan }: PortScanSectionProps) {
  if (!portScan || portScan.total === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">Port Scan Results</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ports Scanned</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{portScan.total}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Open Ports</p>
            <p className={`text-2xl font-bold ${
              portScan.open > 10 ? 'text-red-600 dark:text-red-400' :
              portScan.open > 5 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {portScan.open}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</p>
            <p className={`text-2xl font-bold capitalize ${
              portScan.riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
              portScan.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {portScan.riskLevel}
            </p>
          </div>
        </div>

        {portScan.openPorts.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Open Ports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {portScan.openPorts.map((port, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">Port {port.port}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{port.service}</span>
                  </div>
                  {port.banner && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Banner: {port.banner}</p>
                  )}
                  {port.responseTime && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Response: {port.responseTime}ms</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {portScan.recommendations.length > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Recommendations</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
              {portScan.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

