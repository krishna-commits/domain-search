'use client';
import React from 'react';

interface IPReputationSectionProps {
  ipReputation: {
    ip: string;
    geolocation: { success: boolean; data: any; provider: string | null };
    asn: { success: boolean; asn: string | null; asnName: string | null; network: string | null };
    virusTotal: { success: boolean; data: any; error?: string | null };
    abuseIPDB: { success: boolean; data: any; error?: string | null };
    blacklists: { blacklists: Array<{ name: string; url: string; checked: boolean; listed: boolean | null }>; note?: string };
    reputationScore: number;
  };
}

export default function IPReputationSection({ ipReputation }: IPReputationSectionProps) {
  if (!ipReputation) return null;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">IP Reputation & Geolocation</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">IP Reputation Score</span>
            <span className={`text-2xl font-bold ${
              ipReputation.reputationScore >= 80 ? 'text-green-600' :
              ipReputation.reputationScore >= 60 ? 'text-yellow-600' :
              ipReputation.reputationScore >= 40 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {ipReputation.reputationScore}/100
            </span>
          </div>
        </div>

        {/* IP Address */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">IP Address:</p>
          <code className="text-lg font-mono text-gray-900">{ipReputation.ip}</code>
        </div>

        {/* Geolocation */}
        {ipReputation.geolocation && ipReputation.geolocation.success && ipReputation.geolocation.data && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Geolocation</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Country:</span>
                <span className="ml-2 font-medium">{ipReputation.geolocation.data.country || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Region:</span>
                <span className="ml-2 font-medium">{ipReputation.geolocation.data.region || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">City:</span>
                <span className="ml-2 font-medium">{ipReputation.geolocation.data.city || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">ISP:</span>
                <span className="ml-2 font-medium">{ipReputation.geolocation.data.isp || 'N/A'}</span>
              </div>
              {ipReputation.geolocation.data.latitude && ipReputation.geolocation.data.longitude && (
                <div className="col-span-2">
                  <span className="text-gray-600">Coordinates:</span>
                  <span className="ml-2 font-mono text-xs">
                    {ipReputation.geolocation.data.latitude}, {ipReputation.geolocation.data.longitude}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASN Information */}
        {ipReputation.asn && ipReputation.asn.success && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">ASN Information</h3>
            <div className="space-y-2 text-sm">
              {ipReputation.asn.asn && (
                <div>
                  <span className="text-gray-600">ASN:</span>
                  <span className="ml-2 font-medium">{ipReputation.asn.asn}</span>
                </div>
              )}
              {ipReputation.asn.asnName && (
                <div>
                  <span className="text-gray-600">ASN Name:</span>
                  <span className="ml-2 font-medium">{ipReputation.asn.asnName}</span>
                </div>
              )}
              {ipReputation.asn.network && (
                <div>
                  <span className="text-gray-600">Network:</span>
                  <span className="ml-2 font-mono text-xs">{ipReputation.asn.network}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VirusTotal */}
        {ipReputation.virusTotal && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">VirusTotal</h3>
            {ipReputation.virusTotal.success && ipReputation.virusTotal.data ? (
              <div className="space-y-2 text-sm">
                {ipReputation.virusTotal.data.detected ? (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 font-medium">⚠️ Threats Detected</p>
                    <p className="text-red-700">
                      {ipReputation.virusTotal.data.positives} / {ipReputation.virusTotal.data.total} engines detected threats
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 font-medium">✓ No threats detected</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {ipReputation.virusTotal.error || 'VirusTotal API key required for full check'}
              </p>
            )}
          </div>
        )}

        {/* AbuseIPDB */}
        {ipReputation.abuseIPDB && (
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">AbuseIPDB</h3>
            {ipReputation.abuseIPDB.success && ipReputation.abuseIPDB.data ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Abuse Confidence Score:</span>
                  <span className={`font-medium ${
                    ipReputation.abuseIPDB.data.abuseConfidenceScore < 25 ? 'text-green-600' :
                    ipReputation.abuseIPDB.data.abuseConfidenceScore < 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {ipReputation.abuseIPDB.data.abuseConfidenceScore}%
                  </span>
                </div>
                {ipReputation.abuseIPDB.data.totalReports > 0 && (
                  <div>
                    <span className="text-gray-600">Total Reports:</span>
                    <span className="ml-2 font-medium">{ipReputation.abuseIPDB.data.totalReports}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {ipReputation.abuseIPDB.error || 'AbuseIPDB API key required for full check'}
              </p>
            )}
          </div>
        )}

        {/* Blacklists */}
        {ipReputation.blacklists && ipReputation.blacklists.blacklists.length > 0 && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Blacklist Checks</h3>
            <div className="space-y-2">
              {ipReputation.blacklists.blacklists.map((bl, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{bl.name}</span>
                  <a 
                    href={bl.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Check →
                  </a>
                </div>
              ))}
            </div>
            {ipReputation.blacklists.note && (
              <p className="text-xs text-gray-500 mt-2">{ipReputation.blacklists.note}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

