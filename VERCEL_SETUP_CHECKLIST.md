# ✅ Vercel Deployment Checklist

Use this checklist to ensure your AlphaEarth project is ready for Vercel deployment.

## 📁 File Structure

- [x] `vercel.json` - Root Vercel configuration
- [x] `api/index.js` - Node.js API serverless function
- [x] `api/[...path].js` - Catch-all Node.js routes
- [x] `api/python/[...path].py` - Catch-all Python routes
- [x] `api/python/flask_handler.py` - Flask app handler
- [x] `api/python/requirements.txt` - Python dependencies
- [x] `package.json` - Root package.json
- [x] `.vercelignore` - Files to ignore

## 🔧 Configuration

### Root `vercel.json`
- [x] Build command configured
- [x] Output directory set to `frontend/dist`
- [x] Rewrites configured for API routes
- [x] Function timeouts configured (60s Node.js, 300s Python)

### Frontend Configuration
- [x] `frontend/vercel.json` configured
- [x] `frontend/vite.config.ts` has proper proxy setup
- [x] API client uses environment variables

### Backend Configuration
- [x] `api/index.js` exports Express app
- [x] CORS configured for Vercel URLs
- [x] Python service URL detection for Vercel
- [x] Environment variable handling

## 🔐 Environment Variables

Set these in Vercel Dashboard:

### Required
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key
- [ ] `NOAA_API_KEY` - NOAA API key
- [ ] `NASA_FIRMS_KEY` - NASA FIRMS key
- [ ] `GEE_PROJECT_ID` - Google Earth Engine project ID
- [ ] `GEE_SERVICE_ACCOUNT` - GEE service account email

### Optional (Auto-detected)
- [ ] `VITE_API_URL` - Frontend API URL (defaults to `/api`)
- [ ] `CORS_ORIGIN` - CORS origins (defaults to Vercel URL)
- [ ] `PYTHON_SERVICE_URL` - Python service URL (defaults to `/api/python`)

## 🚀 Deployment Steps

1. [ ] Install Vercel CLI: `npm install -g vercel`
2. [ ] Login to Vercel: `vercel login`
3. [ ] Set environment variables in Vercel Dashboard
4. [ ] Deploy: `vercel --prod`
5. [ ] Verify deployment:
   - [ ] Frontend loads: `https://your-app.vercel.app`
   - [ ] Node.js API works: `https://your-app.vercel.app/api/health`
   - [ ] Python API works: `https://your-app.vercel.app/api/python/health`

## 🐛 Troubleshooting

### Common Issues

1. **Python functions not working**
   - Check `api/python/requirements.txt` exists
   - Verify Python runtime in `vercel.json`
   - Check function logs in Vercel Dashboard

2. **Node.js API routes returning 404**
   - Verify `api/index.js` exists
   - Check routes in `vercel.json`
   - Ensure dependencies are installed

3. **Frontend can't connect to backend**
   - Verify `VITE_API_URL` is set or uses relative path
   - Check CORS configuration
   - Verify backend routes are accessible

4. **Earth Engine authentication fails**
   - Verify `GEE_PROJECT_ID` and `GEE_SERVICE_ACCOUNT` are set
   - Check service account has Earth Engine access
   - Verify service account permissions

5. **Function timeout**
   - Upgrade to Vercel Pro for 300s timeout
   - Optimize Earth Engine queries
   - Consider caching results

## 📊 Post-Deployment

After deployment, verify:

- [ ] Frontend is accessible
- [ ] API endpoints are responding
- [ ] Health checks pass
- [ ] CORS is working
- [ ] Earth Engine operations work
- [ ] Environment variables are set correctly
- [ ] Logs are accessible

## 📚 Documentation

- [Full Deployment Guide](DEPLOYMENT_VERCEL.md)
- [Quick Start Guide](README_VERCEL.md)
- [Vercel Documentation](https://vercel.com/docs)

## 🎉 Success!

Once all items are checked, your AlphaEarth platform should be live on Vercel!

