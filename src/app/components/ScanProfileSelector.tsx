'use client';
import React from 'react';

export type ScanProfile = 'quick' | 'deep' | 'custom';

interface ScanProfileSelectorProps {
  selectedProfile: ScanProfile;
  onProfileChange: (profile: ScanProfile) => void;
  onCustomConfigChange?: (config: CustomScanConfig) => void;
  customConfig?: CustomScanConfig;
}

export interface CustomScanConfig {
  includeDNS: boolean;
  includeSSL: boolean;
  includeSecurityHeaders: boolean;
  includeCookies: boolean;
  includeCSP: boolean;
  includeEmailSecurity: boolean;
  includeIPReputation: boolean;
  includeVulnerabilities: boolean;
  includeSubdomains: boolean;
  includeBrokenLinks: boolean;
}

const defaultCustomConfig: CustomScanConfig = {
  includeDNS: true,
  includeSSL: true,
  includeSecurityHeaders: true,
  includeCookies: true,
  includeCSP: true,
  includeEmailSecurity: true,
  includeIPReputation: true,
  includeVulnerabilities: true,
  includeSubdomains: true,
  includeBrokenLinks: true,
};

export default function ScanProfileSelector({
  selectedProfile,
  onProfileChange,
  onCustomConfigChange,
  customConfig = defaultCustomConfig,
}: ScanProfileSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Scan Profile</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button
          onClick={() => onProfileChange('quick')}
          className={`p-4 border-2 rounded-lg transition-all ${
            selectedProfile === 'quick'
              ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="font-medium text-gray-900 dark:text-white mb-1">Quick Scan</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Basic checks: DNS, SSL, Security Headers
          </div>
        </button>

        <button
          onClick={() => onProfileChange('deep')}
          className={`p-4 border-2 rounded-lg transition-all ${
            selectedProfile === 'deep'
              ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="font-medium text-gray-900 dark:text-white mb-1">Deep Scan</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive: All checks including vulnerabilities
          </div>
        </button>

        <button
          onClick={() => onProfileChange('custom')}
          className={`p-4 border-2 rounded-lg transition-all ${
            selectedProfile === 'custom'
              ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="font-medium text-gray-900 dark:text-white mb-1">Custom</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Configure your own scan options
          </div>
        </button>
      </div>

      {selectedProfile === 'custom' && onCustomConfigChange && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Custom Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(customConfig).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    onCustomConfigChange({
                      ...customConfig,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

