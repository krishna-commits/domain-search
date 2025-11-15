'use client';
import React from 'react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export default function StatusIndicator({
  status,
  label,
  size = 'md',
  pulse = false,
}: StatusIndicatorProps) {
  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    pending: 'bg-gray-400',
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${statusColors[status]} rounded-full ${
            pulse ? 'animate-pulse' : ''
          }`}
        ></div>
        {pulse && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} ${statusColors[status]} rounded-full animate-ping opacity-75`}
          ></div>
        )}
      </div>
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      )}
    </div>
  );
}

