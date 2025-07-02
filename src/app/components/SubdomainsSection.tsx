import React from 'react';

interface SubdomainsSectionProps {
  subdomains: string[];
}

export default function SubdomainsSection({ subdomains }: SubdomainsSectionProps) {
  if (!subdomains || subdomains.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Subdomains</h2>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-center text-gray-500">No subdomains found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Subdomains ({subdomains.length})</h2>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {subdomains.map((subdomain, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-md p-3 font-mono text-sm hover:bg-gray-100 transition-colors"
            >
              {subdomain}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}