# Integration Guide

This guide provides examples and instructions for integrating the Domain Security Scanner with various platforms and services.

## Table of Contents

1. [Slack Integration](#slack-integration)
2. [Discord Integration](#discord-integration)
3. [GitHub Actions](#github-actions)
4. [GitLab CI](#gitlab-ci)
5. [Jenkins](#jenkins)
6. [Custom Webhooks](#custom-webhooks)
7. [Monitoring Tools](#monitoring-tools)

## Slack Integration

### Setup

1. Create a Slack webhook:
   - Go to https://api.slack.com/messaging/webhooks
   - Create a new webhook for your channel
   - Copy the webhook URL

2. Configure in Domain Security Scanner:
   - Use the webhook URL in the webhook configuration
   - Or use the Slack integration helper (see `integrations/slack-webhook.ts`)

### Example

```typescript
import { sendToSlack, formatScanResultsForSlack } from './integrations/slack-webhook';

// After a scan completes
const scanData = {
  domain: 'example.com',
  securityScore: 85,
  riskAssessment: {
    riskLevel: 'low',
    riskFactors: []
  },
  recommendations: [...]
};

await sendToSlack('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', scanData);
```

## Discord Integration

### Setup

1. Create a Discord webhook:
   - Go to your Discord server settings
   - Navigate to Integrations > Webhooks
   - Create a new webhook
   - Copy the webhook URL

2. Configure in Domain Security Scanner:
   - Use the webhook URL in the webhook configuration
   - Or use the Discord integration helper (see `integrations/discord-webhook.ts`)

### Example

```typescript
import { sendToDiscord, formatScanResultsForDiscord } from './integrations/discord-webhook';

// After a scan completes
const scanData = {
  domain: 'example.com',
  securityScore: 85,
  riskAssessment: {
    riskLevel: 'low',
    riskFactors: []
  },
  recommendations: [...]
};

await sendToDiscord('https://discord.com/api/webhooks/YOUR/WEBHOOK/URL', scanData);
```

## GitHub Actions

### Setup

1. Copy the workflow file:
   ```bash
   cp integrations/github-actions.yml .github/workflows/domain-security.yml
   ```

2. Update the domain in the workflow file:
   ```yaml
   DOMAIN: "your-domain.com"
   ```

3. Configure secrets (optional):
   - Go to repository settings > Secrets
   - Add `SLACK_WEBHOOK` secret if you want Slack notifications

4. Commit and push:
   ```bash
   git add .github/workflows/domain-security.yml
   git commit -m "Add domain security scanning"
   git push
   ```

### Customization

The workflow can be customized:
- Change the schedule (cron expression)
- Add more domains
- Modify the security threshold
- Add additional notifications

## GitLab CI

### Setup

1. Copy the CI file:
   ```bash
   cp integrations/gitlab-ci.yml .gitlab-ci.yml
   ```

2. Update the domain variable:
   ```yaml
   variables:
     DOMAIN: "your-domain.com"
     SECURITY_THRESHOLD: "80"
   ```

3. Commit and push:
   ```bash
   git add .gitlab-ci.yml
   git commit -m "Add domain security scanning"
   git push
   ```

### Customization

- Modify the security threshold
- Add more stages
- Configure artifacts
- Add notifications

## Jenkins

### Setup

1. Create a new pipeline job:
   - Go to Jenkins dashboard
   - Click "New Item"
   - Select "Pipeline"
   - Enter a name

2. Configure the pipeline:
   - Select "Pipeline script from SCM"
   - Choose your SCM (Git)
   - Set the script path to `integrations/jenkins-pipeline.groovy`

3. Configure environment variables:
   - Go to job configuration
   - Add environment variables:
     - `DOMAIN`: Your domain
     - `SECURITY_THRESHOLD`: Security threshold (default: 80)
     - `SCANNER_URL`: Scanner API URL (default: http://localhost:3000)
     - `SLACK_WEBHOOK`: Slack webhook URL (optional)

4. Run the pipeline:
   - Click "Build Now"
   - View the build output

### Customization

- Modify the pipeline script
- Add more stages
- Configure notifications
- Add deployment steps

## Custom Webhooks

### Creating a Custom Webhook Handler

```typescript
// webhook-handler.ts
export async function handleWebhook(webhookUrl: string, scanData: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Domain-Security-Scanner/1.0',
      },
      body: JSON.stringify({
        event: 'scan.completed',
        timestamp: new Date().toISOString(),
        data: scanData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}
```

### Using in Your Application

```typescript
// After a scan completes
const scanData = await performScan('example.com');

// Send webhook notification
await handleWebhook('https://your-webhook.com/endpoint', scanData);
```

## Monitoring Tools

### Prometheus Integration

```typescript
// prometheus-integration.ts
export function exportMetrics(scanData: any) {
  const metrics = {
    domain_security_score: scanData.securityScore,
    domain_risk_level: scanData.riskAssessment?.riskLevel === 'low' ? 0 :
                       scanData.riskAssessment?.riskLevel === 'medium' ? 1 :
                       scanData.riskAssessment?.riskLevel === 'high' ? 2 : 3,
    ssl_valid: scanData.ssl?.valid ? 1 : 0,
    headers_count: Object.values(scanData.security?.headers || {})
      .filter((h: any) => h.present).length,
  };

  // Export to Prometheus
  // Implementation depends on your Prometheus setup
  return metrics;
}
```

### Grafana Dashboard

Create a Grafana dashboard with:
- Security score over time
- Risk level distribution
- SSL certificate status
- Security headers compliance
- Alert thresholds

### Datadog Integration

```typescript
// datadog-integration.ts
import { StatsD } from 'node-statsd';

const client = new StatsD({
  host: 'localhost',
  port: 8125,
});

export function sendToDatadog(scanData: any) {
  client.gauge('domain.security.score', scanData.securityScore, {
    domain: scanData.domainDetails?.hostname,
  });

  client.increment('domain.scan.completed', 1, {
    domain: scanData.domainDetails?.hostname,
    risk_level: scanData.riskAssessment?.riskLevel,
  });
}
```

## Best Practices

1. **Error Handling**: Always handle webhook errors gracefully
2. **Retry Logic**: Implement retry logic for failed webhooks
3. **Rate Limiting**: Respect rate limits of webhook services
4. **Security**: Use HTTPS for all webhook URLs
5. **Logging**: Log all webhook attempts for debugging
6. **Testing**: Test webhooks before deploying to production

## Troubleshooting

### Webhook Not Received

1. Check webhook URL is correct
2. Verify webhook service is accessible
3. Check firewall/network settings
4. Review webhook service logs
5. Test webhook manually with curl

### Integration Not Working

1. Verify API endpoints are accessible
2. Check authentication credentials
3. Review integration logs
4. Test with simple requests first
5. Check for rate limiting

### Performance Issues

1. Use parallel scanning for batch operations
2. Implement caching for repeated scans
3. Use scheduled scans for regular monitoring
4. Optimize webhook payload size
5. Consider async webhook delivery

