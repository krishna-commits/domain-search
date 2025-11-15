'use client';
import React from 'react';

interface CookieSecuritySectionProps {
  cookies: {
    cookies: any[];
    issues: string[];
    score: number;
  };
}

export default function CookieSecuritySection({ cookies }: CookieSecuritySectionProps) {
  // Handle case where cookies might be undefined or have different structure
  if (!cookies || !cookies.cookies || !Array.isArray(cookies.cookies) || cookies.cookies.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Cookie Security</h2>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">No cookies found in response headers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Cookie Security</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Cookie Security Score</span>
            <span className={`text-2xl font-bold ${
              cookies.score >= 80 ? 'text-green-600' :
              cookies.score >= 60 ? 'text-yellow-600' :
              cookies.score >= 40 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {cookies.score}/100
            </span>
          </div>
        </div>

        {cookies.issues && Array.isArray(cookies.issues) && cookies.issues.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">Security Issues:</p>
            <ul className="list-disc list-inside text-sm text-yellow-700">
              {cookies.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {cookies.cookies.map((cookie, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{cookie.name}</h3>
                <div className="flex gap-2">
                  {cookie.secure && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Secure</span>
                  )}
                  {cookie.httpOnly && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">HttpOnly</span>
                  )}
                  {cookie.sameSite && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      SameSite={cookie.sameSite}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {cookie.domain && <p>Domain: {cookie.domain}</p>}
                {cookie.path && <p>Path: {cookie.path}</p>}
                {cookie.expires && <p>Expires: {cookie.expires}</p>}
                {cookie.maxAge !== null && <p>Max-Age: {cookie.maxAge}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

