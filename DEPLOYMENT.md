# Deployment Guide - Domain Security Scanner

This guide covers deploying the Domain Security Scanner to Vercel and other platforms.

## 🚀 Vercel Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Connect your repository
3. **Node.js 20+**: Ensure your local environment matches

### Step 1: Prepare Your Repository

1. Ensure all changes are committed:
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables** (Optional - auto-configured):
   - `NEXT_PUBLIC_APP_URL` - Automatically set by Vercel
   - `VERCEL_URL` - Automatically set by Vercel

5. Click **Deploy**

#### Option B: Via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Step 3: Verify Deployment

1. Check build logs in Vercel dashboard
2. Visit your deployment URL
3. Test a domain scan to ensure everything works

### Step 4: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## 🔧 Environment Variables

### Production (Vercel)

Vercel automatically sets:
- `VERCEL_URL` - Your deployment URL
- `NEXT_PUBLIC_APP_URL` - Auto-configured from `VERCEL_URL`

### Local Development

Create `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SCANNER_URL=http://localhost:3000
```

## 📋 Build Configuration

### Vercel Settings

The `vercel.json` file configures:
- **Function Timeout**: 300 seconds (5 minutes) for API routes
- **Security Headers**: HSTS, XSS Protection, Frame Options, etc.
- **Region**: `iad1` (US East)

### Build Process

1. **Install Dependencies**: `npm install`
2. **Type Check**: TypeScript compilation
3. **Build**: `npm run build`
4. **Optimize**: Next.js production optimizations

## 🧪 Testing Production Build Locally

1. Build the production version:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Test at `http://localhost:3000`

## 🔍 Troubleshooting

### Build Failures

1. **TypeScript Errors**:
   - Run `npm run type-check` to identify issues
   - Fix all type errors before deploying

2. **Memory Issues**:
   - Increase Vercel function memory in project settings
   - Optimize large dependencies

3. **Timeout Issues**:
   - API routes have 300s timeout (configured in `vercel.json`)
   - For longer scans, consider background jobs

### Runtime Issues

1. **API Route Timeouts**:
   - Full port scans (0-65535) can take 5-10 minutes
   - Consider implementing async job processing

2. **Environment Variables**:
   - Verify all required variables are set in Vercel dashboard
   - Check variable names match exactly (case-sensitive)

## 📊 Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor:
   - Page views
   - API route performance
   - Error rates

### Logs

Access logs via:
- Vercel Dashboard → Your Project → Logs
- Vercel CLI: `vercel logs`

## 🔄 CI/CD Integration

### GitHub Actions

The scanner can be integrated into CI/CD pipelines:

```yaml
- name: Run domain security scan
  run: |
    SCANNER_URL="https://your-vercel-app.vercel.app"
    curl -X GET "$SCANNER_URL/api/domain?domain=example.com"
```

### GitLab CI

Similar integration available in `integrations/gitlab-ci.yml`

### Jenkins

Pipeline script available in `integrations/jenkins-pipeline.groovy`

## 🚨 Important Notes

1. **Rate Limiting**: Consider implementing rate limiting for production
2. **API Keys**: If using external APIs, store keys in Vercel environment variables
3. **Database**: If adding database features, configure connection strings securely
4. **Monitoring**: Set up error tracking (e.g., Sentry) for production

## 📞 Support

For issues or questions:
- Check the [README.md](./README.md) for general information
- Review build logs in Vercel dashboard
- Check TypeScript errors with `npm run type-check`

## ✅ Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] Build completes successfully (`npm run build`)
- [ ] Production build tested locally (`npm start`)
- [ ] Environment variables configured (if needed)
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring/analytics enabled
- [ ] CI/CD pipelines updated with production URL
- [ ] Documentation updated

---

**Developed by**: krishnaneupane.com  
**Last Updated**: 2024

