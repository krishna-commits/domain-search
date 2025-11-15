'use client';
import React from 'react';

interface PhishingDetectionSectionProps {
  phishingDetection: {
    suspicious: boolean;
    score: number;
    indicators: string[];
    sources: {
      googleSafeBrowsing?: any;
      urlhaus?: any;
      phishtank?: any;
    };
    recommendations: string[];
  };
}

export default function PhishingDetectionSection({ phishingDetection }: PhishingDetectionSectionProps) {
  if (!phishingDetection) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">Phishing Detection</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phishing Risk Score</span>
            <span className={`text-2xl font-bold ${
              phishingDetection.score >= 80 ? 'text-green-600 dark:text-green-400' :
              phishingDetection.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {phishingDetection.score}/100
            </span>
          </div>
          <div className="mt-2">
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              phishingDetection.suspicious 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {phishingDetection.suspicious ? '⚠️ Suspicious' : '✓ Safe'}
            </span>
          </div>
        </div>

        {phishingDetection.indicators.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">Risk Indicators</h3>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
              {phishingDetection.indicators.map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Threat Intelligence Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Safe Browsing</p>
              <p className={`text-xs ${
                phishingDetection.sources.googleSafeBrowsing?.malicious 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {phishingDetection.sources.googleSafeBrowsing?.malicious ? '⚠️ Flagged' : '✓ Clean'}
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URLhaus</p>
              <p className={`text-xs ${
                phishingDetection.sources.urlhaus?.threat 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {phishingDetection.sources.urlhaus?.threat ? '⚠️ Threat Detected' : '✓ Clean'}
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PhishTank</p>
              <p className={`text-xs ${
                phishingDetection.sources.phishtank?.phishing 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {phishingDetection.sources.phishtank?.phishing ? '⚠️ Phishing' : '✓ Clean'}
              </p>
            </div>
          </div>
        </div>

        {phishingDetection.recommendations.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Recommendations</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
              {phishingDetection.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

