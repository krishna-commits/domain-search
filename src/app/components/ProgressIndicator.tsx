'use client';
import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  currentStep: string;
  steps: Array<{ name: string; status: 'pending' | 'in-progress' | 'completed' | 'error' }>;
}

export default function ProgressIndicator({ progress, currentStep, steps }: ProgressIndicatorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scan Progress</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {step.status === 'completed' && (
              <span className="text-green-600 dark:text-green-400">✓</span>
            )}
            {step.status === 'in-progress' && (
              <span className="text-indigo-600 dark:text-indigo-400 animate-spin">⟳</span>
            )}
            {step.status === 'error' && (
              <span className="text-red-600 dark:text-red-400">✗</span>
            )}
            {step.status === 'pending' && (
              <span className="text-gray-400 dark:text-gray-500">○</span>
            )}
            <span
              className={
                step.status === 'completed'
                  ? 'text-green-600 dark:text-green-400'
                  : step.status === 'in-progress'
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                  : step.status === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Current: {currentStep}
      </div>
    </div>
  );
}

