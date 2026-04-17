# 🚀 Deploy to Railway NOW

Your code is on GitHub! Follow these steps to deploy.

## Step 1: Deploy Backend on Railway

1. Go to **https://railway.app**
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your repository: **`mpsedc-scheme-tracker`**
5. Railway will auto-detect and create a service
6. Click on the service to open settings
7. Go to **"Settings"** tab
8. Set **Root Directory** to: `backend`
9. Go to **"Variables"** tab
10. Add these environment variables:

```
PORT=5000
DB_NAME=mpsedc_tracker.db
JWT_SECRET=mpsedc-super-secret-key-2024-change-this
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

11. Go to **"Deployments"** tab
12. Click **"Deploy"** button
13. ⏳ Wait 2-5 minutes for deployment
14. ✅ You'll see a green checkmark when done
15. 📋 Copy your backend URL from the **"Domains"** section

**Example backend URL**: `https://mpsedc-backend.railway.app`

---

## Step 2: Deploy Frontend on Vercel

1. Go to **https://vercel.com**
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your repository: **`mpsedc-scheme-tracker`**
5. Click **"Import"**
6. Configure:
   - **Framework Preset**: Select **"Vite"**
   - **Root Directory**: Click **"Edit"** and set to `frontend`
   - **Build Command**: Should be `npm run build`
   - **Output Directory**: Should be `dist`
7. Scroll down to **"Environment Variables"**
8. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-railway-url/api` (replace with your Railway backend URL from Step 1)
9. Click **"Add"**
10. Click **"Deploy"** button
11. ⏳ Wait 2-5 minutes for deployment
12. ✅ You'll see deployment success
13. 📋 Copy your Vercel URL

**Example frontend URL**: `https://mpsedc-frontend.vercel.app`

---

## Step 3: Test Your Live Application

1. Open your **Vercel frontend URL** in browser
2. You should see the login page
3. Login with:
   - **Email**: `admin@example.com`
   - **Password**: `Admin@123`
4. Verify these features work:
   - ✅ Dashboard loads with statistics
   - ✅ Can see 100 applications in the list
   - ✅ Can create a new application
   - ✅ Can export applications as CSV
   - ✅ Can view audit logs (Admin only)
   - ✅ Can view schemes (Admin only)

---

## Your Live URLs

After successful deployment:

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-project-frontend.vercel.app` |
| **Backend API** | `https://your-project-backend.railway.app` |
| **API Documentation** | `https://your-project-backend.railway.app/api-docs` |

---

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin@123 | Admin |
| officer1@example.com | User@123 | User |
| officer2@example.com | User@123 | User |

---

## Troubleshooting

### Backend won't deploy
- Check Railway logs (click service → Logs tab)
- Verify all environment variables are set
- Ensure `backend/package.json` exists

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct in Vercel environment variables
- Check backend is running (visit `/api-docs`)
- Redeploy frontend after updating URL

### Database issues
- Check Railway backend logs
- Database is created automatically
- 100 test applications are pre-populated

---

## Next Steps

1. ✅ Code is on GitHub
2. ⏳ Deploy backend on Railway (5 minutes)
3. ⏳ Deploy frontend on Vercel (5 minutes)
4. ✅ Test your live application
5. 🎉 Share your live URL!

---

**Ready? Start with Step 1 above! 🚀**

**Your repository**: https://github.com/prathmick/mpsedc-scheme-tracker
