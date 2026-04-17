# Quick Deployment to Railway

## 5-Minute Setup

### Step 1: Push to GitHub

```bash
# From your project root
git init
git add .
git commit -m "MPSEDC Scheme Tracker - Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/mpsedc-scheme-tracker.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect and deploy
5. Go to **Settings** → **Environment**
6. Add these variables:
   ```
   PORT=5000
   DB_NAME=mpsedc_tracker.db
   JWT_SECRET=your-super-secret-key-change-this
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   ```
7. Copy your backend URL (e.g., `https://mpsedc-backend.railway.app`)

### Step 3: Deploy Frontend

**Option A: Railway (Simple)**
1. Create another service in same Railway project
2. Set Root Directory to `frontend`
3. Build Command: `npm install && npm run build`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url/api
   ```

**Option B: Vercel (Recommended - Better Performance)**
1. Go to https://vercel.com
2. Click **"Import Project"** → Select your GitHub repo
3. Set Root Directory to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url/api
   ```
5. Deploy

### Step 4: Test

- Open your frontend URL
- Login with: `admin@example.com` / `Admin@123`
- View 100 applications on dashboard
- Export CSV to verify it works

## Your Live URLs

- **Backend API**: `https://your-project-backend.railway.app`
- **Frontend**: `https://your-project-frontend.railway.app` (or Vercel URL)
- **API Docs**: `https://your-project-backend.railway.app/api-docs`

## Environment Variables Reference

### Backend (.env)
```
PORT=5000
DB_NAME=mpsedc_tracker.db
JWT_SECRET=change-this-to-random-string
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-railway-url/api
```

## Test Accounts

- **Admin**: admin@example.com / Admin@123
- **Officer**: officer1@example.com / User@123

## Troubleshooting

**Backend won't start?**
- Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure Node.js version is 20+

**Frontend can't connect to backend?**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Look for CORS errors in browser console

**Database issues?**
- SQLite database is created automatically
- Check backend logs for migration errors

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Test all features
4. ✅ Share your live URL!

---

**Questions?** Check the full DEPLOYMENT_GUIDE.md for detailed instructions.
