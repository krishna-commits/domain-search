'use client';
import React from 'react';

interface VisualScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  icon?: string;
  color?: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple';
  breakdown?: Array<{ label: string; value: number; color?: string }>;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

export default function VisualScoreCard({
  title,
  score,
  maxScore = 100,
  icon = '📊',
  color = 'blue',
  breakdown,
  trend,
  trendValue,
}: VisualScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  const colorClasses = {
    green: {
      bg: 'bg-green-500',
      light: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      gradient: 'from-green-400 to-green-600',
    },
    yellow: {
      bg: 'bg-yellow-500',
      light: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      gradient: 'from-yellow-400 to-yellow-600',
    },
    orange: {
      bg: 'bg-orange-500',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      gradient: 'from-orange-400 to-orange-600',
    },
    red: {
      bg: 'bg-red-500',
      light: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      gradient: 'from-red-400 to-red-600',
    },
    blue: {
      bg: 'bg-blue-500',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      gradient: 'from-blue-400 to-blue-600',
    },
    purple: {
      bg: 'bg-purple-500',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      gradient: 'from-purple-400 to-purple-600',
    },
  };

  const colors = colorClasses[color];
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const scoreColor = getScoreColor(percentage);
  const scoreColors = colorClasses[scoreColor as keyof typeof colorClasses];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scoreColors.gradient} opacity-5`}></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-5xl font-bold ${scoreColors.text}`}>
              {score}
            </span>
            <span className="text-2xl text-gray-400 dark:text-gray-500">/ {maxScore}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full ${scoreColors.bg} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && breakdown.length > 0 && (
          <div className="space-y-2">
            {breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color || scoreColors.bg} transition-all duration-500`}
                      style={{ width: `${(item.value / maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

