import React, { useState } from 'react';

interface SSLInfoProps {
  ssl: any;
  vulnerabilities: any[];
  brokenLinks: any[];
}

export default function SSLInfo({ ssl, vulnerabilities, brokenLinks }: SSLInfoProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString();
  };

  // Helper to format entity fields
  const formatCertEntity = (entity: any) => {
    if (!entity) return 'Unknown';
    if (typeof entity === 'string') return entity;
    if (typeof entity === 'object') {
      return Object.entries(entity)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
    return String(entity);
  };

  // Helper to format entity fields as block
  const formatCertEntityBlock = (entity: any) => {
    if (!entity) return <span>Unknown</span>;
    if (typeof entity === 'string') return <span>{entity}</span>;
    if (typeof entity === 'object') {
      return (
        <div className="ml-2">
          {Object.entries(entity).map(([k, v]) => (
            <div key={k}><span className="font-mono text-xs text-gray-700">{k}</span>: <span className="font-mono text-xs text-blue-900">{v as string}</span></div>
          ))}
        </div>
      );
    }
    return <span>{String(entity)}</span>;
  };

  // Helper to format public key info
  const formatPublicKeyInfo = (cert: any) => {
    if (!cert.publicKeyAlgorithm && !cert.publicKey) return 'Unknown';
    return (
      <div className="ml-2">
        <div><span className="font-mono text-xs text-gray-700">Algorithm</span>: <span className="font-mono text-xs text-blue-900">{cert.publicKeyAlgorithm || 'Unknown'}</span></div>
        {cert.publicKeySize && (
          <div><span className="font-mono text-xs text-gray-700">Key Size</span>: <span className="font-mono text-xs text-blue-900">{cert.publicKeySize} bit</span></div>
        )}
        {cert.publicKey && (
          <div><span className="font-mono text-xs text-gray-700">Public Key</span>:
            <pre className="bg-gray-100 p-1 rounded text-xs overflow-x-auto mt-1">{cert.publicKey}</pre>
          </div>
        )}
      </div>
    );
  };

  // Helper to format SANs
  const formatSANs = (sans: any) => {
    if (!sans) return 'None';
    if (Array.isArray(sans)) return sans.join(', ');
    if (typeof sans === 'string') return sans;
    return JSON.stringify(sans);
  };

  // Collapsible panel for each cert
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">SSL/TLS Details</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Certificate Information</h3>
            <div className={`p-3 rounded-md ${ssl.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="grid grid-cols-1 gap-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Valid:</span>
                  <span className={`text-sm font-medium ${ssl.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {ssl.valid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Issuer:</span>
                  <span className="text-sm text-gray-900">{formatCertEntity(ssl.issuer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Subject:</span>
                  <span className="text-sm text-gray-900">{formatCertEntity(ssl.subject)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Algorithm:</span>
                  <span className="text-sm text-gray-900">{ssl.algorithm || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fingerprint:</span>
                  <span className="text-sm text-gray-900 font-mono truncate">{ssl.fingerprint || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Validity Period</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Issued On:</span>
                  <span className="text-sm text-gray-900">{formatDate(ssl.validFrom)}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expires On:</span>
                  <span className="text-sm text-gray-900">{formatDate(ssl.validTo)}</span>
                </div>
              </div>
              <div className={`p-3 rounded-md ${
                ssl.daysRemaining > 30 ? 'bg-green-50' : 
                ssl.daysRemaining > 7 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Days Remaining:</span>
                  <span className={`text-sm font-medium ${
                    ssl.daysRemaining > 30 ? 'text-green-700' : 
                    ssl.daysRemaining > 7 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {ssl.daysRemaining !== undefined ? ssl.daysRemaining : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Certificate Chain </h3>
          <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
            {ssl.chain && ssl.chain.length > 0 ? (
              <ul className="space-y-3">
                {ssl.chain.map((cert: any, index: number) => (
                  <li key={index} className="p-3 bg-white rounded border">
                    <button
                      className="w-full text-left font-semibold text-blue-700 hover:underline focus:outline-none"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                      Certificate {index + 1}: {formatCertEntity(cert.subject)}
                    </button>
                    {openIndex === index && (
                      <div className="mt-3 text-sm">
                        <table className="min-w-full text-left text-sm">
                          <tbody>
                            <tr><td className="font-medium pr-2">CA Name/Key</td><td>{formatCertEntityBlock(cert.subject)}</td></tr>
                            <tr><td className="font-medium pr-2">Subject</td><td>{formatCertEntityBlock(cert.subject)}</td></tr>
                            <tr><td className="font-medium pr-2">Subject Public Key Info</td><td>{formatPublicKeyInfo(cert)}</td></tr>
                            <tr><td className="font-medium pr-2">Serial Number</td><td>{cert.serialNumber || 'Unknown'}</td></tr>
                            <tr><td className="font-medium pr-2">Not Before</td><td>{formatDate(cert.validFrom)}</td></tr>
                            <tr><td className="font-medium pr-2">Not After</td><td>{formatDate(cert.validTo)}</td></tr>
                            <tr><td className="font-medium pr-2">Issuer Name</td><td>{formatCertEntityBlock(cert.issuer)}</td></tr>
                            <tr><td className="font-medium pr-2">Signature Algorithm</td><td>{cert.signatureAlgorithm || 'Unknown'}</td></tr>
                            <tr><td className="font-medium pr-2">SANs</td><td>{formatSANs(cert.subjectAltName)}</td></tr>
                          </tbody>
                        </table>
                        {cert.pem && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600">Show PEM</summary>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-1">{cert.pem}</pre>
                          </details>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Certificate chain information not available</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="p-3 bg-gray-50 rounded-md flex-1">
            <span className="font-medium">Vulnerabilities:</span>
            <span className={`ml-2 font-bold ${vulnerabilities.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {vulnerabilities.length}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-md flex-1">
            <span className="font-medium">Broken Links:</span>
            <span className={`ml-2 font-bold ${brokenLinks.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {brokenLinks.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}