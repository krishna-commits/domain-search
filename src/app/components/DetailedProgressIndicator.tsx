'use client';
import React from 'react';

interface ScanStep {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress: number; // 0-100
  details?: string;
  data?: any;
}

interface DetailedProgressIndicatorProps {
  progress: number;
  currentStep: string;
  steps: ScanStep[];
  scanData?: any;
}

export default function DetailedProgressIndicator({ 
  progress, 
  currentStep, 
  steps,
  scanData 
}: DetailedProgressIndicatorProps) {
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : progress;

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
        <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl p-8 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_20s_linear_infinite]"></div>
          </div>
          
          <div className="relative z-10">
            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                    <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                      Scanning in Progress
                    </span>
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentStep}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {completedSteps} of {totalSteps} steps
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${overallProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const stepProgress = step.progress || (step.status === 'completed' ? 100 : step.status === 'in-progress' ? 50 : 0);
                
                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      step.status === 'completed'
                        ? 'bg-green-50/50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                        : step.status === 'in-progress'
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-lg'
                        : step.status === 'error'
                        ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {step.status === 'completed' && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {step.status === 'in-progress' && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                        )}
                        {step.status === 'error' && (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        {step.status === 'pending' && (
                          <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                        )}
                        <div>
                          <span className={`font-bold text-sm ${
                            step.status === 'completed'
                              ? 'text-green-700 dark:text-green-400'
                              : step.status === 'in-progress'
                              ? 'text-blue-700 dark:text-blue-400'
                              : step.status === 'error'
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {step.name}
                          </span>
                          {step.details && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                              {step.details}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          step.status === 'completed'
                            ? 'text-green-600 dark:text-green-400'
                            : step.status === 'in-progress'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {step.status === 'in-progress' ? `${Math.round(stepProgress)}%` : step.status === 'completed' ? '100%' : '0%'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Step Progress Bar */}
                    {step.status === 'in-progress' && (
                      <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                          style={{ width: `${stepProgress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {/* Step Data Preview */}
                    {step.data && step.status === 'completed' && (
                      <div className="mt-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Data Collected:
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {typeof step.data === 'object' ? (
                            <pre className="overflow-x-auto text-[10px]">
                              {JSON.stringify(step.data, null, 2).substring(0, 200)}
                              {JSON.stringify(step.data, null, 2).length > 200 ? '...' : ''}
                            </pre>
                          ) : (
                            <div>{String(step.data).substring(0, 100)}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Data Preview */}
      {scanData && Object.keys(scanData).length > 0 && (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 rounded-2xl blur-lg opacity-10"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-xl p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Real-time Scan Data
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(scanData).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[120px]">
                    {key}:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 flex-1">
                    {typeof value === 'object' 
                      ? JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '')
                      : String(value).substring(0, 100)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

