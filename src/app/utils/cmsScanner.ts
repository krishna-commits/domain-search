/**
 * CMS Scanner
 * - WordPress Scanner
 * - Drupal Scanner
 * - Joomla Scanner
 * - SharePoint Scanner
 */

import fetch from 'node-fetch';

export interface CMSScannerResult {
  wordpress: WordPressResult | null;
  drupal: DrupalResult | null;
  joomla: JoomlaResult | null;
  sharepoint: SharePointResult | null;
}

export interface WordPressResult {
  detected: boolean;
  version: string | null;
  plugins: string[];
  themes: string[];
  vulnerabilities: string[];
  securityIssues: string[];
  recommendations: string[];
}

export interface DrupalResult {
  detected: boolean;
  version: string | null;
  modules: string[];
  vulnerabilities: string[];
  securityIssues: string[];
  recommendations: string[];
}

export interface JoomlaResult {
  detected: boolean;
  version: string | null;
  extensions: string[];
  vulnerabilities: string[];
  securityIssues: string[];
  recommendations: string[];
}

export interface SharePointResult {
  detected: boolean;
  version: string | null;
  features: string[];
  vulnerabilities: string[];
  securityIssues: string[];
  recommendations: string[];
}

/**
 * Scan for WordPress
 */
export async function scanWordPress(hostname: string, html: string, headers: Headers): Promise<WordPressResult> {
  const detected = /wp-content|wp-includes|wordpress|wp-json/i.test(html) ||
                   headers.get('X-Powered-By')?.toLowerCase().includes('wordpress') ||
                   /wp-admin/i.test(html);

  if (!detected) {
    return {
      detected: false,
      version: null,
      plugins: [],
      themes: [],
      vulnerabilities: [],
      securityIssues: [],
      recommendations: [],
    };
  }

  // Extract version
  const versionMatch = html.match(/wp-content\/themes\/[^\/]+\/style\.css\?ver=([\d.]+)/i) ||
                      html.match(/WordPress ([\d.]+)/i) ||
                      html.match(/generator.*WordPress ([\d.]+)/i);
  const version = versionMatch ? versionMatch[1] : null;

  // Extract plugins
  const pluginMatches = html.matchAll(/wp-content\/plugins\/([^\/]+)/gi);
  const plugins = Array.from(pluginMatches, m => m[1]).filter((v, i, a) => a.indexOf(v) === i);

  // Extract themes
  const themeMatches = html.matchAll(/wp-content\/themes\/([^\/]+)/gi);
  const themes = Array.from(themeMatches, m => m[1]).filter((v, i, a) => a.indexOf(v) === i);

  const vulnerabilities: string[] = [];
  const securityIssues: string[] = [];
  const recommendations: string[] = [];

  // Check for common security issues
  if (html.includes('wp-config.php')) {
    securityIssues.push('wp-config.php may be exposed');
  }

  if (html.includes('wp-admin') && !html.includes('login')) {
    securityIssues.push('Admin area may be accessible');
  }

  if (version) {
    recommendations.push(`WordPress version ${version} detected - ensure it's up to date`);
  }

  if (plugins.length > 0) {
    recommendations.push(`Found ${plugins.length} plugins - ensure all are updated`);
  }

  return {
    detected: true,
    version,
    plugins,
    themes,
    vulnerabilities,
    securityIssues,
    recommendations,
  };
}

/**
 * Scan for Drupal
 */
export async function scanDrupal(hostname: string, html: string, headers: Headers): Promise<DrupalResult> {
  const detected = /drupal|sites\/all|sites\/default|misc\/drupal/i.test(html) ||
                   headers.get('X-Generator')?.toLowerCase().includes('drupal') ||
                   headers.get('X-Drupal-Cache') !== null;

  if (!detected) {
    return {
      detected: false,
      version: null,
      modules: [],
      vulnerabilities: [],
      securityIssues: [],
      recommendations: [],
    };
  }

  // Extract version
  const versionMatch = html.match(/Drupal ([\d.]+)/i) ||
                      html.match(/generator.*Drupal ([\d.]+)/i);
  const version = versionMatch ? versionMatch[1] : null;

  // Extract modules
  const moduleMatches = html.matchAll(/sites\/all\/modules\/([^\/]+)/gi);
  const modules = Array.from(moduleMatches, m => m[1]).filter((v, i, a) => a.indexOf(v) === i);

  const vulnerabilities: string[] = [];
  const securityIssues: string[] = [];
  const recommendations: string[] = [];

  if (html.includes('sites/default/files')) {
    securityIssues.push('Default files directory may be exposed');
  }

  if (version) {
    recommendations.push(`Drupal version ${version} detected - ensure it's up to date`);
  }

  return {
    detected: true,
    version,
    modules,
    vulnerabilities,
    securityIssues,
    recommendations,
  };
}

/**
 * Scan for Joomla
 */
export async function scanJoomla(hostname: string, html: string, headers: Headers): Promise<JoomlaResult> {
  const detected = /joomla|components\/com_|administrator\/index\.php/i.test(html) ||
                   headers.get('X-Powered-By')?.toLowerCase().includes('joomla');

  if (!detected) {
    return {
      detected: false,
      version: null,
      extensions: [],
      vulnerabilities: [],
      securityIssues: [],
      recommendations: [],
    };
  }

  // Extract version
  const versionMatch = html.match(/Joomla! ([\d.]+)/i) ||
                      html.match(/generator.*Joomla ([\d.]+)/i);
  const version = versionMatch ? versionMatch[1] : null;

  // Extract extensions
  const extensionMatches = html.matchAll(/components\/com_([^\/]+)/gi);
  const extensions = Array.from(extensionMatches, m => m[1]).filter((v, i, a) => a.indexOf(v) === i);

  const vulnerabilities: string[] = [];
  const securityIssues: string[] = [];
  const recommendations: string[] = [];

  if (html.includes('administrator')) {
    securityIssues.push('Administrator area may be accessible');
  }

  if (version) {
    recommendations.push(`Joomla version ${version} detected - ensure it's up to date`);
  }

  return {
    detected: true,
    version,
    extensions,
    vulnerabilities,
    securityIssues,
    recommendations,
  };
}

/**
 * Scan for SharePoint
 */
export async function scanSharePoint(hostname: string, html: string, headers: Headers): Promise<SharePointResult> {
  const detected = /sharepoint|_layouts|_vti_bin|MicrosoftSharePoint/i.test(html) ||
                   headers.get('MicrosoftSharePointTeamServices') !== null ||
                   headers.get('X-SharePointHealthScore') !== null;

  if (!detected) {
    return {
      detected: false,
      version: null,
      features: [],
      vulnerabilities: [],
      securityIssues: [],
      recommendations: [],
    };
  }

  // Extract version
  const headerVersion = headers.get('MicrosoftSharePointTeamServices');
  const htmlVersionMatch = html.match(/SharePoint ([\d.]+)/i);
  const version = headerVersion || (htmlVersionMatch ? htmlVersionMatch[1] : null);

  // Extract features
  const features: string[] = [];
  if (html.includes('_layouts')) features.push('Layouts');
  if (html.includes('_vti_bin')) features.push('VTI Bin');
  if (html.includes('Lists')) features.push('Lists');
  if (html.includes('DocumentLibrary')) features.push('Document Library');

  const vulnerabilities: string[] = [];
  const securityIssues: string[] = [];
  const recommendations: string[] = [];

  if (html.includes('_vti_bin')) {
    securityIssues.push('VTI Bin may expose sensitive information');
  }

  if (version) {
    recommendations.push(`SharePoint version ${version} detected - ensure it's up to date`);
  }

  return {
    detected: true,
    version,
    features,
    vulnerabilities,
    securityIssues,
    recommendations,
  };
}

/**
 * Scan all CMS platforms
 */
export async function scanCMS(hostname: string, html: string, headers: Headers): Promise<CMSScannerResult> {
  const [wordpress, drupal, joomla, sharepoint] = await Promise.all([
    scanWordPress(hostname, html, headers),
    scanDrupal(hostname, html, headers),
    scanJoomla(hostname, html, headers),
    scanSharePoint(hostname, html, headers),
  ]);

  return {
    wordpress,
    drupal,
    joomla,
    sharepoint,
  };
}

