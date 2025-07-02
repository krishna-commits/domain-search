import React from 'react';

interface TechStackSectionProps {
  techStack: any;
}

export default function TechStackSection({ techStack }: TechStackSectionProps) {
  if (!techStack) return null;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">Technology Stack (Deep Analysis)</h2>
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <dt className="font-medium text-gray-700">Server</dt>
            <dd className="text-gray-900">{techStack.server || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Powered By</dt>
            <dd className="text-gray-900">{techStack.poweredBy || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Framework</dt>
            <dd className="text-gray-900">{techStack.framework || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">CMS</dt>
            <dd className="text-gray-900">{techStack.cms || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">CDN</dt>
            <dd className="text-gray-900">{techStack.cdn || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">JS Libraries</dt>
            <dd className="text-gray-900">{techStack.jsLibraries?.length ? techStack.jsLibraries.join(', ') : 'None detected'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Analytics</dt>
            <dd className="text-gray-900">{techStack.analytics?.length ? techStack.analytics.join(', ') : 'None detected'}</dd>
          </div>
        </dl>
        {techStack.meta && Object.keys(techStack.meta).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Meta Tags</h3>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {Object.entries(techStack.meta).map(([k, v]) => (
                <li key={k}><span className="font-mono">{k}</span>: {v as string}</li>
              ))}
            </ul>
          </div>
        )}
        {techStack.others && techStack.others.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Other Detected Technologies</h3>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {techStack.others.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}