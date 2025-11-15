'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsDashboardProps {
  scanHistory?: Array<{
    date: string;
    securityScore: number;
    riskLevel: string;
    vulnerabilities: number;
  }>;
  currentScan?: {
    securityScore?: number;
    riskAssessment?: { riskLevel: string };
    vulnerabilities?: any[];
    compliance?: any;
    uptimeMonitoring?: any;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard({ scanHistory = [], currentScan }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Prepare data for charts
  const securityScoreData = scanHistory.map(scan => ({
    date: new Date(scan.date).toLocaleDateString(),
    score: scan.securityScore,
  }));

  const riskDistribution = scanHistory.reduce((acc, scan) => {
    acc[scan.riskLevel] = (acc[scan.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskDistributionData = Object.entries(riskDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const vulnerabilityTrend = scanHistory.map(scan => ({
    date: new Date(scan.date).toLocaleDateString(),
    vulnerabilities: scan.vulnerabilities,
  }));

  // Compliance data
  const complianceData = currentScan?.compliance ? [
    { name: 'GDPR', score: currentScan.compliance.gdpr?.score || 0 },
    { name: 'PCI-DSS', score: currentScan.compliance.pciDss?.score || 0 },
    { name: 'HIPAA', score: currentScan.compliance.hipaa?.score || 0 },
  ] : [];

  // Uptime data
  const uptimeData = currentScan?.uptimeMonitoring ? [
    { name: 'Uptime', value: currentScan.uptimeMonitoring.uptimePercentage },
    { name: 'Downtime', value: 100 - currentScan.uptimeMonitoring.uptimePercentage },
  ] : [];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
        Analytics Dashboard
      </h2>

      <div className="px-4 py-5 sm:p-6">
        {/* Tabs */}
        <div className="border-b dark:border-gray-700 mb-4">
          <nav className="flex space-x-4 overflow-x-auto">
            {['overview', 'security', 'compliance', 'uptime', 'trends'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Security Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentScan?.securityScore || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</p>
                <p className={`text-3xl font-bold capitalize ${
                  currentScan?.riskAssessment?.riskLevel === 'critical' ? 'text-red-600 dark:text-red-400' :
                  currentScan?.riskAssessment?.riskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' :
                  currentScan?.riskAssessment?.riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {currentScan?.riskAssessment?.riskLevel || 'N/A'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vulnerabilities</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentScan?.vulnerabilities?.length || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uptime</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentScan?.uptimeMonitoring?.uptimePercentage || 0}%
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {securityScoreData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Score Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={securityScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {riskDistributionData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk Level Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {vulnerabilityTrend.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vulnerability Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vulnerabilityTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="vulnerabilities" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {complianceData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Compliance Scores</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={complianceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {currentScan?.compliance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">GDPR</h4>
                    <p className={`text-2xl font-bold ${
                      currentScan.compliance.gdpr?.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {currentScan.compliance.gdpr?.score || 0}/100
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentScan.compliance.gdpr?.passed ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">PCI-DSS</h4>
                    <p className={`text-2xl font-bold ${
                      currentScan.compliance.pciDss?.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {currentScan.compliance.pciDss?.score || 0}/100
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentScan.compliance.pciDss?.passed ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">HIPAA</h4>
                    <p className={`text-2xl font-bold ${
                      currentScan.compliance.hipaa?.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {currentScan.compliance.hipaa?.score || 0}/100
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentScan.compliance.hipaa?.passed ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'uptime' && (
            <div className="space-y-6">
              {uptimeData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Uptime Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={uptimeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {uptimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {currentScan?.uptimeMonitoring && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentScan.uptimeMonitoring.uptimePercentage}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentScan.uptimeMonitoring.averageResponseTime}ms
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Checks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentScan.uptimeMonitoring.totalChecks}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Status</p>
                    <p className={`text-2xl font-bold capitalize ${
                      currentScan.uptimeMonitoring.lastStatus === 'up' ? 'text-green-600 dark:text-green-400' :
                      currentScan.uptimeMonitoring.lastStatus === 'down' ? 'text-red-600 dark:text-red-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {currentScan.uptimeMonitoring.lastStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              {securityScoreData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Score Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={securityScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

