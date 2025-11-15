/**
 * Mobile App Security
 * - App Store Analysis
 * - Deep Linking Analysis
 * - PWA (Progressive Web App) Checks
 */

import fetch from 'node-fetch';

export interface MobileAppSecurityResult {
  appStorePresence: {
    ios: boolean;
    android: boolean;
    iosUrl: string | null;
    androidUrl: string | null;
  };
  deepLinking: {
    universalLinks: boolean;
    appLinks: boolean;
    customSchemes: string[];
  };
  pwa: {
    isPWA: boolean;
    manifestPresent: boolean;
    serviceWorkerPresent: boolean;
    installable: boolean;
    offlineCapable: boolean;
  };
  recommendations: string[];
}

/**
 * Check mobile app security
 */
export async function checkMobileAppSecurity(hostname: string, html: string): Promise<MobileAppSecurityResult> {
  // Check for app store links
  const iosAppStorePattern = /(itunes\.apple\.com|apps\.apple\.com)[^"'\s]*/i;
  const androidPlayStorePattern = /(play\.google\.com|market\.android\.com)[^"'\s]*/i;

  const iosMatch = html.match(iosAppStorePattern);
  const androidMatch = html.match(androidPlayStorePattern);

  const iosUrl = iosMatch ? iosMatch[0] : null;
  const androidUrl = androidMatch ? androidMatch[0] : null;

  // Check for deep linking
  const universalLinksPattern = /apple-app-site-association/i;
  const appLinksPattern = /assetlinks\.json|android-app/i;
  const customSchemePattern = /(href|url)=["']([a-z][a-z0-9+.-]*):\/\//gi;

  const universalLinks = universalLinksPattern.test(html);
  const appLinks = appLinksPattern.test(html);

  const customSchemes: string[] = [];
  let match;
  while ((match = customSchemePattern.exec(html)) !== null) {
    const scheme = match[2].split(':')[0];
    if (scheme && !['http', 'https', 'mailto', 'tel'].includes(scheme)) {
      customSchemes.push(scheme);
    }
  }

  // Check for PWA
  const manifestPattern = /<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["']/i;
  const serviceWorkerPattern = /navigator\.serviceWorker|serviceWorker\.register/i;

  const manifestMatch = html.match(manifestPattern);
  const manifestPresent = !!manifestMatch;
  const serviceWorkerPresent = serviceWorkerPattern.test(html);

  let manifestData: any = null;
  if (manifestMatch) {
    try {
      const manifestUrl = manifestMatch[1].startsWith('http')
        ? manifestMatch[1]
        : `https://${hostname}${manifestMatch[1].startsWith('/') ? '' : '/'}${manifestMatch[1]}`;
      const response = await fetch(manifestUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        manifestData = await response.json();
      }
    } catch (error) {
      // Manifest not accessible
    }
  }

  const isPWA = manifestPresent && serviceWorkerPresent;
  const installable = isPWA && manifestData && manifestData.icons && manifestData.icons.length > 0;
  const offlineCapable = serviceWorkerPresent;

  const recommendations: string[] = [];
  if (!iosUrl && !androidUrl) {
    recommendations.push('Consider creating mobile apps for better user experience');
  }
  if (!universalLinks && !appLinks) {
    recommendations.push('Implement deep linking for mobile apps');
  }
  if (!isPWA) {
    recommendations.push('Consider implementing PWA for offline capabilities');
  }
  if (isPWA && !offlineCapable) {
    recommendations.push('Add service worker for offline functionality');
  }

  return {
    appStorePresence: {
      ios: !!iosUrl,
      android: !!androidUrl,
      iosUrl,
      androidUrl,
    },
    deepLinking: {
      universalLinks,
      appLinks,
      customSchemes: [...new Set(customSchemes)],
    },
    pwa: {
      isPWA,
      manifestPresent,
      serviceWorkerPresent,
      installable: !!installable,
      offlineCapable,
    },
    recommendations,
  };
}

