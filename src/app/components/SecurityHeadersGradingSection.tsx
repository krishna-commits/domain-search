'use client';
import React from 'react';

interface SecurityHeadersGradingSectionProps {
  headersGrading: {
    overall: { grade: string; score: number };
    grades: Record<string, { grade: string; score: number; issues: string[] }>;
    recommendations: string[];
  };
}

export default function SecurityHeadersGradingSection({ headersGrading }: SecurityHeadersGradingSectionProps) {
  if (!headersGrading) return null;

  const getGradeColor = (grade: string) => {
    if (grade === 'A+') return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    if (grade === 'A') return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    if (grade === 'B') return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    if (grade === 'C') return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">Security Headers Grading</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Overall Grade</p>
          <div className={`inline-block text-5xl font-bold px-6 py-4 rounded-lg ${getGradeColor(headersGrading.overall.grade)}`}>
            {headersGrading.overall.grade}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Score: {Math.round(headersGrading.overall.score)}/100</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {Object.entries(headersGrading.grades).map(([header, grade]) => (
            <div key={header} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {header.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`px-3 py-1 rounded text-sm font-bold ${getGradeColor(grade.grade)}`}>
                  {grade.grade}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Score: {grade.score}/100</p>
              {grade.issues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Issues:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                    {grade.issues.slice(0, 2).map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {headersGrading.recommendations.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Recommendations</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
              {headersGrading.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

