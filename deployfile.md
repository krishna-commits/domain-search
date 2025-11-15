# Quick Vercel Deployment Guide

## 🚀 Deploy in 3 Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready for Vercel"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js ✅

### Step 3: Deploy
- Click "Deploy" 
- Wait 2-3 minutes
- Your app is live! 🎉

## ✅ What's Already Configured

- ✅ `vercel.json` - Function timeouts (300s for API routes)
- ✅ `next.config.ts` - Production optimizations
- ✅ Environment variables - Auto-detected from Vercel
- ✅ Security headers - Configured in vercel.json
- ✅ Build settings - Auto-detected

## 📝 Optional: Environment Variables

If you need custom variables, add in Vercel Dashboard:
- Settings → Environment Variables
- Add `NEXT_PUBLIC_APP_URL` (optional - auto-set by Vercel)

## 🔧 Function Timeouts

- **Free Tier**: 10 seconds max
- **Pro Tier**: 60 seconds max  
- **Enterprise**: 300 seconds (configured)

For full port scans (0-65535), Pro tier recommended.

## 🌐 Custom Domain

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions

## 📊 Post-Deployment

1. Test your deployment URL
2. Run a test scan
3. Verify PDF generation
4. Check Vercel Analytics

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Ensure Node.js 20+ is selected
- Verify all dependencies in package.json

**API timeouts?**
- Upgrade to Vercel Pro
- Or reduce port scan range in code

**Need help?**
- Visit: krishnaneupane.com
- Check: DEPLOYMENT.md for detailed guide

---

**Developed by [krishnaneupane.com](https://krishnaneupane.com)**

