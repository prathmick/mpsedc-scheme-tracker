# Railway Deployment - Step by Step

## Prerequisites
- GitHub account with your code pushed
- Railway account (free at railway.app)

## Part 1: Deploy Backend on Railway

### Step 1: Create Railway Project
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Click **"Configure GitHub App"** if needed
5. Select your repository `mpsedc-scheme-tracker`
6. Click **"Deploy"**

### Step 2: Configure Backend Service
1. Railway will auto-detect and create a service
2. Click on the service to open settings
3. Go to **"Settings"** tab
4. Set **Root Directory** to `backend`

### Step 3: Add Environment Variables
1. Go to **"Variables"** tab
2. Add these variables:

```
PORT=5000
DB_NAME=mpsedc_tracker.db
JWT_SECRET=your-super-secret-key-change-this-to-something-random
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

3. Click **"Save"**

### Step 4: Deploy
1. Go to **"Deployments"** tab
2. Click **"Deploy"** button
3. Wait for deployment to complete (2-5 minutes)
4. You'll see a green checkmark when done

### Step 5: Get Backend URL
1. Go to **"Settings"** tab
2. Look for **"Domains"** section
3. Copy your domain (e.g., `https://mpsedc-backend.railway.app`)
4. **Save this URL** - you'll need it for frontend

## Part 2: Deploy Frontend on Vercel (Recommended)

### Step 1: Go to Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**

### Step 2: Import Project
1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Select your repository `mpsedc-scheme-tracker`
4. Click **"Import"**

### Step 3: Configure Project
1. **Framework Preset**: Select **"Vite"**
2. **Root Directory**: Click **"Edit"** and set to `frontend`
3. **Build Command**: Should be `npm run build`
4. **Output Directory**: Should be `dist`

### Step 4: Add Environment Variables
1. Scroll down to **"Environment Variables"**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-railway-url/api` (use the URL from Step 5 above)
3. Click **"Add"**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. You'll see a success message with your URL

### Step 6: Get Frontend URL
1. Copy your Vercel domain (e.g., `https://mpsedc-frontend.vercel.app`)
2. **Save this URL** - this is your live application

## Part 3: Verify Deployment

### Test Backend
1. Open `https://your-backend-railway-url/api-docs`
2. You should see Swagger UI
3. Try the `/api/auth/login` endpoint

### Test Frontend
1. Open `https://your-frontend-vercel-url`
2. You should see the login page
3. Try logging in with:
   - Email: `admin@example.com`
   - Password: `Admin@123`

### Test Full Flow
1. Login successfully
2. View dashboard
3. View applications (should see 100 test applications)
4. Create a new application
5. Export CSV
6. Verify everything works

## Part 4: Update Frontend (if needed)

If you need to update the backend URL in frontend:

1. Go to Vercel dashboard
2. Select your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Update `VITE_API_URL` if needed
5. Go to **"Deployments"**
6. Click **"Redeploy"** on the latest deployment

## Your Live URLs

After successful deployment:

- **Frontend**: `https://your-project-frontend.vercel.app`
- **Backend API**: `https://your-project-backend.railway.app`
- **API Docs**: `https://your-project-backend.railway.app/api-docs`

## Troubleshooting

### Backend deployment fails
- Check Railway logs (click service → Logs tab)
- Verify environment variables are set
- Ensure `backend/package.json` exists
- Check for syntax errors in code

### Frontend deployment fails
- Check Vercel logs (click Deployments → View logs)
- Verify `VITE_API_URL` is set correctly
- Ensure `frontend/package.json` exists
- Check for build errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend is running (visit `/api-docs`)
- Check browser console for CORS errors
- Redeploy frontend after updating URL

### Database issues
- Check Railway backend logs
- Verify migrations ran successfully
- Database is created automatically in `backend/data/`

## Monitoring

### Check Backend Status
1. Go to Railway dashboard
2. Click your backend service
3. Go to **"Logs"** tab
4. Look for errors or issues

### Check Frontend Status
1. Go to Vercel dashboard
2. Click your project
3. Go to **"Deployments"**
4. Check latest deployment status

## Next Steps

1. ✅ Backend deployed on Railway
2. ✅ Frontend deployed on Vercel
3. ✅ Both services connected
4. ✅ Test accounts working
5. ✅ 100 test applications visible

**Your application is now live! 🎉**

Share your frontend URL with others to access the application.

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Create an issue in your repository

---

**Deployment complete! Your app is live on the internet.**
