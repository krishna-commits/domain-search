'use client';
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
  className?: string;
}

export default function StatCard({ 
  label, 
  value, 
  icon, 
  trend,
  color = 'gray',
  className = '' 
}: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    gray: 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
  };

  return (
    <div className={`relative p-5 rounded-xl border-2 ${colorClasses[color]} ${className} transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden group`}>
      {/* Animated background gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${
        color === 'green' ? 'from-green-400 to-green-600' :
        color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
        color === 'red' ? 'from-red-400 to-red-600' :
        color === 'blue' ? 'from-blue-400 to-blue-600' :
        color === 'purple' ? 'from-purple-400 to-purple-600' :
        'from-gray-400 to-gray-600'
      }`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        {icon && (
          <div className="text-4xl opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center space-x-1 text-xs font-medium">
          {trend === 'up' && (
            <>
              <span className="text-green-600 dark:text-green-400">↑</span>
              <span className="text-green-600 dark:text-green-400">Improved</span>
            </>
          )}
          {trend === 'down' && (
            <>
              <span className="text-red-600 dark:text-red-400">↓</span>
              <span className="text-red-600 dark:text-red-400">Declined</span>
            </>
          )}
          {trend === 'neutral' && (
            <>
              <span className="text-gray-600 dark:text-gray-400">→</span>
              <span className="text-gray-600 dark:text-gray-400">Stable</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

