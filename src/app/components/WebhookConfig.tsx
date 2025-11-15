'use client';
import React, { useState } from 'react';

interface WebhookConfigProps {
  onWebhookConfigured?: (url: string) => void;
}

export default function WebhookConfig({ onWebhookConfigured }: WebhookConfigProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  const handleTest = async () => {
    if (!webhookUrl) return;

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/webhook?url=${encodeURIComponent(webhookUrl)}`);
      const data = await response.json();

      setTestResult({
        success: data.success,
        message: data.message || data.error || 'Test completed',
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to test webhook',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onWebhookConfigured) {
        onWebhookConfigured(webhookUrl);
      }
    }
  };

  React.useEffect(() => {
    const savedUrl = localStorage.getItem('webhookUrl');
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Webhook Configuration</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Configure a webhook URL to receive notifications when scans complete
      </p>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-webhook-url.com/endpoint"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
          />
          <button
            onClick={handleTest}
            disabled={!webhookUrl || testing}
            className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? 'Testing...' : 'Test'}
          </button>
          <button
            onClick={handleSave}
            disabled={!webhookUrl}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg ${
              testResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <p
              className={`text-sm ${
                testResult.success
                  ? 'text-green-800 dark:text-green-400'
                  : 'text-red-800 dark:text-red-400'
              }`}
            >
              {testResult.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

