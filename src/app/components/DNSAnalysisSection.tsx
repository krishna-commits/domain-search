'use client';
import React from 'react';

interface DNSAnalysisSectionProps {
  dnsAnalysis: {
    responseTime: { success: boolean; time: number; error?: string | null };
    propagation: Array<{ resolver: string; server: string; success: boolean; records: any[]; time: number; error?: string | null }>;
    dnsOverHTTPS: Array<{ provider: string; success: boolean; records: any[]; time: number; error?: string | null }>;
    cachePoisoning: { suspicious: boolean; consistency: number; recordSets: string[]; results: any[] };
    score: number;
  };
}

export default function DNSAnalysisSection({ dnsAnalysis }: DNSAnalysisSectionProps) {
  if (!dnsAnalysis) return null;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Advanced DNS Analysis</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">DNS Health Score</span>
            <span className={`text-2xl font-bold ${
              dnsAnalysis.score >= 80 ? 'text-green-600' :
              dnsAnalysis.score >= 60 ? 'text-yellow-600' :
              dnsAnalysis.score >= 40 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {dnsAnalysis.score}/100
            </span>
          </div>
        </div>

        {/* Response Time */}
        {dnsAnalysis.responseTime && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">DNS Response Time</h3>
            {dnsAnalysis.responseTime.success ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Response time:</span>
                <span className={`font-mono font-medium ${
                  dnsAnalysis.responseTime.time < 100 ? 'text-green-600' :
                  dnsAnalysis.responseTime.time < 500 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dnsAnalysis.responseTime.time}ms
                </span>
              </div>
            ) : (
              <p className="text-sm text-red-600">Failed: {dnsAnalysis.responseTime.error}</p>
            )}
          </div>
        )}

        {/* Propagation */}
        {dnsAnalysis.propagation && dnsAnalysis.propagation.length > 0 && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">DNS Propagation</h3>
            <div className="space-y-2">
              {dnsAnalysis.propagation.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{result.resolver}</span>
                    <span className="text-xs text-gray-500">({result.server})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <>
                        <span className="text-xs text-gray-600">{result.time}ms</span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          {result.records.length} record(s)
                        </span>
                      </>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DNS over HTTPS */}
        {dnsAnalysis.dnsOverHTTPS && dnsAnalysis.dnsOverHTTPS.length > 0 && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">DNS over HTTPS (DoH)</h3>
            <div className="space-y-2">
              {dnsAnalysis.dnsOverHTTPS.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{result.provider}</span>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <>
                        <span className="text-xs text-gray-600">{result.time}ms</span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Success
                        </span>
                      </>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cache Poisoning */}
        {dnsAnalysis.cachePoisoning && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Cache Poisoning Detection</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Consistency:</span>
              <span className={`font-medium ${
                dnsAnalysis.cachePoisoning.consistency >= 80 ? 'text-green-600' :
                dnsAnalysis.cachePoisoning.consistency >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {dnsAnalysis.cachePoisoning.consistency}%
              </span>
            </div>
            {dnsAnalysis.cachePoisoning.suspicious && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  ⚠️ Suspicious: Multiple different record sets detected. This may indicate cache poisoning.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

