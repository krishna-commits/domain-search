/**
 * Confluence Integration for Domain Security Scanner
 * 
 * This module provides functionality to publish scan results to Confluence
 * as formatted pages with security reports, charts, and recommendations.
 */

export interface ConfluenceConfig {
  baseUrl: string; // e.g., https://yourcompany.atlassian.net
  username: string; // Confluence username or email
  apiToken: string; // Confluence API token
  spaceKey: string; // Confluence space key
  parentPageId?: string; // Optional parent page ID
}

export interface ConfluencePage {
  title: string;
  content: string;
  spaceKey: string;
  parentId?: string;
}

/**
 * Format scan results as Confluence Storage Format (XHTML)
 */
export function formatScanResultsForConfluence(scanData: any): string {
  const domain = scanData.domainDetails?.hostname || 'Unknown Domain';
  const securityScore = scanData.securityScore || 0;
  const riskLevel = scanData.riskAssessment?.riskLevel || 'unknown';
  const scanDate = new Date().toLocaleString();

  // Determine color based on score
  const scoreColor = securityScore >= 80 ? '#36B37E' : securityScore >= 60 ? '#FFAB00' : '#FF5630';
  const riskColor = riskLevel === 'low' ? '#36B37E' : riskLevel === 'medium' ? '#FFAB00' : '#FF5630';

  // Build Confluence Storage Format (XHTML)
  const content = `
<ac:structured-macro ac:name="panel" ac:schema-version="1">
  <ac:parameter ac:name="title">Domain Security Scan Report</ac:parameter>
  <ac:parameter ac:name="borderColor">${scoreColor}</ac:parameter>
  <ac:parameter ac:name="titleBGColor">${scoreColor}</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Domain:</strong> ${domain}</p>
    <p><strong>Scan Date:</strong> ${scanDate}</p>
    <p><strong>Security Score:</strong> <span style="color: ${scoreColor}; font-size: 24px; font-weight: bold;">${securityScore}/100</span></p>
    <p><strong>Risk Level:</strong> <span style="color: ${riskColor}; font-weight: bold; text-transform: uppercase;">${riskLevel}</span></p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Executive Summary</h2>
<p>This report provides a comprehensive security analysis of <strong>${domain}</strong> based on ${scanData.securityScore !== undefined ? '100+' : 'multiple'} security checks across multiple categories.</p>

<h2>Security Metrics</h2>
<table>
  <tbody>
    <tr>
      <th>Metric</th>
      <th>Value</th>
      <th>Status</th>
    </tr>
    <tr>
      <td>Security Score</td>
      <td>${securityScore}/100</td>
      <td><span style="color: ${scoreColor};">${securityScore >= 80 ? '✓ Good' : securityScore >= 60 ? '⚠ Fair' : '✗ Poor'}</span></td>
    </tr>
    <tr>
      <td>SSL Certificate</td>
      <td>${scanData.ssl?.valid ? 'Valid' : 'Invalid'}</td>
      <td><span style="color: ${scanData.ssl?.valid ? '#36B37E' : '#FF5630'};">${scanData.ssl?.valid ? '✓' : '✗'}</span></td>
    </tr>
    <tr>
      <td>Vulnerabilities</td>
      <td>${scanData.vulnerabilities?.length || 0}</td>
      <td><span style="color: ${(scanData.vulnerabilities?.length || 0) === 0 ? '#36B37E' : '#FF5630'};">${(scanData.vulnerabilities?.length || 0) === 0 ? '✓ None' : '✗ Found'}</span></td>
    </tr>
    <tr>
      <td>Subdomains Discovered</td>
      <td>${scanData.subdomains?.length || 0}</td>
      <td>-</td>
    </tr>
    <tr>
      <td>Open Ports</td>
      <td>${scanData.portScan?.open || 0}</td>
      <td><span style="color: ${(scanData.portScan?.open || 0) > 10 ? '#FF5630' : (scanData.portScan?.open || 0) > 5 ? '#FFAB00' : '#36B37E'};">${(scanData.portScan?.open || 0) > 10 ? '⚠ High' : (scanData.portScan?.open || 0) > 5 ? '⚠ Medium' : '✓ Low'}</span></td>
    </tr>
  </tbody>
</table>

<h2>Security Headers Analysis</h2>
${scanData.security?.headers ? `
<table>
  <tbody>
    <tr>
      <th>Header</th>
      <th>Status</th>
    </tr>
    ${Object.entries(scanData.security.headers).map(([key, value]: [string, any]) => `
    <tr>
      <td><code>${key}</code></td>
      <td><span style="color: ${value.present ? '#36B37E' : '#FF5630'};">${value.present ? '✓ Present' : '✗ Missing'}</span></td>
    </tr>
    `).join('')}
  </tbody>
</table>
` : '<p>No security headers data available.</p>'}

<h2>SSL/TLS Certificate Information</h2>
${scanData.ssl ? `
<ul>
  <li><strong>Valid:</strong> ${scanData.ssl.valid ? 'Yes' : 'No'}</li>
  ${scanData.ssl.issuer ? `<li><strong>Issuer:</strong> ${scanData.ssl.issuer}</li>` : ''}
  ${scanData.ssl.validFrom ? `<li><strong>Valid From:</strong> ${scanData.ssl.validFrom}</li>` : ''}
  ${scanData.ssl.validTo ? `<li><strong>Valid To:</strong> ${scanData.ssl.validTo}</li>` : ''}
  ${scanData.ssl.protocol ? `<li><strong>Protocol:</strong> ${scanData.ssl.protocol}</li>` : ''}
</ul>
` : '<p>No SSL/TLS certificate information available.</p>'}

<h2>DNS Analysis</h2>
${scanData.dns ? `
<ac:structured-macro ac:name="code" ac:schema-version="1">
  <ac:parameter ac:name="language">json</ac:parameter>
  <ac:parameter ac:name="collapse">false</ac:parameter>
  <ac:plain-text-body><![CDATA[${JSON.stringify(scanData.dns, null, 2)}]]></ac:plain-text-body>
</ac:structured-macro>
` : '<p>No DNS information available.</p>'}

${scanData.vulnerabilities && scanData.vulnerabilities.length > 0 ? `
<h2>Vulnerabilities Detected</h2>
<ac:structured-macro ac:name="panel" ac:schema-version="1">
  <ac:parameter ac:name="title">⚠️ Security Vulnerabilities</ac:parameter>
  <ac:parameter ac:name="borderColor">#FF5630</ac:parameter>
  <ac:rich-text-body>
    <ul>
      ${scanData.vulnerabilities.map((vuln: any, index: number) => `
      <li>
        <strong>${index + 1}. ${vuln.name || vuln.title || 'Vulnerability'}</strong>
        ${vuln.severity ? `<br/>Severity: <span style="color: #FF5630;">${vuln.severity}</span>` : ''}
        ${vuln.description ? `<br/>${vuln.description}` : ''}
      </li>
      `).join('')}
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
` : ''}

${scanData.portScan && scanData.portScan.openPorts && scanData.portScan.openPorts.length > 0 ? `
<h2>Open Ports</h2>
<table>
  <tbody>
    <tr>
      <th>Port</th>
      <th>Service</th>
      <th>Status</th>
    </tr>
    ${scanData.portScan.openPorts.slice(0, 20).map((port: any) => `
    <tr>
      <td><code>${port.port}</code></td>
      <td>${port.service || 'Unknown'}</td>
      <td><span style="color: #36B37E;">✓ Open</span></td>
    </tr>
    `).join('')}
    ${scanData.portScan.openPorts.length > 20 ? `
    <tr>
      <td colspan="3"><em>... and ${scanData.portScan.openPorts.length - 20} more open ports</em></td>
    </tr>
    ` : ''}
  </tbody>
</table>
` : ''}

${scanData.subdomains && scanData.subdomains.length > 0 ? `
<h2>Subdomains Discovered</h2>
<p>Total subdomains found: <strong>${scanData.subdomains.length}</strong></p>
<ac:structured-macro ac:name="code" ac:schema-version="1">
  <ac:parameter ac:name="language">text</ac:parameter>
  <ac:parameter ac:name="collapse">true</ac:parameter>
  <ac:plain-text-body><![CDATA[${scanData.subdomains.slice(0, 50).join('\n')}${scanData.subdomains.length > 50 ? '\n... and more' : ''}]]></ac:plain-text-body>
</ac:structured-macro>
` : ''}

${scanData.recommendations && scanData.recommendations.length > 0 ? `
<h2>Security Recommendations</h2>
<ac:structured-macro ac:name="panel" ac:schema-version="1">
  <ac:parameter ac:name="title">💡 Recommendations</ac:parameter>
  <ac:parameter ac:name="borderColor">#0052CC</ac:parameter>
  <ac:rich-text-body>
    <ul>
      ${scanData.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>
` : ''}

<h2>Detailed Report</h2>
<p>For a complete detailed report, please download the PDF or JSON export from the scanner interface.</p>

<hr/>
<p><em>Report generated by Domain Security Scanner on ${scanDate}</em></p>
  `.trim();

  return content;
}

/**
 * Create or update a Confluence page with scan results
 */
export async function publishToConfluence(
  config: ConfluenceConfig,
  scanData: any,
  pageTitle?: string
): Promise<{ success: boolean; pageId?: string; pageUrl?: string; error?: string }> {
  try {
    const domain = scanData.domainDetails?.hostname || 'Unknown Domain';
    const title = pageTitle || `Security Scan Report - ${domain} - ${new Date().toISOString().split('T')[0]}`;
    const content = formatScanResultsForConfluence(scanData);

    // First, try to find existing page
    const searchUrl = `${config.baseUrl}/wiki/rest/api/content?title=${encodeURIComponent(title)}&spaceKey=${config.spaceKey}&expand=version`;
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    let pageId: string | undefined;
    let version: number = 1;

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.results && searchData.results.length > 0) {
        pageId = searchData.results[0].id;
        version = (searchData.results[0].version?.number || 1) + 1;
      }
    }

    // Create or update page
    const pageData: any = {
      type: 'page',
      title: title,
      space: { key: config.spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage',
        },
      },
    };

    if (config.parentPageId) {
      pageData.ancestors = [{ id: config.parentPageId }];
    }

    if (pageId) {
      // Update existing page
      pageData.version = { number: version };
      const updateUrl = `${config.baseUrl}/wiki/rest/api/content/${pageId}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update Confluence page: ${updateResponse.status} - ${errorText}`);
      }

      const updatedPage = await updateResponse.json();
      return {
        success: true,
        pageId: updatedPage.id,
        pageUrl: `${config.baseUrl}/wiki${updatedPage._links.webui}`,
      };
    } else {
      // Create new page
      const createUrl = `${config.baseUrl}/wiki/rest/api/content`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create Confluence page: ${createResponse.status} - ${errorText}`);
      }

      const createdPage = await createResponse.json();
      return {
        success: true,
        pageId: createdPage.id,
        pageUrl: `${config.baseUrl}/wiki${createdPage._links.webui}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Test Confluence connection
 */
export async function testConfluenceConnection(config: ConfluenceConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const testUrl = `${config.baseUrl}/wiki/rest/api/space/${config.spaceKey}`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Connection failed: ${response.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

