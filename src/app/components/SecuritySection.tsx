import React, { useState } from 'react';

interface SecuritySectionProps {
  headers: any;
  protocols: any;
}

const CIPHER_WEAKNESS = [
  'RC4', 'DES', '3DES', 'MD5', 'SHA1', 'CBC', 'EXP', 'NULL', 'ANON', 'ADH', 'IDEA'
];

export default function SecuritySection({ headers, protocols }: SecuritySectionProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const headerStatus = (present: boolean) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {present ? 'Present' : 'Missing'}
    </span>
  );

  const protocolStatus = (status: string) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      status === 'secure' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {status === 'secure' ? 'Secure' : 'Insecure'}
    </span>
  );

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Security Configuration</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Security Headers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(headers).map(([header, data]: [string, any]) => (
                  <tr key={header}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{header.replace(/-/g, ' ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {headerStatus(data.present)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{data.value || 'Not set'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Security Protocols</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700" title="The TLS version used for secure connections.">TLS Version</h4>
                {protocolStatus(protocols.tlsStatus)}
              </div>
              <p className="text-sm text-gray-600">Using: <span className="font-mono">{protocols.tlsVersion}</span></p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700" title="The cryptographic ciphers supported by the server.">Cipher Strength</h4>
                {protocolStatus(protocols.cipherStatus)}
              </div>
              <p className="text-sm text-gray-600">{protocols.ciphers.length} ciphers supported</p>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {protocols.ciphers.map((cipher: string, idx: number) => {
                  const isWeak = CIPHER_WEAKNESS.some(weak => cipher.includes(weak));
                  return (
                    <div key={cipher} className={`flex items-center mb-1 px-2 py-1 rounded ${isWeak ? 'bg-red-50' : 'bg-green-50'} group`}>
                      <span className={`font-mono text-xs flex-1 ${isWeak ? 'text-red-700' : 'text-green-700'}`}>{cipher}</span>
                      <button
                        className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                        onClick={() => handleCopy(cipher, `cipher-${idx}`)}
                        title="Copy"
                      >
                        {copied === `cipher-${idx}` ? 'Copied!' : 'Copy'}
                      </button>
                      {isWeak && (
                        <span className="ml-2 text-xs text-red-600" title="This cipher is considered weak or outdated.">⚠️ Weak</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}