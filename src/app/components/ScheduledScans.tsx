'use client';
import React, { useState, useEffect } from 'react';

export default function ScheduledScans() {
  const [domain, setDomain] = useState('');
  const [schedule, setSchedule] = useState('0 2 * * *'); // Daily at 2 AM
  const [profile, setProfile] = useState('deep');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const response = await fetch('/api/scheduled-scans');
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
      }
    } catch (error) {
      console.error('Failed to load scheduled scans:', error);
    }
  };

  const handleCreate = async () => {
    if (!domain || !schedule) {
      alert('Please enter domain and schedule');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/scheduled-scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          schedule,
          profile,
          webhookUrl: webhookUrl || undefined,
          enabled: true,
        }),
      });

      if (response.ok) {
        await loadScans();
        setDomain('');
        setWebhookUrl('');
        setSchedule('0 2 * * *');
      }
    } catch (error) {
      console.error('Failed to create scheduled scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-scans?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadScans();
      }
    } catch (error) {
      console.error('Failed to delete scheduled scan:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Scheduled Scans</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule (Cron)
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="0 2 * * *"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: minute hour day month weekday (e.g., "0 2 * * *" = daily at 2 AM)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
          >
            <option value="quick">Quick Scan</option>
            <option value="deep">Deep Scan</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Webhook URL (optional)
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-webhook-url.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !domain || !schedule}
          className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Schedule Scan'}
        </button>
      </div>

      {scans.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Scheduled Scans</h4>
          <div className="space-y-2">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{scan.domain}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Schedule: {scan.schedule}
                    {scan.nextRun && ` • Next run: ${new Date(scan.nextRun).toLocaleString()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(scan.id)}
                  className="px-3 py-1 text-sm bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

