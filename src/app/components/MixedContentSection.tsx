'use client';
import React from 'react';

interface MixedContentSectionProps {
  mixedContent: {
    found: boolean;
    count: number;
    items: Array<{ url: string; type: string; context?: string }>;
    score: number;
  };
}

export default function MixedContentSection({ mixedContent }: MixedContentSectionProps) {
  if (!mixedContent.found) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Mixed Content</h2>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
              No Mixed Content Detected
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">All resources are served over HTTPS.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Mixed Content</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Mixed Content Score</span>
            <span className={`text-2xl font-bold ${
              mixedContent.score >= 80 ? 'text-green-600' :
              mixedContent.score >= 60 ? 'text-yellow-600' :
              mixedContent.score >= 40 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {mixedContent.score}/100
            </span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-1">
            ⚠️ {mixedContent.count} mixed content resource(s) found
          </p>
          <p className="text-sm text-red-700">
            Mixed content can cause security warnings and should be replaced with HTTPS resources.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Insecure Resources:</h3>
          {mixedContent.items.slice(0, 20).map((item, index) => (
            <div key={index} className="border rounded p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.type === 'http' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.type}
                </span>
                <code className="text-sm text-gray-700 font-mono break-all flex-1">
                  {item.url}
                </code>
              </div>
            </div>
          ))}
          {mixedContent.items.length > 20 && (
            <p className="text-sm text-gray-500 mt-2">
              ... and {mixedContent.items.length - 20} more
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

