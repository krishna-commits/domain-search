'use client';
import React from 'react';
import ProgressRing from './ProgressRing';
import Badge from './Badge';

interface SecurityScoreProps {
  score: number;
  riskAssessment?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
  };
  recommendations?: string[];
}

export default function SecurityScore({ score, riskAssessment, recommendations }: SecurityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', ring: '#10b981' };
    if (score >= 60) return { text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', ring: '#f59e0b' };
    if (score >= 40) return { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800', ring: '#f97316' };
    return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', ring: '#ef4444' };
  };

  const getRiskVariant = (level: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-20`}></div>
      
      <div className="relative p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Score & Risk Assessment</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Security Score */}
          <div className="text-center p-8 border-2 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Security Score</h3>
            <div className="flex flex-col items-center justify-center space-y-4">
              <ProgressRing percentage={score} size={160} strokeWidth={16} color={colors.ring} />
              <div className={`text-5xl font-bold ${colors.text} mt-4`}>
                {score}
                <span className="text-2xl text-gray-500 dark:text-gray-400">/100</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'}
              </p>
            </div>
          </div>

          {/* Risk Level */}
          {riskAssessment && (
            <div className="text-center p-8 border-2 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Risk Level</h3>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Badge variant={getRiskVariant(riskAssessment.riskLevel)} size="lg" className="text-xl px-6 py-3">
                  {riskAssessment.riskLevel.toUpperCase()}
                </Badge>
                {riskAssessment.riskFactors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {riskAssessment.riskFactors.length} risk factor{riskAssessment.riskFactors.length !== 1 ? 's' : ''} identified
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Risk Factors */}
        {riskAssessment && riskAssessment.riskFactors.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>⚠️</span>
              <span>Risk Factors</span>
            </h3>
            <ul className="space-y-3">
              {riskAssessment.riskFactors.map((factor, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 shadow-sm">
                  <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 font-medium">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>💡</span>
              <span>Recommendations</span>
            </h3>
            <ul className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-blue-500 dark:text-blue-400 text-xl mt-0.5">💡</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

