# Deployment Guide - Railway

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Railway Account** - Sign up at https://railway.app

## Step 1: Prepare Your Code for Deployment

### 1.1 Create a root `package.json` for the monorepo

```bash
cd e:\testingg
```

Create `package.json` in the root:

```json
{
  "name": "mpsedc-scheme-tracker",
  "version": "1.0.0",
  "description": "MPSEDC Government Scheme Application Tracker",
  "private": true,
  "scripts": {
    "install-all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "build": "cd frontend && npm run build && cd ../backend && npm install --production",
    "start": "cd backend && npm start"
  }
}
```

### 1.2 Create `.gitignore` in root

```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
data/
```

### 1.3 Update `backend/.env` for production

```env
PORT=5000
DB_NAME=mpsedc_tracker.db
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

### 1.4 Update `frontend/.env` for production

```env
VITE_API_URL=https://your-railway-backend-url/api
```

## Step 2: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: MPSEDC Scheme Tracker"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/mpsedc-scheme-tracker.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy Backend on Railway

1. **Go to Railway.app** and sign in
2. **Create a new project** → Select "Deploy from GitHub"
3. **Connect your GitHub repository**
4. **Select the repository** `mpsedc-scheme-tracker`
5. **Configure the service:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Add Environment Variables:**
   - `PORT`: 5000
   - `DB_NAME`: mpsedc_tracker.db
   - `JWT_SECRET`: (use a strong secret)
   - `JWT_EXPIRES_IN`: 24h
   - `NODE_ENV`: production
7. **Deploy** - Railway will automatically deploy

## Step 4: Deploy Frontend on Railway

1. **Create another service** in the same Railway project
2. **Select "Deploy from GitHub"** → Same repository
3. **Configure the service:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` (or use a static host)
4. **Add Environment Variables:**
   - `VITE_API_URL`: https://your-backend-railway-url/api
5. **Deploy**

## Alternative: Deploy Frontend on Vercel (Recommended)

For better performance, deploy frontend on Vercel:

1. **Go to Vercel.com** and sign in with GitHub
2. **Import Project** → Select your repository
3. **Configure:**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - `VITE_API_URL`: https://your-backend-railway-url/api
5. **Deploy**

## Step 5: Get Your URLs

After deployment:

- **Backend URL**: `https://your-project-backend.railway.app`
- **Frontend URL**: `https://your-project-frontend.railway.app` (or Vercel URL)

## Step 6: Update Frontend API URL

Update `frontend/.env` with your actual backend URL:

```env
VITE_API_URL=https://your-project-backend.railway.app/api
```

Then redeploy frontend.

## Step 7: Test the Deployment

1. Open your frontend URL
2. Register a new account
3. Login
4. Create an application
5. View dashboard

## Troubleshooting

### Backend not connecting to database
- Check that `DB_NAME` is set correctly
- Ensure migrations ran successfully (check logs)

### Frontend can't reach backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend

### View Logs
- Go to Railway dashboard
- Click on your service
- View logs in real-time

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Test all features (register, login, create app, export CSV)
- [ ] Monitor logs for errors
- [ ] Set up backups for SQLite database

## Database Backup

Since we're using SQLite, the database file is stored in the container. For production, consider:

1. **Regular exports** via the CSV export feature
2. **Scheduled backups** to cloud storage
3. **Migration to PostgreSQL** for better scalability

---

**Need help?** Check Railway documentation: https://docs.railway.app
