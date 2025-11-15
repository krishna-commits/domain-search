import { Headers } from 'node-fetch';

/**
 * Advanced technology fingerprinting and detection
 */
export function advancedTechnologyFingerprinting(headers: Headers, html: string, scripts: string[]) {
  const fingerprint = {
    server: {
      name: null as string | null,
      version: null as string | null,
      technologies: [] as string[],
    },
    cms: {
      name: null as string | null,
      version: null as string | null,
      plugins: [] as string[],
    },
    frameworks: [] as Array<{ name: string; version: string | null }>,
    languages: [] as string[],
    databases: [] as string[],
    cdn: null as string | null,
    analytics: [] as Array<{ name: string; id: string | null }>,
    advertising: [] as string[],
    widgets: [] as string[],
    libraries: [] as Array<{ name: string; version: string | null }>,
    security: [] as string[],
    other: [] as string[],
  };

  // Server detection
  const server = headers.get('server') || headers.get('x-powered-by') || '';
  if (server) {
    const serverMatch = server.match(/([a-zA-Z0-9]+)\/?([0-9.]+)?/i);
    if (serverMatch) {
      fingerprint.server.name = serverMatch[1];
      fingerprint.server.version = serverMatch[2] || null;
    }
  }

  // Detect server technologies
  if (/nginx/i.test(server)) fingerprint.server.technologies.push('Nginx');
  if (/apache/i.test(server)) fingerprint.server.technologies.push('Apache');
  if (/iis/i.test(server)) fingerprint.server.technologies.push('IIS');
  if (/cloudflare/i.test(server)) {
    fingerprint.server.technologies.push('Cloudflare');
    fingerprint.cdn = 'Cloudflare';
  }

  // CMS Detection
  if (/wp-content|wp-includes|wp-admin|wordpress/i.test(html)) {
    fingerprint.cms.name = 'WordPress';
    const wpVersion = html.match(/wp version ["']?([0-9.]+)["']?/i);
    if (wpVersion) fingerprint.cms.version = wpVersion[1];
    
    // WordPress plugins
    const plugins = html.match(/wp-content\/plugins\/([a-zA-Z0-9_-]+)/gi);
    if (plugins) {
      plugins.forEach(plugin => {
        const pluginName = plugin.match(/plugins\/([a-zA-Z0-9_-]+)/i)?.[1];
        if (pluginName) fingerprint.cms.plugins.push(pluginName);
      });
    }
  }

  if (/drupal/i.test(html)) {
    fingerprint.cms.name = 'Drupal';
    const drupalVersion = html.match(/drupal version ["']?([0-9.]+)["']?/i);
    if (drupalVersion) fingerprint.cms.version = drupalVersion[1];
  }

  if (/joomla/i.test(html)) {
    fingerprint.cms.name = 'Joomla';
    const joomlaVersion = html.match(/joomla version ["']?([0-9.]+)["']?/i);
    if (joomlaVersion) fingerprint.cms.version = joomlaVersion[1];
  }

  if (/shopify/i.test(html)) {
    fingerprint.cms.name = 'Shopify';
  }

  if (/squarespace/i.test(html)) {
    fingerprint.cms.name = 'Squarespace';
  }

  if (/wix\.com/i.test(html)) {
    fingerprint.cms.name = 'Wix';
  }

  // Framework Detection
  const frameworkPatterns = [
    { name: 'React', pattern: /react[\/-]?([0-9.]+)?/i, versionPattern: /react[\/-]?([0-9.]+)/i },
    { name: 'Vue.js', pattern: /vue[\/-]?([0-9.]+)?/i, versionPattern: /vue[\/-]?([0-9.]+)/i },
    { name: 'Angular', pattern: /angular[\/-]?([0-9.]+)?/i, versionPattern: /angular[\/-]?([0-9.]+)/i },
    { name: 'Next.js', pattern: /next[\/-]?js[\/-]?([0-9.]+)?/i, versionPattern: /next[\/-]?js[\/-]?([0-9.]+)/i },
    { name: 'Nuxt.js', pattern: /nuxt[\/-]?js[\/-]?([0-9.]+)?/i, versionPattern: /nuxt[\/-]?js[\/-]?([0-9.]+)/i },
    { name: 'Svelte', pattern: /svelte[\/-]?([0-9.]+)?/i, versionPattern: /svelte[\/-]?([0-9.]+)/i },
    { name: 'Ember.js', pattern: /ember[\/-]?js[\/-]?([0-9.]+)?/i, versionPattern: /ember[\/-]?js[\/-]?([0-9.]+)/i },
    { name: 'Backbone.js', pattern: /backbone[\/-]?js[\/-]?([0-9.]+)?/i, versionPattern: /backbone[\/-]?js[\/-]?([0-9.]+)/i },
  ];

  frameworkPatterns.forEach(({ name, pattern, versionPattern }) => {
    if (pattern.test(html) || scripts.some(s => pattern.test(s))) {
      const versionMatch = html.match(versionPattern) || scripts.find(s => versionPattern.test(s))?.match(versionPattern);
      fingerprint.frameworks.push({
        name,
        version: versionMatch ? versionMatch[1] : null,
      });
    }
  });

  // Language Detection
  if (/\.php/i.test(html) || /php/i.test(server)) fingerprint.languages.push('PHP');
  if (/\.aspx?/i.test(html) || /asp/i.test(server)) fingerprint.languages.push('ASP.NET');
  if (/\.jsp/i.test(html)) fingerprint.languages.push('Java');
  if (/\.py/i.test(html) || /python/i.test(server)) fingerprint.languages.push('Python');
  if (/\.rb/i.test(html) || /ruby/i.test(server)) fingerprint.languages.push('Ruby');
  if (/\.go/i.test(html) || /golang/i.test(server)) fingerprint.languages.push('Go');
  if (/node/i.test(server)) fingerprint.languages.push('Node.js');

  // Database Detection
  if (/mysql|mariadb/i.test(html) || /mysql/i.test(server)) fingerprint.databases.push('MySQL');
  if (/postgresql|postgres/i.test(html) || /postgres/i.test(server)) fingerprint.databases.push('PostgreSQL');
  if (/mongodb/i.test(html) || /mongo/i.test(server)) fingerprint.databases.push('MongoDB');
  if (/redis/i.test(html) || /redis/i.test(server)) fingerprint.databases.push('Redis');
  if (/sqlite/i.test(html)) fingerprint.databases.push('SQLite');

  // CDN Detection
  if (/cloudflare/i.test(server) || /cf-ray/i.test(headers.get('cf-ray') || '')) {
    fingerprint.cdn = 'Cloudflare';
  }
  if (/akamai/i.test(server) || /akamai/i.test(html)) {
    fingerprint.cdn = 'Akamai';
  }
  if (/fastly/i.test(server) || /fastly/i.test(html)) {
    fingerprint.cdn = 'Fastly';
  }
  if (/amazonaws|cloudfront/i.test(html)) {
    fingerprint.cdn = 'Amazon CloudFront';
  }

  // Analytics Detection
  const analyticsPatterns = [
    { name: 'Google Analytics', pattern: /google-analytics\.com|gtag|ga\(/i, idPattern: /UA-[0-9]+-[0-9]+|G-[A-Z0-9]+/i },
    { name: 'Google Tag Manager', pattern: /googletagmanager\.com/i, idPattern: /GTM-[A-Z0-9]+/i },
    { name: 'Facebook Pixel', pattern: /facebook\.net\/connect|fbq\(/i, idPattern: /[0-9]{15,16}/i },
    { name: 'Hotjar', pattern: /hotjar\.com/i, idPattern: /[0-9]{7,8}/i },
    { name: 'Segment', pattern: /segment\.com/i, idPattern: null },
    { name: 'Mixpanel', pattern: /mixpanel\.com/i, idPattern: null },
    { name: 'Amplitude', pattern: /amplitude\.com/i, idPattern: null },
  ];

  analyticsPatterns.forEach(({ name, pattern, idPattern }) => {
    if (pattern.test(html) || scripts.some(s => pattern.test(s))) {
      let id = null;
      if (idPattern) {
        const idMatch = html.match(idPattern) || scripts.find(s => idPattern.test(s))?.match(idPattern);
        id = idMatch ? idMatch[0] : null;
      }
      fingerprint.analytics.push({ name, id });
    }
  });

  // Advertising Detection
  if (/googleadservices|doubleclick|adsense/i.test(html)) fingerprint.advertising.push('Google Ads');
  if (/amazon-adsystem/i.test(html)) fingerprint.advertising.push('Amazon Ads');
  if (/bing\.com\/ads/i.test(html)) fingerprint.advertising.push('Microsoft Advertising');

  // Library Detection
  const libraryPatterns = [
    { name: 'jQuery', pattern: /jquery[\/-]?([0-9.]+)?/i, versionPattern: /jquery[\/-]?([0-9.]+)/i },
    { name: 'Bootstrap', pattern: /bootstrap[\/-]?([0-9.]+)?/i, versionPattern: /bootstrap[\/-]?([0-9.]+)/i },
    { name: 'Font Awesome', pattern: /font-?awesome/i, versionPattern: /font-?awesome[\/-]?([0-9.]+)/i },
    { name: 'Lodash', pattern: /lodash/i, versionPattern: /lodash[\/-]?([0-9.]+)/i },
    { name: 'Moment.js', pattern: /moment\.js/i, versionPattern: /moment[\/-]?([0-9.]+)/i },
  ];

  libraryPatterns.forEach(({ name, pattern, versionPattern }) => {
    if (pattern.test(html) || scripts.some(s => pattern.test(s))) {
      const versionMatch = html.match(versionPattern) || scripts.find(s => versionPattern.test(s))?.match(versionPattern);
      fingerprint.libraries.push({
        name,
        version: versionMatch ? versionMatch[1] : null,
      });
    }
  });

  // Security Technologies
  if (/cloudflare/i.test(server)) fingerprint.security.push('Cloudflare WAF');
  if (/sucuri/i.test(html) || /sucuri/i.test(server)) fingerprint.security.push('Sucuri');
  if (/incapsula/i.test(html) || /incapsula/i.test(server)) fingerprint.security.push('Imperva Incapsula');
  if (/akamai/i.test(server)) fingerprint.security.push('Akamai WAF');

  return fingerprint;
}

