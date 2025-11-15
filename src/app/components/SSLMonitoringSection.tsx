'use client';
import React from 'react';
import { getExpirationStatusMessage, getExpirationAlertLevel } from '@/app/utils/sslMonitoring';

interface SSLMonitoringSectionProps {
  sslMonitoring: {
    domain: string;
    valid: boolean;
    issuer: string;
    subject: string;
    validFrom: Date;
    validTo: Date;
    daysUntilExpiration: number;
    fingerprint: string;
    serialNumber: string;
  };
}

export default function SSLMonitoringSection({ sslMonitoring }: SSLMonitoringSectionProps) {
  if (!sslMonitoring) return null;

  const alertLevel = getExpirationAlertLevel(sslMonitoring.daysUntilExpiration);
  const statusMessage = getExpirationStatusMessage(sslMonitoring.daysUntilExpiration);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
        SSL Certificate Monitoring
      </h2>
      <div className="px-4 py-5 sm:p-6">
        <div className={`p-4 rounded-lg border-l-4 ${
          alertLevel === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
          alertLevel === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
          'bg-green-50 dark:bg-green-900/20 border-green-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {alertLevel === 'critical' ? '⚠️ URGENT' : alertLevel === 'warning' ? '🔔 Warning' : '✅ Valid'}
            </h3>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              alertLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
              alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {sslMonitoring.daysUntilExpiration} days
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{statusMessage}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Issuer</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{sslMonitoring.issuer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{sslMonitoring.subject}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid From</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(sslMonitoring.validFrom).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid To</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(sslMonitoring.validTo).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

