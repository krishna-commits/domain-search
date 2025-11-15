'use client';
import React from 'react';
import SectionCard from './SectionCard';

const scanFeatures = [
  {
    category: 'DNS & Network Security',
    icon: '🌐',
    features: [
      'DNS Record Analysis (A, AAAA, MX, TXT, CNAME, NS)',
      'DNSSEC Validation & Security',
      'DNS Response Time Analysis',
      'DNS Cache Poisoning Detection',
      'DNS-over-HTTPS (DoH) Support',
      'Subdomain Enumeration & Analysis',
      'IP Reputation & Geolocation',
      'Port Scanning & Open Port Detection',
    ],
  },
  {
    category: 'SSL/TLS & Certificate Security',
    icon: '🔐',
    features: [
      'SSL/TLS Certificate Validation',
      'Certificate Chain Analysis',
      'Certificate Transparency Logs',
      'TLS Version Testing (1.0, 1.1, 1.2, 1.3)',
      'Cipher Suite Analysis',
      'Certificate Pinning Detection',
      'OCSP Stapling Validation',
      'SSL Expiration Monitoring',
    ],
  },
  {
    category: 'Security Headers & Protocols',
    icon: '🛡️',
    features: [
      'Security Headers Analysis (CSP, HSTS, X-Frame-Options, etc.)',
      'Security Headers Grading',
      'Cookie Security Analysis',
      'Content Security Policy (CSP) Validation',
      'Mixed Content Detection',
      'HSTS Preload Status',
      'Enhanced Security Headers Check',
      'Session Security Analysis',
    ],
  },
  {
    category: 'Email Security',
    icon: '📧',
    features: [
      'SPF Record Validation',
      'DKIM Signature Verification',
      'DMARC Policy Analysis',
      'Email Server Configuration',
      'Email Security Best Practices',
    ],
  },
  {
    category: 'Vulnerability & Threat Detection',
    icon: '⚠️',
    features: [
      'Comprehensive Vulnerability Scanning',
      'OWASP Top 10 Security Tests',
      'Phishing Detection',
      'Blacklist Checking (100+ databases)',
      'Threat Intelligence Analysis',
      'Advanced Threat Correlation',
      'Malware Detection',
    ],
  },
  {
    category: 'Web Application Security',
    icon: '🔒',
    features: [
      'Authentication Security Testing',
      'API Security Analysis',
      'Rate Limiting Detection',
      'Form Security Analysis',
      'CSRF Protection Detection',
      'XSS Vulnerability Scanning',
      'SQL Injection Testing',
      'Session Management Analysis',
    ],
  },
  {
    category: 'Technology & Infrastructure',
    icon: '⚙️',
    features: [
      'Technology Stack Detection',
      'CMS Detection (WordPress, Drupal, Joomla)',
      'Framework & Library Identification',
      'Server & CDN Detection',
      'Analytics & Tracking Detection',
      'Advanced Technology Fingerprinting',
    ],
  },
  {
    category: 'Compliance & Privacy',
    icon: '✅',
    features: [
      'GDPR Compliance Checking',
      'Privacy Policy Validation',
      'Cookie Categorization',
      'Data Protection Analysis',
      'Compliance Reporting',
    ],
  },
  {
    category: 'Performance & Monitoring',
    icon: '⚡',
    features: [
      'Core Web Vitals Analysis',
      'Lighthouse Performance Audit',
      'Uptime Monitoring',
      'Real-time Status Monitoring',
      'Performance Score Calculation',
      'Load Time Analysis',
    ],
  },
  {
    category: 'Advanced Analysis',
    icon: '🔬',
    features: [
      'Deep Website Crawling',
      'Link Health Analysis',
      'Broken Link Detection',
      'API Endpoint Discovery',
      'JavaScript Analysis',
      'SEO Security Checks',
      'Comprehensive Website Analysis',
      'Metadata Extraction',
    ],
  },
  {
    category: 'Specialized Scanners',
    icon: '🎯',
    features: [
      'API Security Testing',
      'Kubernetes Security Scanning',
      'Password Policy Auditing',
      'Mobile App Security',
      'Network Tests',
      'Specialized Security Tools',
    ],
  },
  {
    category: 'Reporting & Analytics',
    icon: '📊',
    features: [
      'Executive Security Reports',
      'Historical Tracking',
      'Security Score Calculation',
      'Risk Assessment',
      'Recommendations Generation',
      'Analytics Dashboard',
      'PDF & JSON Export',
    ],
  },
];

export default function ScanFeatures() {
  return (
    <SectionCard title="What We Scan" icon="🔍" collapsible defaultExpanded={true}>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
          <div className="relative p-6 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Comprehensive Security Analysis
                  </span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-black text-2xl text-blue-600 dark:text-blue-400">100+</span> security checks across <span className="font-semibold">12 categories</span>
                </p>
              </div>
              <div className="flex gap-3">
                {['🔒', '⚡', '🛡️'].map((icon, i) => (
                  <div key={i} className="w-12 h-12 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-teal-500/10 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm border border-slate-200/40 dark:border-slate-700/40">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scanFeatures.map((category, index) => (
            <div
              key={index}
              className="group relative p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-200/60 dark:border-slate-700/60 hover:border-blue-400/60 dark:hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-teal-500/5 transition-all duration-500"></div>
              
              {/* Header */}
              <div className="relative flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md group-hover:bg-blue-500/30 transition-colors"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-teal-500/10 rounded-lg flex items-center justify-center text-xl backdrop-blur-sm border border-slate-200/40 dark:border-slate-700/40 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex-1">
                  {category.category}
                </h3>
              </div>
              
              {/* Features List */}
              <ul className="relative space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {category.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start group/item">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 group-hover/item:scale-150 transition-transform"></div>
                    </div>
                    <span className="leading-relaxed group-hover/item:text-slate-900 dark:group-hover/item:text-slate-100 transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-xl blur-lg"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Info Banner */}
        <div className="relative p-5 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 border-2 border-blue-200/60 dark:border-blue-800/60 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] opacity-20"></div>
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
              ℹ
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Scan Duration
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                Comprehensive scans typically take <span className="font-bold">30-60 seconds</span> depending on domain complexity and selected scan profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

