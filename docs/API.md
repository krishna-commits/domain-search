# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. For production use, implement authentication.

## Endpoints

### Domain Scan

**Endpoint:** `GET /api/domain`

**Description:** Perform a comprehensive security scan of a domain.

**Parameters:**
- `domain` (required, string) - Domain to scan (e.g., "example.com")
- `profile` (optional, string) - Scan profile: `quick`, `deep`, or `custom`
- `config` (optional, string) - Custom configuration (JSON string, required if profile is `custom`)

**Example Request:**
```bash
curl "http://localhost:3000/api/domain?domain=example.com&profile=deep"
```

**Example Response:**
```json
{
  "domainDetails": {
    "domain": "example.com",
    "hostname": "example.com",
    "publicSuffix": "com",
    "topLevelDomain": "com"
  },
  "securityScore": 85,
  "riskAssessment": {
    "riskLevel": "low",
    "riskFactors": [],
    "score": 85
  },
  "recommendations": [
    "Add missing security headers",
    "Configure cookies with Secure and HttpOnly flags"
  ],
  "ssl": {
    "valid": true,
    "chain": [...]
  },
  "security": {
    "headers": {...},
    "protocols": {...}
  },
  "cookies": {
    "cookies": [...],
    "issues": [],
    "score": 100
  },
  "csp": {
    "valid": true,
    "issues": [],
    "score": 100
  },
  "emailSecurity": {
    "spf": {...},
    "dkim": {...},
    "dmarc": {...},
    "score": 66
  },
  "dnsAnalysis": {
    "responseTime": {...},
    "propagation": [...],
    "score": 90
  },
  "ipReputation": {
    "reputationScore": 95,
    "geolocation": {...},
    "asn": {...}
  }
}
```

### Batch Scan

**Endpoint:** `POST /api/batch-scan`

**Description:** Scan multiple domains in parallel or sequentially.

**Request Body:**
```json
{
  "domains": ["example.com", "example2.com", "example3.com"],
  "profile": "deep",
  "parallel": true
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "averageScore": 82,
    "riskDistribution": {
      "low": 2,
      "medium": 1,
      "high": 0,
      "critical": 0
    }
  },
  "results": [
    {
      "domain": "example.com",
      "success": true,
      "data": {...}
    }
  ],
  "errors": []
}
```

### Domain Comparison

**Endpoint:** `POST /api/comparison`

**Description:** Compare security postures of multiple domains.

**Request Body:**
```json
{
  "domains": ["example.com", "example2.com"],
  "profile": "deep"
}
```

**Response:**
```json
{
  "success": true,
  "comparison": [
    {
      "domain": "example.com",
      "securityScore": 85,
      "riskLevel": "low",
      "sslValid": true,
      "headersCount": 8,
      "totalHeaders": 9
    }
  ],
  "ranked": [...],
  "best": {
    "domain": "example.com",
    "securityScore": 85
  },
  "worst": {
    "domain": "example2.com",
    "securityScore": 65
  },
  "averages": {
    "securityScore": 75,
    "headersCount": 7
  }
}
```

### Scheduled Scans

**Endpoint:** `POST /api/scheduled-scans`

**Description:** Create a scheduled scan.

**Request Body:**
```json
{
  "domain": "example.com",
  "schedule": "0 2 * * *",
  "profile": "deep",
  "webhookUrl": "https://your-webhook.com",
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "id": "scan_1234567890_abc123",
  "message": "Scheduled scan created successfully",
  "nextRun": "2024-01-01T02:00:00.000Z"
}
```

**Endpoint:** `GET /api/scheduled-scans?domain=example.com`

**Description:** Get all scheduled scans, optionally filtered by domain.

**Endpoint:** `PUT /api/scheduled-scans`

**Description:** Update a scheduled scan.

**Request Body:**
```json
{
  "id": "scan_1234567890_abc123",
  "enabled": false,
  "schedule": "0 3 * * *"
}
```

**Endpoint:** `DELETE /api/scheduled-scans?id=scan_1234567890_abc123`

**Description:** Delete a scheduled scan.

### Scan History

**Endpoint:** `GET /api/history?domain=example.com&limit=50&offset=0`

**Description:** Get scan history, optionally filtered by domain.

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "scan_1234567890_abc123",
      "domain": "example.com",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "securityScore": 85,
      "riskLevel": "low"
    }
  ],
  "stats": {
    "totalScans": 100,
    "averageScore": 82,
    "riskDistribution": {
      "low": 60,
      "medium": 30,
      "high": 8,
      "critical": 2
    },
    "scoreTrend": [...]
  },
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**Endpoint:** `POST /api/history`

**Description:** Save a scan to history.

**Request Body:**
```json
{
  "domain": "example.com",
  "securityScore": 85,
  "riskLevel": "low",
  "data": {...}
}
```

### Alerts

**Endpoint:** `POST /api/alerts`

**Description:** Create an alert configuration.

**Request Body:**
```json
{
  "domain": "example.com",
  "threshold": 80,
  "webhookUrl": "https://your-webhook.com",
  "email": "alert@example.com",
  "enabled": true
}
```

**Endpoint:** `GET /api/alerts?domain=example.com`

**Description:** Get alert configurations, optionally filtered by domain.

**Endpoint:** `PUT /api/alerts`

**Description:** Check if alerts should be triggered.

**Request Body:**
```json
{
  "domain": "example.com",
  "securityScore": 75
}
```

**Response:**
```json
{
  "success": true,
  "triggered": true,
  "alertsTriggered": ["alert_1234567890_abc123"]
}
```

**Endpoint:** `DELETE /api/alerts?id=alert_1234567890_abc123`

**Description:** Delete an alert configuration.

### Webhook

**Endpoint:** `POST /api/webhook`

**Description:** Send a webhook notification.

**Request Body:**
```json
{
  "webhookUrl": "https://your-webhook.com",
  "scanData": {
    "domain": "example.com",
    "securityScore": 85,
    "riskLevel": "low",
    ...
  }
}
```

**Endpoint:** `GET /api/webhook?url=https://your-webhook.com`

**Description:** Test a webhook URL.

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, implement rate limiting to prevent abuse.

## Pagination

Endpoints that return lists support pagination:
- `limit` - Number of items per page (default: 50, max: 100)
- `offset` - Number of items to skip (default: 0)

## Cron Expression Format

Scheduled scans use cron expressions in the format:
```
minute hour day month weekday
```

Examples:
- `0 2 * * *` - Daily at 2 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 0 1 * *` - Monthly on the 1st at midnight

