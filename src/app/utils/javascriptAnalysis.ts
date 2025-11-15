/**
 * JavaScript analysis and detection
 */
export function analyzeJavaScript(html: string, scripts: string[]) {
  const analysis = {
    totalScripts: scripts.length,
    inlineScripts: 0,
    externalScripts: 0,
    libraries: [] as Array<{ name: string; version: string | null; type: string }>,
    frameworks: [] as Array<{ name: string; version: string | null }>,
    security: {
      issues: [] as string[],
      vulnerabilities: [] as string[],
      exposedSecrets: [] as string[],
    },
    performance: {
      blocking: 0,
      async: 0,
      defer: 0,
      issues: [] as string[],
    },
    recommendations: [] as string[],
  };

  // Analyze inline scripts
  const inlineScriptRegex = /<script[^>]*>(.*?)<\/script>/gis;
  let match;
  while ((match = inlineScriptRegex.exec(html)) !== null) {
    if (!match[0].includes('src=')) {
      analysis.inlineScripts++;
      const scriptContent = match[1];

      // Check for security issues
      if (/eval\(/i.test(scriptContent)) {
        analysis.security.issues.push('Use of eval() detected - security risk');
      }
      if (/innerHTML\s*=/i.test(scriptContent)) {
        analysis.security.issues.push('Use of innerHTML detected - potential XSS risk');
      }
      if (/document\.write\(/i.test(scriptContent)) {
        analysis.security.issues.push('Use of document.write() detected - performance issue');
      }

      // Check for exposed secrets
      const secretPatterns = [
        { pattern: /api[_-]?key["']?\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,})["']?/gi, type: 'API Key' },
        { pattern: /secret["']?\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,})["']?/gi, type: 'Secret' },
        { pattern: /token["']?\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,})["']?/gi, type: 'Token' },
        { pattern: /password["']?\s*[:=]\s*["']?([^"']+)["']?/gi, type: 'Password' },
      ];

      secretPatterns.forEach(({ pattern, type }) => {
        const secretMatch = scriptContent.match(pattern);
        if (secretMatch) {
          analysis.security.exposedSecrets.push(`${type} found in inline script`);
        }
      });
    } else {
      analysis.externalScripts++;
      
      // Check for async/defer
      if (match[0].includes('async')) {
        analysis.performance.async++;
      } else if (match[0].includes('defer')) {
        analysis.performance.defer++;
      } else {
        analysis.performance.blocking++;
      }
    }
  }

  // Detect libraries and frameworks
  const libraryPatterns = [
    { name: 'jQuery', pattern: /jquery[\/-]?([0-9.]+)?/i, versionPattern: /jquery[\/-]?([0-9.]+)/i },
    { name: 'React', pattern: /react[\/-]?([0-9.]+)?/i, versionPattern: /react[\/-]?([0-9.]+)/i },
    { name: 'Vue.js', pattern: /vue[\/-]?([0-9.]+)?/i, versionPattern: /vue[\/-]?([0-9.]+)/i },
    { name: 'Angular', pattern: /angular[\/-]?([0-9.]+)?/i, versionPattern: /angular[\/-]?([0-9.]+)/i },
    { name: 'Bootstrap', pattern: /bootstrap[\/-]?([0-9.]+)?/i, versionPattern: /bootstrap[\/-]?([0-9.]+)/i },
    { name: 'Lodash', pattern: /lodash/i, versionPattern: /lodash[\/-]?([0-9.]+)/i },
    { name: 'Moment.js', pattern: /moment\.js/i, versionPattern: /moment[\/-]?([0-9.]+)/i },
  ];

  libraryPatterns.forEach(({ name, pattern, versionPattern }) => {
    if (pattern.test(html) || scripts.some(s => pattern.test(s))) {
      const versionMatch = html.match(versionPattern) || scripts.find(s => versionPattern.test(s))?.match(versionPattern);
      analysis.libraries.push({
        name,
        version: versionMatch ? versionMatch[1] : null,
        type: 'library',
      });
    }
  });

  // Performance recommendations
  if (analysis.performance.blocking > 0) {
    analysis.performance.issues.push(`${analysis.performance.blocking} blocking scripts found`);
    analysis.recommendations.push('Use async or defer for non-critical scripts');
  }

  if (analysis.inlineScripts > 5) {
    analysis.recommendations.push('Consider moving inline scripts to external files');
  }

  if (analysis.totalScripts > 20) {
    analysis.recommendations.push('Too many scripts - consider bundling or code splitting');
  }

  // Security recommendations
  if (analysis.security.issues.length > 0) {
    analysis.recommendations.push('Review JavaScript code for security best practices');
  }

  if (analysis.security.exposedSecrets.length > 0) {
    analysis.recommendations.push('Remove exposed secrets from JavaScript code');
  }

  return analysis;
}

