'use client';
import React from 'react';

interface BlacklistCheckSectionProps {
  blacklistCheck: {
    domain: string;
    ip?: string;
    blacklisted: boolean;
    lists: Array<{ name: string; listed: boolean; url?: string; details?: any }>;
    score: number;
    recommendations: string[];
  };
}

export default function BlacklistCheckSection({ blacklistCheck }: BlacklistCheckSectionProps) {
  if (!blacklistCheck) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">Blacklist Check</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blacklist Status</span>
            <span className={`text-2xl font-bold ${
              blacklistCheck.blacklisted 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              {blacklistCheck.blacklisted ? '⚠️ Blacklisted' : '✓ Clean'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Score: {blacklistCheck.score}/100
            </span>
          </div>
        </div>

        {blacklistCheck.lists.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Blacklist Results</h3>
            <div className="space-y-2">
              {blacklistCheck.lists.map((list, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      list.listed 
                        ? 'bg-red-500 dark:bg-red-400' 
                        : 'bg-green-500 dark:bg-green-400'
                    }`}></span>
                    <span className="font-medium text-gray-900 dark:text-white">{list.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded ${
                      list.listed 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {list.listed ? 'Listed' : 'Clean'}
                    </span>
                    {list.url && (
                      <a 
                        href={list.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Check →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {blacklistCheck.recommendations.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">⚠️ Action Required</h3>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
              {blacklistCheck.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

