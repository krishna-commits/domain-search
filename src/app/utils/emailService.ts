/**
 * Email Notification Service
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailTemplate {
  type: 'ssl_expiration' | 'security_alert' | 'dns_change' | 'vulnerability' | 'uptime' | 'compliance';
  data: any;
}

/**
 * Send email notification
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if email service is configured
    const emailService = process.env.EMAIL_SERVICE || 'resend'; // resend, sendgrid, nodemailer
    
    if (emailService === 'resend') {
      return await sendEmailResend(options);
    } else if (emailService === 'sendgrid') {
      return await sendEmailSendGrid(options);
    } else {
      return await sendEmailNodemailer(options);
    }
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * Send email using Resend
 */
async function sendEmailResend(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || process.env.EMAIL_FROM || 'noreply@domain-scanner.com',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html || options.text,
        text: options.text,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Resend email error:', error);
    return false;
  }
}

/**
 * Send email using SendGrid
 */
async function sendEmailSendGrid(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(options.to) 
            ? options.to.map(email => ({ email }))
            : [{ email: options.to }],
        }],
        from: {
          email: options.from || process.env.EMAIL_FROM || 'noreply@domain-scanner.com',
        },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html || options.text || '',
          },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Send email using Nodemailer (SMTP)
 */
async function sendEmailNodemailer(options: EmailOptions): Promise<boolean> {
  // This would require nodemailer package
  // For now, return false if not configured
  console.warn('Nodemailer not implemented - use Resend or SendGrid');
  return false;
}

/**
 * Generate email template
 */
export function generateEmailTemplate(template: EmailTemplate): { subject: string; html: string; text: string } {
  switch (template.type) {
    case 'ssl_expiration':
      return generateSSLExpirationEmail(template.data);
    case 'security_alert':
      return generateSecurityAlertEmail(template.data);
    case 'dns_change':
      return generateDNSChangeEmail(template.data);
    case 'vulnerability':
      return generateVulnerabilityEmail(template.data);
    case 'uptime':
      return generateUptimeEmail(template.data);
    case 'compliance':
      return generateComplianceEmail(template.data);
    default:
      return { subject: 'Notification', html: '', text: '' };
  }
}

/**
 * Generate SSL expiration email
 */
function generateSSLExpirationEmail(data: { domain: string; daysUntilExpiration: number; validTo: Date }): { subject: string; html: string; text: string } {
  const subject = `SSL Certificate Expiring Soon - ${data.domain}`;
  const isCritical = data.daysUntilExpiration <= 7;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { padding: 15px; border-radius: 5px; margin: 20px 0; }
        .critical { background-color: #fee; border-left: 4px solid #f00; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; }
        .info { background-color: #d1ecf1; border-left: 4px solid #0c5460; }
        h1 { color: ${isCritical ? '#d32f2f' : '#f57c00'}; }
        .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${isCritical ? '⚠️ URGENT: SSL Certificate Expiring' : '🔔 SSL Certificate Expiring Soon'}</h1>
        <div class="alert ${isCritical ? 'critical' : 'warning'}">
          <p><strong>Domain:</strong> ${data.domain}</p>
          <p><strong>Days Until Expiration:</strong> ${data.daysUntilExpiration}</p>
          <p><strong>Expiration Date:</strong> ${data.validTo.toLocaleDateString()}</p>
        </div>
        <div class="details">
          <p>Your SSL certificate for <strong>${data.domain}</strong> will expire in <strong>${data.daysUntilExpiration} days</strong>.</p>
          <p>Please renew your certificate as soon as possible to avoid service interruption.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
SSL Certificate Expiring Soon - ${data.domain}

Domain: ${data.domain}
Days Until Expiration: ${data.daysUntilExpiration}
Expiration Date: ${data.validTo.toLocaleDateString()}

Your SSL certificate will expire in ${data.daysUntilExpiration} days.
Please renew your certificate as soon as possible.
  `;

  return { subject, html, text };
}

/**
 * Generate security alert email
 */
function generateSecurityAlertEmail(data: { domain: string; alert: string; severity: string }): { subject: string; html: string; text: string } {
  const subject = `Security Alert - ${data.domain}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #fee; border-left: 4px solid #f00; }
        h1 { color: #d32f2f; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚨 Security Alert</h1>
        <div class="alert">
          <p><strong>Domain:</strong> ${data.domain}</p>
          <p><strong>Severity:</strong> ${data.severity}</p>
          <p><strong>Alert:</strong> ${data.alert}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Security Alert - ${data.domain}

Domain: ${data.domain}
Severity: ${data.severity}
Alert: ${data.alert}
  `;

  return { subject, html, text };
}

/**
 * Generate DNS change email
 */
function generateDNSChangeEmail(data: { domain: string; changes: Array<{ type: string; old: string; new: string }> }): { subject: string; html: string; text: string } {
  const subject = `DNS Change Detected - ${data.domain}`;
  
  const changesHtml = data.changes.map(change => `
    <tr>
      <td>${change.type}</td>
      <td>${change.old}</td>
      <td>${change.new}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔔 DNS Change Detected</h1>
        <p><strong>Domain:</strong> ${data.domain}</p>
        <table>
          <tr>
            <th>Type</th>
            <th>Old Value</th>
            <th>New Value</th>
          </tr>
          ${changesHtml}
        </table>
      </div>
    </body>
    </html>
  `;

  const text = `
DNS Change Detected - ${data.domain}

${data.changes.map(c => `${c.type}: ${c.old} -> ${c.new}`).join('\n')}
  `;

  return { subject, html, text };
}

/**
 * Generate vulnerability email
 */
function generateVulnerabilityEmail(data: { domain: string; vulnerabilities: Array<{ type: string; severity: string }> }): { subject: string; html: string; text: string } {
  const subject = `Vulnerability Detected - ${data.domain}`;
  
  const vulnsHtml = data.vulnerabilities.map(v => `
    <tr>
      <td>${v.type}</td>
      <td>${v.severity}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚠️ Vulnerability Detected</h1>
        <p><strong>Domain:</strong> ${data.domain}</p>
        <table>
          <tr>
            <th>Type</th>
            <th>Severity</th>
          </tr>
          ${vulnsHtml}
        </table>
      </div>
    </body>
    </html>
  `;

  const text = `
Vulnerability Detected - ${data.domain}

${data.vulnerabilities.map(v => `${v.type}: ${v.severity}`).join('\n')}
  `;

  return { subject, html, text };
}

/**
 * Generate uptime email
 */
function generateUptimeEmail(data: { domain: string; status: string; downtime: number }): { subject: string; html: string; text: string } {
  const subject = `Uptime Alert - ${data.domain}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #fee; border-left: 4px solid #f00; }
        h1 { color: #d32f2f; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔴 Uptime Alert</h1>
        <div class="alert">
          <p><strong>Domain:</strong> ${data.domain}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Downtime:</strong> ${data.downtime} minutes</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Uptime Alert - ${data.domain}

Domain: ${data.domain}
Status: ${data.status}
Downtime: ${data.downtime} minutes
  `;

  return { subject, html, text };
}

/**
 * Generate compliance email
 */
function generateComplianceEmail(data: { domain: string; compliance: string; score: number; issues: string[] }): { subject: string; html: string; text: string } {
  const subject = `Compliance Alert - ${data.domain}`;
  
  const issuesHtml = data.issues.map(issue => `<li>${issue}</li>`).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; }
        h1 { color: #f57c00; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📋 Compliance Alert</h1>
        <div class="alert">
          <p><strong>Domain:</strong> ${data.domain}</p>
          <p><strong>Compliance:</strong> ${data.compliance}</p>
          <p><strong>Score:</strong> ${data.score}/100</p>
          <ul>${issuesHtml}</ul>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Compliance Alert - ${data.domain}

Domain: ${data.domain}
Compliance: ${data.compliance}
Score: ${data.score}/100
Issues:
${data.issues.map(i => `- ${i}`).join('\n')}
  `;

  return { subject, html, text };
}

