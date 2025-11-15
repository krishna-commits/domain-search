/**
 * Discord Webhook Integration Example
 * 
 * This example shows how to integrate domain scan results with Discord
 * for real-time security notifications.
 * 
 * Usage:
 * 1. Create a Discord webhook from your Discord server settings
 * 2. Configure it in the Domain Security Scanner webhook settings
 * 3. Scans will automatically send notifications to your Discord channel
 */

export interface DiscordWebhookPayload {
  content?: string;
  embeds: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
  thumbnail?: {
    url: string;
  };
}

/**
 * Format domain scan results for Discord notification
 */
export function formatScanResultsForDiscord(scanData: any): DiscordWebhookPayload {
  const { domain, securityScore, riskAssessment, recommendations } = scanData;
  
  const riskColor = 
    riskAssessment?.riskLevel === 'critical' ? 0xFF0000 : // Red
    riskAssessment?.riskLevel === 'high' ? 0xFF6600 :    // Orange
    riskAssessment?.riskLevel === 'medium' ? 0xFFAA00 :   // Yellow
    0x00FF00; // Green

  const scoreEmoji = 
    securityScore >= 80 ? '✅' :
    securityScore >= 60 ? '⚠️' :
    securityScore >= 40 ? '🔴' :
    '🚨';

  return {
    content: `**${scoreEmoji} Domain Security Scan Complete**`,
    embeds: [
      {
        title: `Security Scan: ${domain}`,
        description: `Security assessment completed for **${domain}**`,
        color: riskColor,
        fields: [
          {
            name: 'Security Score',
            value: `${securityScore}/100`,
            inline: true
          },
          {
            name: 'Risk Level',
            value: riskAssessment?.riskLevel?.toUpperCase() || 'UNKNOWN',
            inline: true
          },
          {
            name: 'Risk Factors',
            value: riskAssessment?.riskFactors?.length > 0 
              ? riskAssessment.riskFactors.slice(0, 5).join('\n• ')
              : 'None identified',
            inline: false
          },
          {
            name: 'Top Recommendations',
            value: recommendations?.slice(0, 3).join('\n• ') || 'No recommendations',
            inline: false
          }
        ],
        footer: {
          text: 'Domain Security Scanner'
        },
        timestamp: new Date().toISOString()
      }
    ],
    username: 'Security Scanner',
    avatar_url: 'https://example.com/scanner-icon.png'
  };
}

/**
 * Send scan results to Discord
 */
export async function sendToDiscord(
  webhookUrl: string,
  scanData: any
): Promise<void> {
  const payload = formatScanResultsForDiscord(scanData);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send to Discord:', error);
    throw error;
  }
}

