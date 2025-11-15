/**
 * Slack Webhook Integration Example
 * 
 * This example shows how to integrate domain scan results with Slack
 * for real-time security notifications.
 * 
 * Usage:
 * 1. Create a Slack webhook URL from https://api.slack.com/messaging/webhooks
 * 2. Configure it in the Domain Security Scanner webhook settings
 * 3. Scans will automatically send notifications to your Slack channel
 */

export interface SlackWebhookPayload {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
}

export interface SlackAttachment {
  color: string;
  fields: Array<{
    title: string;
    value: string;
    short: boolean;
  }>;
  footer?: string;
  ts?: number;
}

/**
 * Format domain scan results for Slack notification
 */
export function formatScanResultsForSlack(scanData: any): SlackWebhookPayload {
  const { domain, securityScore, riskAssessment, recommendations } = scanData;
  
  const riskColor = 
    riskAssessment?.riskLevel === 'critical' ? 'danger' :
    riskAssessment?.riskLevel === 'high' ? 'warning' :
    riskAssessment?.riskLevel === 'medium' ? 'warning' :
    'good';

  const scoreEmoji = 
    securityScore >= 80 ? '✅' :
    securityScore >= 60 ? '⚠️' :
    securityScore >= 40 ? '🔴' :
    '🚨';

  return {
    text: `Domain Security Scan: ${domain}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${scoreEmoji} Domain Security Scan: ${domain}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Security Score:*\n${securityScore}/100`
          },
          {
            type: 'mrkdwn',
            text: `*Risk Level:*\n${riskAssessment?.riskLevel?.toUpperCase() || 'UNKNOWN'}`
          }
        ]
      }
    ],
    attachments: [
      {
        color: riskColor,
        fields: [
          {
            title: 'Domain',
            value: domain,
            short: true
          },
          {
            title: 'Security Score',
            value: `${securityScore}/100`,
            short: true
          },
          {
            title: 'Risk Level',
            value: riskAssessment?.riskLevel?.toUpperCase() || 'UNKNOWN',
            short: true
          },
          {
            title: 'Risk Factors',
            value: riskAssessment?.riskFactors?.length > 0 
              ? riskAssessment.riskFactors.slice(0, 3).join(', ')
              : 'None',
            short: true
          }
        ],
        footer: 'Domain Security Scanner',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
}

/**
 * Send scan results to Slack
 */
export async function sendToSlack(
  webhookUrl: string,
  scanData: any
): Promise<void> {
  const payload = formatScanResultsForSlack(scanData);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send to Slack:', error);
    throw error;
  }
}

/**
 * Example: Configure in your application
 * 
 * In your webhook configuration:
 * - Webhook URL: Your Slack webhook URL
 * - The scanner will automatically format and send results
 */

