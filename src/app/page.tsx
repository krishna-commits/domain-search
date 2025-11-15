'use client';
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import SectionCard from './components/SectionCard';
import ScanProfileSelector, { ScanProfile, CustomScanConfig } from './components/ScanProfileSelector';
import Dashboard from './components/Dashboard';
import SkeletonLoader from './components/SkeletonLoader';
import ProgressIndicator from './components/ProgressIndicator';
import DetailedProgressIndicator from './components/DetailedProgressIndicator';
import ResultsDisplay from './components/ResultsDisplay';
import ScanFeatures from './components/ScanFeatures';

type ApiResponse = {
  domainDetails: any;
  whois: any;
  dns: any;
  dnssec: any;
  ssl: any;
  security: {
    headers: any;
    protocols: any;
  };
  cookies?: any;
  csp?: any;
  mixedContent?: any;
  hsts?: any;
  emailSecurity?: any;
  dnsAnalysis?: any;
  techStack: any;
  subdomains: string[];
  threats: any;
  vulnerabilities: any[];
  brokenLinks: any[];
  ipServices: any[];
  ipReputation?: any;
  rawDns: any;
  emails: string[];
  securityScore?: number;
  riskAssessment?: any;
  recommendations?: string[];
  portScan?: any;
  enhancedSubdomains?: string[];
  subdomainAnalysis?: any;
  certificateAnalysis?: any;
  certificateTransparency?: any;
  headersGrading?: any;
  phishingDetection?: any;
  blacklistCheck?: any;
  deepScan?: any;
  sslMonitoring?: any;
  dnsChangeDetection?: any;
  compliance?: any;
  uptimeMonitoring?: any;
  dnsSecurity?: any;
  tlsDeepAnalysis?: any;
  webAppSecurity?: any;
  privacyCompliance?: any;
  apiSecurityTesting?: any;
  mobileAppSecurity?: any;
  cmsScanner?: any;
  networkTests?: any;
  specializedScanners?: any;
  webTools?: any;
  advancedDNSSEC?: any;
  advancedTLS?: any;
  advancedOWASP?: any;
  coreWebVitals?: any;
  realTimeMonitoring?: any;
  enhancedExecutiveReport?: any;
  advancedThreatIntelligence?: any;
  comprehensiveScan?: any;
};

type ScanStepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

type ScanStep = {
  name: string;
  status: ScanStepStatus;
  progress?: number;
  data?: any;
};

export default function Home() {
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanProfile, setScanProfile] = useState<ScanProfile>('deep');
  const [customConfig, setCustomConfig] = useState<CustomScanConfig>({
    includeDNS: true,
    includeSSL: true,
    includeSecurityHeaders: true,
    includeCookies: true,
    includeCSP: true,
    includeEmailSecurity: true,
    includeIPReputation: true,
    includeVulnerabilities: true,
    includeSubdomains: true,
    includeBrokenLinks: true,
  });
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [scanData, setScanData] = useState<any>({});

  const handleSearch = async (domain: string) => {
    setLoading(true);
    setError('');
    setResults(null);
    setProgress(0);
    setScanData({});
    setCurrentStep('Initializing comprehensive security scan...');
    
    // Comprehensive scan steps with percentages
    const steps: ScanStep[] = [
      { name: 'Domain Resolution & WHOIS', status: 'pending', progress: 0 },
      { name: 'DNS Records Analysis', status: 'pending', progress: 0 },
      { name: 'SSL/TLS Certificate Check', status: 'pending', progress: 0 },
      { name: 'Security Headers Analysis', status: 'pending', progress: 0 },
      { name: 'Cookie Security Analysis', status: 'pending', progress: 0 },
      { name: 'CSP & Content Security', status: 'pending', progress: 0 },
      { name: 'Email Security (SPF/DKIM/DMARC)', status: 'pending', progress: 0 },
      { name: 'IP Reputation Check', status: 'pending', progress: 0 },
      { name: 'Port Scanning (0-65535)', status: 'pending', progress: 0 },
      { name: 'Vulnerability Scanning', status: 'pending', progress: 0 },
      { name: 'Subdomain Enumeration', status: 'pending', progress: 0 },
      { name: 'Technology Stack Detection', status: 'pending', progress: 0 },
      { name: 'Certificate Chain Analysis', status: 'pending', progress: 0 },
      { name: 'Security Headers Grading', status: 'pending', progress: 0 },
      { name: 'Phishing Detection', status: 'pending', progress: 0 },
      { name: 'Blacklist Checking', status: 'pending', progress: 0 },
      { name: 'Deep Website Crawling', status: 'pending', progress: 0 },
      { name: 'Compliance & Privacy Check', status: 'pending', progress: 0 },
      { name: 'Performance Analysis', status: 'pending', progress: 0 },
      { name: 'Finalizing Report', status: 'pending', progress: 0 },
    ];
    setScanSteps(steps);

    // Simulate progress updates
    const updateProgress = (stepIndex: number, stepProgress: number, stepData?: any) => {
      const updatedSteps = [...steps];
      if (updatedSteps[stepIndex]) {
        updatedSteps[stepIndex].status = stepProgress === 100 ? 'completed' : 'in-progress';
        updatedSteps[stepIndex].progress = stepProgress;
        if (stepData) {
          updatedSteps[stepIndex].data = stepData;
          setScanData(prev => ({ ...prev, ...stepData }));
        }
        setScanSteps(updatedSteps);
        
        const overallProgress = (stepIndex / steps.length) * 100 + (stepProgress / steps.length);
        setProgress(Math.min(overallProgress, 100));
        setCurrentStep(`${updatedSteps[stepIndex].name} - ${stepProgress}%`);
      }
    };

    try {
      // Start progress simulation
      updateProgress(0, 10);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      updateProgress(0, 50, { domainDetails: { hostname: domain, status: 'resolving...' } });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(0, 100, { domainDetails: { hostname: domain, status: 'resolved' } });
      updateProgress(1, 10);
      
      const profileParam = scanProfile === 'custom' 
        ? `&profile=custom&config=${encodeURIComponent(JSON.stringify(customConfig))}` 
        : `&profile=${scanProfile}`;
      
      // Continue simulating progress while API call is in progress
      const progressInterval = setInterval(() => {
        const currentStepIndex = steps.findIndex(s => s.status === 'in-progress' || s.status === 'pending');
        if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
          const currentStep = steps[currentStepIndex];
          if (currentStep.status === 'pending') {
            updateProgress(currentStepIndex, 10);
          } else if (currentStep.progress < 90) {
            updateProgress(currentStepIndex, currentStep.progress + 10);
          }
        }
      }, 500);

      const res = await fetch(`/api/domain?domain=${encodeURIComponent(domain)}${profileParam}`);
      
      clearInterval(progressInterval);
      
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
      const data: ApiResponse = await res.json();
      
      // Update all steps as completed with actual data
      const finalSteps = steps.map((step, index) => {
        let stepData: any = {};
        switch(index) {
          case 0: stepData = { domainDetails: data.domainDetails, whois: data.whois }; break;
          case 1: stepData = { dns: data.dns, dnssec: data.dnssec, dnsAnalysis: data.dnsAnalysis }; break;
          case 2: stepData = { ssl: data.ssl, certificateAnalysis: data.certificateAnalysis }; break;
          case 3: stepData = { security: data.security }; break;
          case 4: stepData = { cookies: data.cookies }; break;
          case 5: stepData = { csp: data.csp, mixedContent: data.mixedContent, hsts: data.hsts }; break;
          case 6: stepData = { emailSecurity: data.emailSecurity }; break;
          case 7: stepData = { ipReputation: data.ipReputation }; break;
          case 8: stepData = { portScan: data.portScan }; break;
          case 9: stepData = { vulnerabilities: data.vulnerabilities, threats: data.threats }; break;
          case 10: stepData = { subdomains: data.subdomains, enhancedSubdomains: data.enhancedSubdomains }; break;
          case 11: stepData = { techStack: data.techStack }; break;
          case 12: stepData = { certificateTransparency: data.certificateTransparency }; break;
          case 13: stepData = { headersGrading: data.headersGrading }; break;
          case 14: stepData = { phishingDetection: data.phishingDetection }; break;
          case 15: stepData = { blacklistCheck: data.blacklistCheck }; break;
          case 16: stepData = { deepScan: data.deepScan }; break;
          case 17: stepData = { compliance: data.compliance }; break;
          case 18: stepData = { coreWebVitals: data.coreWebVitals }; break;
          case 19: stepData = { securityScore: data.securityScore, riskAssessment: data.riskAssessment }; break;
        }
        return {
          ...step,
          status: 'completed' as const,
          progress: 100,
          data: stepData
        };
      });
      
      setScanSteps(finalSteps);
      setScanData(data);
      setResults(data);
      setProgress(100);
      setCurrentStep('Scan completed successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to scan domain');
      setProgress(0);
      const errorSteps = steps.map(step => ({
        ...step,
        status: step.status === 'in-progress' ? 'error' as const : step.status
      }));
      setScanSteps(errorSteps);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'dns', label: 'DNS', icon: '🌐' },
    { id: 'ssl', label: 'SSL/TLS', icon: '🔐' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
    { id: 'advanced', label: 'Advanced', icon: '🔬' },
  ] as const;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 transition-colors duration-500">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient Mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.08),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_50%,rgba(6,182,212,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_50%,rgba(6,182,212,0.08),transparent_50%)]"></div>
          <div className="absolute bottom-0 left-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.08),transparent_50%)]"></div>
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400/25 dark:bg-cyan-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-400/30 dark:bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(71,85,105,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,85,105,0.15)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]"></div>
      </div>
      
      <div className="relative z-0">
        {/* Floating Header */}
        <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl px-6 py-4 transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl shadow-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent tracking-tight">
                    Domain Security Scanner
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
                    Enterprise Platform
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          {/* Hero Section - Impressive Design */}
          {!results && !loading && (
            <div className="text-center mb-16 relative">
              {/* Floating Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 dark:from-blue-500/5 dark:via-cyan-500/5 dark:to-teal-500/5 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-full shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Live Security Analysis</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-none">
                <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 dark:from-blue-400 dark:via-cyan-300 dark:to-teal-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Secure Your
                </span>
                <span className="block bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600 dark:from-teal-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]" style={{ animationDelay: '0.5s' }}>
                  Digital Domain
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                <span className="font-bold text-blue-600 dark:text-blue-400">100+</span> security checks in one powerful platform. 
                <br className="hidden sm:block" />
                <span className="text-slate-500 dark:text-slate-400">Enterprise-grade analysis at your fingertips.</span>
              </p>
              
              {/* Stats Bar */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {[
                  { label: 'Security Checks', value: '100+', color: 'blue' },
                  { label: 'Scan Categories', value: '12', color: 'cyan' },
                  { label: 'Response Time', value: '<60s', color: 'teal' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="group relative px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-2xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Search - Impressive Card */}
          {!loading && (
            <div className="relative mb-12">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 rounded-3xl blur-2xl opacity-30 dark:opacity-20 animate-pulse"></div>
              
              {/* Main Card */}
              <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                </div>
                
                <div className="relative z-10">
                  {!results && (
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-3">
                        <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                          Start Your Security Scan
                        </span>
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Enter any domain to get instant comprehensive security analysis
                      </p>
                    </div>
                  )}
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>
            </div>
          )}

          {/* Configuration & Features - Side by Side */}
          {!results && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Scan Profile - Compact */}
              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  <SectionCard title="Scan Profile" icon="⚙️" collapsible defaultExpanded={false}>
                    <ScanProfileSelector
                      selectedProfile={scanProfile}
                      onProfileChange={setScanProfile}
                      onCustomConfigChange={setCustomConfig}
                      customConfig={customConfig}
                    />
                  </SectionCard>
                </div>
              </div>

              {/* Scan Features - Expanded */}
              <div className="lg:col-span-8">
                <ScanFeatures />
              </div>
            </div>
          )}

          {/* Recent Scans */}
          {!results && !loading && (
            <div className="mb-8">
              <SectionCard title="Recent Scans" icon="📊">
                <Dashboard onDomainSelect={(domain) => {
                  setResults(null);
                  handleSearch(domain);
                }} />
              </SectionCard>
            </div>
          )}

          {/* Loading State - Prominent Display with Detailed Progress */}
          {loading && (
            <div className="space-y-8 animate-scale-in">
              <DetailedProgressIndicator
                progress={progress}
                currentStep={currentStep}
                steps={scanSteps}
                scanData={scanData}
              />
              
              {/* Skeleton Loader */}
              <SkeletonLoader />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-l-4 border-red-500 dark:border-red-400 p-5 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <ResultsDisplay 
              results={results} 
              sections={sections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          )}
        </main>

        {/* Modern Footer */}
        <footer className="relative mt-24 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-100/50 dark:via-slate-900/50 dark:to-slate-950/50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-lg"></div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Domain Security</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enterprise-grade security analysis platform with comprehensive scanning capabilities and real-time monitoring.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Capabilities</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {['DNS Security', 'SSL/TLS Analysis', 'Vulnerability Detection', 'Threat Intelligence'].map((item, i) => (
                    <li key={i} className="flex items-center group">
                      <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Information</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  © {new Date().getFullYear()} Domain Security Scanner
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Enterprise Security Analysis Platform
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
