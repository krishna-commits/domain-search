'use client';
import React from 'react';

interface HSTSSectionProps {
  hsts: {
    preloaded: boolean;
    eligible: boolean;
    errors?: string[];
  };
}

export default function HSTSSection({ hsts }: HSTSSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">HSTS Preload Status</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">Preloaded</h3>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                hsts.preloaded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {hsts.preloaded ? 'Yes' : 'No'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {hsts.preloaded 
                ? 'Domain is in the HSTS preload list' 
                : 'Domain is not in the HSTS preload list'}
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">Eligible</h3>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                hsts.eligible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {hsts.eligible ? 'Yes' : 'No'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {hsts.eligible 
                ? 'Domain is eligible for HSTS preload' 
                : 'Domain is not eligible for HSTS preload'}
            </p>
          </div>
        </div>

        {hsts.errors && hsts.errors.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">Issues:</p>
            <ul className="list-disc list-inside text-sm text-yellow-700">
              {hsts.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {!hsts.preloaded && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 To enable HSTS preload, configure your server with the proper HSTS header and submit your domain to{' '}
              <a href="https://hstspreload.org" target="_blank" rel="noopener noreferrer" className="underline">
                hstspreload.org
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

