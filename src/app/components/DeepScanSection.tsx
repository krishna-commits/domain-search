'use client';
import React, { useState } from 'react';

interface DeepScanSectionProps {
  deepScan: {
    crawling?: {
      pagesCrawled: number;
      analysis: any;
    };
    informationGathering?: {
      robotsTxt: any;
      sitemap: any;
      commonFiles: any;
      apiEndpoints: any;
      socialMedia: any;
      websiteStructure: any;
      exposedInformation: any;
    };
    technologyFingerprinting?: any;
    performance?: any;
    seoSecurity?: any;
    javascriptAnalysis?: any;
    vulnerabilityScan?: any;
  };
}

export default function DeepScanSection({ deepScan }: DeepScanSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!deepScan) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'crawling', label: 'Crawling' },
    { id: 'information', label: 'Information' },
    { id: 'technology', label: 'Technology' },
    { id: 'performance', label: 'Performance' },
    { id: 'seo', label: 'SEO' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'vulnerabilities', label: 'Vulnerabilities' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">Deep Scan Results</h2>
      
      <div className="px-4 py-5 sm:p-6">
        {/* Tabs */}
        <div className="border-b dark:border-gray-700 mb-4">
          <nav className="flex space-x-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'overview' && <OverviewTab deepScan={deepScan} />}
          {activeTab === 'crawling' && <CrawlingTab deepScan={deepScan} />}
          {activeTab === 'information' && <InformationTab deepScan={deepScan} />}
          {activeTab === 'technology' && <TechnologyTab deepScan={deepScan} />}
          {activeTab === 'performance' && <PerformanceTab deepScan={deepScan} />}
          {activeTab === 'seo' && <SEOTab deepScan={deepScan} />}
          {activeTab === 'javascript' && <JavaScriptTab deepScan={deepScan} />}
          {activeTab === 'vulnerabilities' && <VulnerabilitiesTab deepScan={deepScan} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ deepScan }: { deepScan: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pages Crawled</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {deepScan.crawling?.pagesCrawled || 0}
        </p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vulnerabilities</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {deepScan.vulnerabilityScan?.total || 0}
        </p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Performance Grade</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {deepScan.performance?.performance?.grade || 'N/A'}
        </p>
      </div>
    </div>
  );
}

function CrawlingTab({ deepScan }: { deepScan: any }) {
  const analysis = deepScan.crawling?.analysis;
  if (!analysis) return <p className="text-gray-500 dark:text-gray-400">No crawling data available</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Pages</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{analysis.totalPages || 0}</p>
        </div>
        <div className="p-3 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Links</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{analysis.totalLinks || 0}</p>
        </div>
        <div className="p-3 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{analysis.totalImages || 0}</p>
        </div>
        <div className="p-3 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Forms</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{analysis.totalForms || 0}</p>
        </div>
      </div>

      {analysis.securityIssues && analysis.securityIssues.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">Security Issues</h3>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
            {analysis.securityIssues.map((issue: string, index: number) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function InformationTab({ deepScan }: { deepScan: any }) {
  const info = deepScan.informationGathering;
  if (!info) return <p className="text-gray-500 dark:text-gray-400">No information gathering data available</p>;

  return (
    <div className="space-y-4">
      {/* Robots.txt */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Robots.txt</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {info.robotsTxt?.found ? 'Found' : 'Not found'}
        </p>
        {info.robotsTxt?.analysis?.sitemaps && info.robotsTxt.analysis.sitemaps.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sitemaps:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
              {info.robotsTxt.analysis.sitemaps.map((sitemap: string, index: number) => (
                <li key={index}>{sitemap}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sitemap */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sitemap</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {info.sitemap?.found ? `Found (${info.sitemap.analysis?.urls?.length || 0} URLs)` : 'Not found'}
        </p>
      </div>

      {/* Common Files */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Common Files</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Found {info.commonFiles?.found || 0} of {info.commonFiles?.checked || 0} checked files
        </p>
        {info.commonFiles?.files && info.commonFiles.files.length > 0 && (
          <div className="mt-2 space-y-1">
            {info.commonFiles.files.map((file: any, index: number) => (
              <div key={index} className="text-sm">
                <code className="text-gray-900 dark:text-white">{file.path}</code>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  file.accessible ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Endpoints */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">API Endpoints</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Found {info.apiEndpoints?.count || 0} endpoints
        </p>
        {info.apiEndpoints?.endpoints && info.apiEndpoints.endpoints.length > 0 && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {info.apiEndpoints.endpoints.slice(0, 20).map((endpoint: string, index: number) => (
              <code key={index} className="block text-sm text-gray-900 dark:text-white">{endpoint}</code>
            ))}
          </div>
        )}
      </div>

      {/* Social Media */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Social Media Presence</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {info.socialMedia?.facebook && info.socialMedia.facebook.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{info.socialMedia.facebook.length} found</p>
            </div>
          )}
          {info.socialMedia?.twitter && info.socialMedia.twitter.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{info.socialMedia.twitter.length} found</p>
            </div>
          )}
          {info.socialMedia?.linkedin && info.socialMedia.linkedin.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{info.socialMedia.linkedin.length} found</p>
            </div>
          )}
        </div>
      </div>

      {/* Exposed Information */}
      {info.exposedInformation?.found && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">⚠️ Exposed Information</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            Found {info.exposedInformation.count} items
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {info.exposedInformation.items?.slice(0, 10).map((item: any, index: number) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{item.type}:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{item.value}</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  item.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TechnologyTab({ deepScan }: { deepScan: any }) {
  const tech = deepScan.technologyFingerprinting;
  if (!tech) return <p className="text-gray-500 dark:text-gray-400">No technology data available</p>;

  return (
    <div className="space-y-4">
      {/* Server */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Server</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {tech.server?.name || 'Unknown'} {tech.server?.version ? `v${tech.server.version}` : ''}
        </p>
      </div>

      {/* CMS */}
      {tech.cms?.name && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">CMS</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tech.cms.name} {tech.cms.version ? `v${tech.cms.version}` : ''}
          </p>
          {tech.cms.plugins && tech.cms.plugins.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Plugins:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {tech.cms.plugins.slice(0, 10).map((plugin: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                    {plugin}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Frameworks */}
      {tech.frameworks && tech.frameworks.length > 0 && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Frameworks</h3>
          <div className="space-y-1">
            {tech.frameworks.map((fw: any, index: number) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {fw.name} {fw.version ? `v${fw.version}` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics */}
      {tech.analytics && tech.analytics.length > 0 && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analytics</h3>
          <div className="space-y-1">
            {tech.analytics.map((analytics: any, index: number) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {analytics.name} {analytics.id ? `(${analytics.id})` : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PerformanceTab({ deepScan }: { deepScan: any }) {
  const perf = deepScan.performance;
  if (!perf) return <p className="text-gray-500 dark:text-gray-400">No performance data available</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Response Time</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{perf.responseTime}ms</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Content Size</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{perf.contentSizeKB} KB</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Grade</p>
          <p className={`text-xl font-bold ${
            perf.performance?.grade === 'A' ? 'text-green-600 dark:text-green-400' :
            perf.performance?.grade === 'B' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {perf.performance?.grade || 'N/A'}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compression</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {perf.compression?.enabled ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {perf.performance?.recommendations && perf.performance.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Recommendations</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
            {perf.performance.recommendations.map((rec: string, index: number) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SEOTab({ deepScan }: { deepScan: any }) {
  const seo = deepScan.seoSecurity;
  if (!seo) return <p className="text-gray-500 dark:text-gray-400">No SEO data available</p>;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO Score</span>
          <span className={`text-2xl font-bold ${
            seo.score >= 80 ? 'text-green-600 dark:text-green-400' :
            seo.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {seo.score}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Title</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {seo.seo?.title?.present ? 'Present' : 'Missing'}
          </p>
          {seo.seo?.title?.issues && seo.seo.title.issues.length > 0 && (
            <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 mt-1">
              {seo.seo.title.issues.map((issue: string, index: number) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {seo.seo?.description?.present ? 'Present' : 'Missing'}
          </p>
          {seo.seo?.description?.issues && seo.seo.description.issues.length > 0 && (
            <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 mt-1">
              {seo.seo.description.issues.map((issue: string, index: number) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {seo.recommendations && seo.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Recommendations</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
            {seo.recommendations.map((rec: string, index: number) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JavaScriptTab({ deepScan }: { deepScan: any }) {
  const js = deepScan.javascriptAnalysis;
  if (!js) return <p className="text-gray-500 dark:text-gray-400">No JavaScript data available</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Scripts</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{js.totalScripts || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inline Scripts</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{js.inlineScripts || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blocking Scripts</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{js.performance?.blocking || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Libraries</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{js.libraries?.length || 0}</p>
        </div>
      </div>

      {js.libraries && js.libraries.length > 0 && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Detected Libraries</h3>
          <div className="space-y-1">
            {js.libraries.map((lib: any, index: number) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {lib.name} {lib.version ? `v${lib.version}` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {js.security?.issues && js.security.issues.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">Security Issues</h3>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
            {js.security.issues.map((issue: string, index: number) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {js.recommendations && js.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Recommendations</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300">
            {js.recommendations.map((rec: string, index: number) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function VulnerabilitiesTab({ deepScan }: { deepScan: any }) {
  const vuln = deepScan.vulnerabilityScan;
  if (!vuln) return <p className="text-gray-500 dark:text-gray-400">No vulnerability data available</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{vuln.total || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{vuln.critical || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{vuln.high || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</p>
          <p className={`text-2xl font-bold capitalize ${
            vuln.riskLevel === 'critical' ? 'text-red-600 dark:text-red-400' :
            vuln.riskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' :
            vuln.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {vuln.riskLevel || 'low'}
          </p>
        </div>
      </div>

      {vuln.vulnerabilities && vuln.vulnerabilities.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Vulnerabilities</h3>
          {vuln.vulnerabilities.map((v: any, index: number) => (
            <div key={index} className={`p-4 border rounded-lg ${
              v.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              v.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
              v.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
              'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{v.type}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  v.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  v.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                  v.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {v.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{v.description}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">💡 {v.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

