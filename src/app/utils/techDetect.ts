// Detect technology stack
export function detectTechStack(headers: Headers, html: string): any {
  const stack: any = {
    server: headers.get('server') || null,
    poweredBy: headers.get('x-powered-by') || null,
    framework: null,
    cms: null,
    jsLibraries: [],
    analytics: [],
    cdn: null,
    meta: {},
    others: []
  };

  // Meta tags
  const metaMatches = html.match(/<meta[^>]+>/gi) || [];
  metaMatches.forEach(meta => {
    const nameMatch = meta.match(/name=["']?([^"'> ]+)/i);
    const contentMatch = meta.match(/content=["']?([^"'>]+)/i);
    if (nameMatch && contentMatch) {
      stack.meta[nameMatch[1].toLowerCase()] = contentMatch[1];
      // Detect generator/framework
      if (nameMatch[1].toLowerCase() === 'generator') {
        stack.framework = contentMatch[1];
      }
    }
  });

  // CMS detection
  if (/wp-content|wp-includes|wordpress/i.test(html)) stack.cms = 'WordPress';
  if (/drupal/i.test(html)) stack.cms = 'Drupal';
  if (/joomla/i.test(html)) stack.cms = 'Joomla';
  if (/shopify/i.test(html)) stack.cms = 'Shopify';
  if (/squarespace/i.test(html)) stack.cms = 'Squarespace';
  if (/wix\.com/i.test(html)) stack.cms = 'Wix';

  // JS libraries
  if (/jquery/i.test(html)) stack.jsLibraries.push('jQuery');
  if (/react/i.test(html)) stack.jsLibraries.push('React');
  if (/angular/i.test(html)) stack.jsLibraries.push('Angular');
  if (/vue/i.test(html)) stack.jsLibraries.push('Vue.js');
  if (/ember/i.test(html)) stack.jsLibraries.push('Ember.js');
  if (/next[.-]js/i.test(html)) stack.jsLibraries.push('Next.js');
  if (/nuxt[.-]js/i.test(html)) stack.jsLibraries.push('Nuxt.js');
  if (/svelte/i.test(html)) stack.jsLibraries.push('Svelte');

  // Analytics
  if (/www.googletagmanager.com|google-analytics.com/i.test(html)) stack.analytics.push('Google Analytics');
  if (/www.googleadservices.com/i.test(html)) stack.analytics.push('Google Ads');
  if (/connect.facebook.net/i.test(html)) stack.analytics.push('Facebook Pixel');
  if (/static.hotjar.com/i.test(html)) stack.analytics.push('Hotjar');
  if (/cdn.segment.com/i.test(html)) stack.analytics.push('Segment');

  // CDN detection
  if (/cloudflare/i.test(headers.get('server') || '')) stack.cdn = 'Cloudflare';
  if (/akamai/i.test(headers.get('server') || '')) stack.cdn = 'Akamai';
  if (/fastly/i.test(headers.get('server') || '')) stack.cdn = 'Fastly';

  // Others: Add more as needed

  return stack;
}