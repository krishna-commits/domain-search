# Domain Security Scanner

A comprehensive enterprise-grade domain security analysis platform with 100+ security checks, real-time monitoring, and detailed reporting.

## Features

- 🔒 **100+ Security Checks** across 12 categories
- 🌐 **Full Port Scanning** (0-65535 ports)
- 📊 **Comprehensive Reports** with PDF export
- 🔐 **SSL/TLS Analysis** with certificate chain validation
- 🛡️ **Security Headers** analysis and grading
- 📧 **Email Security** (SPF, DKIM, DMARC)
- ⚠️ **Vulnerability Detection** with OWASP Top 10
- 🌍 **IP Reputation** and blacklist checking
- 📈 **Real-time Progress** tracking with detailed metrics
- 📄 **PDF Reports** with professional formatting
- 🔗 **CI/CD Integration** (GitHub Actions, GitLab CI, Jenkins)
- 📝 **Confluence Integration** for report publishing

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd domain-search
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (optional):
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Automatic Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. For production:
```bash
vercel --prod
```

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_APP_URL` (optional) - Your production URL
- Any other custom environment variables

## CI/CD Integration

### GitHub Actions

See `integrations/github-actions.yml` for example workflow.

### GitLab CI

See `integrations/gitlab-ci.yml` for example pipeline.

### Jenkins

See `integrations/jenkins-pipeline.groovy` for example pipeline.

## Confluence Integration

To publish scan results to Confluence:

1. Get your Confluence API token
2. Configure in the scanner UI or via API
3. Scan results will be automatically published

API endpoint: `POST /api/confluence`

## API Usage

### Scan Domain

```bash
GET /api/domain?domain=example.com&profile=deep
```

### Export to Confluence

```bash
POST /api/confluence
{
  "config": {
    "baseUrl": "https://yourcompany.atlassian.net",
    "username": "your-email@example.com",
    "apiToken": "your-api-token",
    "spaceKey": "YOURSPACE"
  },
  "scanData": { ... },
  "pageTitle": "Security Report"
}
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── components/   # React components
│   │   └── utils/        # Utility functions
├── integrations/         # CI/CD and third-party integrations
└── public/              # Static assets
```

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Security

- All API routes are server-side only
- Environment variables for sensitive data
- Security headers configured
- Input validation and sanitization

## License

Developed by [krishnaneupane.com](https://krishnaneupane.com)

## Support

For issues, questions, or contributions, please visit [krishnaneupane.com](https://krishnaneupane.com)
