# Deployment Instructions

## Your tower defense game is ready to deploy! 

### Files Created:
- ✅ `railway.toml` - Railway configuration
- ✅ `dist/` folder - Built production files  
- ✅ `serve` package added - Static file server

### Deploy to Railway:

1. **Push to GitHub** (if using Git integration):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to railway.app** and create new project from GitHub repo

3. **Or use Railway CLI locally**:
   ```bash
   railway login
   railway init  
   railway up
   ```

### Alternative Platforms:

**Vercel (Easy):**
```bash
npx vercel --prod
```

**Netlify (Easiest):**
1. Go to netlify.com
2. Drag & drop the `dist` folder
3. Your game is live!

### Local Testing:
```bash
yarn build         # Build production version
npx serve dist -s  # Test locally on http://localhost:3000
```

Your game will be available at the provided URL once deployed!