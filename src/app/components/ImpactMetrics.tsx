import React from 'react';

type Metric = {
  value: string | number;
  label: string;
  description: string;
};

const metrics: Metric[] = [
  { value: 12, label: 'Research Publications', description: 'Peer-reviewed works' },
  { value: 4, label: 'Projects', description: 'Production solutions' },
  { value: 7, label: 'Certifications', description: 'Professional credentials' },
  { value: 0, label: 'Citations', description: 'Research impact' },
];

export default function ImpactMetrics() {
  return (
    <section className="relative">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
          <span className="gradient-text-rainbow">Impact Metrics</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Quantifiable achievements across research, engineering, and professional development
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="relative group rounded-2xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 rounded-2xl blur transition-opacity" />
            <div className="relative">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {m.value}
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                {m.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {m.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


