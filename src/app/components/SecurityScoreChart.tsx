'use client';
import React from 'react';

interface SecurityScoreChartProps {
  score: number;
  breakdown?: {
    ssl: number;
    headers: number;
    cookies: number;
    csp: number;
    emailSecurity: number;
    dns: number;
    mixedContent: number;
    hsts: number;
    protocols: number;
    ipReputation: number;
  };
}

export default function SecurityScoreChart({ score, breakdown }: SecurityScoreChartProps) {
  const getColor = (value: number) => {
    if (value >= 80) return 'bg-green-500 dark:bg-green-600';
    if (value >= 60) return 'bg-yellow-500 dark:bg-yellow-600';
    if (value >= 40) return 'bg-orange-500 dark:bg-orange-600';
    return 'bg-red-500 dark:bg-red-600';
  };

  const categories = breakdown
    ? [
        { name: 'SSL', value: breakdown.ssl },
        { name: 'Headers', value: breakdown.headers },
        { name: 'Cookies', value: breakdown.cookies },
        { name: 'CSP', value: breakdown.csp },
        { name: 'Email', value: breakdown.emailSecurity },
        { name: 'DNS', value: breakdown.dns },
        { name: 'Mixed Content', value: breakdown.mixedContent },
        { name: 'HSTS', value: breakdown.hsts },
        { name: 'Protocols', value: breakdown.protocols },
        { name: 'IP Reputation', value: breakdown.ipReputation },
      ]
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Score Breakdown</h3>
      
      {/* Overall Score Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
              className={getColor(score)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getColor(score).replace('bg-', 'text-')}`}>
                {score}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">/100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {breakdown && (
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{category.value}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${getColor(category.value)} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${category.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

