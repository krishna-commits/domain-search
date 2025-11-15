'use client';
import React, { useState } from 'react';

interface ShareResultsProps {
  scanId?: string;
  domain: string;
  onShare?: (method: string) => void;
}

export default function ShareResults({ scanId, domain, onShare }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = scanId
    ? `${window.location.origin}/scan/${scanId}`
    : window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onShare) onShare('copy');
  };

  const handleShare = async (method: 'email' | 'twitter' | 'linkedin') => {
    const title = `Domain Security Scan for ${domain}`;
    const text = `Check out this domain security scan for ${domain}`;
    const url = shareUrl;

    switch (method) {
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
    }
    if (onShare) onShare(method);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Share Results</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Share this scan with others</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Share
            </button>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-10 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleShare('email');
                    setShowShareMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  📧 Email
                </button>
                <button
                  onClick={() => {
                    handleShare('twitter');
                    setShowShareMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  🐦 Twitter
                </button>
                <button
                  onClick={() => {
                    handleShare('linkedin');
                    setShowShareMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  💼 LinkedIn
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
        {shareUrl}
      </div>
    </div>
  );
}

