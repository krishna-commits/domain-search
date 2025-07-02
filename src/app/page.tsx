'use client';
import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Spinner from './components/Spinner';
import DomainOverview from './components/DomainOverview';
import RegistrarInfo from './components/RegistrarInfo';
import DNSSection from './components/DNSSection';
import SecuritySection from './components/SecuritySection';
import TechStackSection from './components/TechStackSection';
import SubdomainsSection from './components/SubdomainsSection';
import VulnerabilitySection from './components/VulnerabilitySection';
import SSLInfo from './components/SSLInfo';
import LinkHealth from './components/LinkHealth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  techStack: any;
  subdomains: string[];
  threats: any;
  vulnerabilities: any[];
  brokenLinks: any[];
  ipServices: any[];
  rawDns: any;
  emails: string[];
};

export default function Home() {
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (domain: string) => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch(`/api/domain?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      const data: ApiResponse = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Domain Security Scanner</h1>
          <p className="mt-1 text-gray-500">
            Comprehensive domain analysis including DNS, security, vulnerabilities, and more
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6">
          <SearchBar onSearch={handleSearch} />
        </div>
        {loading && <Spinner />}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 max-w-4xl mx-auto">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {results && (
          <>
            <button
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={async () => {
                const element = document.getElementById('scan-report');
                if (element) {
                  const canvas = await html2canvas(element);
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt',
                    format: 'a4',
                  });
                  const pageWidth = pdf.internal.pageSize.getWidth();
                  const pageHeight = pdf.internal.pageSize.getHeight();
                  const imgProps = pdf.getImageProperties(imgData);
                  const pdfWidth = pageWidth;
                  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                  pdf.save('domain-scan-report.pdf');
                }
              }}
            >
              Download PDF Report
            </button>
            <div id="scan-report" className="space-y-6">
              <DomainOverview details={results.domainDetails} ssl={results.ssl} emails={results.emails} />
              <RegistrarInfo whois={results.whois} />
              <DNSSection dns={results.dns} dnssec={results.dnssec} rawDns={results.rawDns} />
              <SSLInfo ssl={results.ssl} vulnerabilities={results.vulnerabilities} brokenLinks={results.brokenLinks} />
              <SecuritySection 
                headers={results.security.headers} 
                protocols={results.security.protocols} 
              />
              <TechStackSection techStack={results.techStack} />
              <SubdomainsSection subdomains={results.subdomains} />
              <VulnerabilitySection 
                threats={results.threats} 
                vulnerabilities={results.vulnerabilities} 
              />
              <LinkHealth brokenLinks={results.brokenLinks} />
            </div>
          </>
        )}
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Domain Security Scanner &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}