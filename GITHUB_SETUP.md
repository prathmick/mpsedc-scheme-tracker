# GitHub Setup Instructions

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `mpsedc-scheme-tracker`
   - **Description**: MPSEDC Government Scheme Application Tracker
   - **Visibility**: Public (or Private if you prefer)
   - **Initialize with**: Leave empty (we already have code)
3. Click **"Create repository"**

## Step 2: Push Code to GitHub

After creating the repository, you'll see instructions. Run these commands:

```bash
cd e:\testingg

git remote remove origin
git remote add origin https://github.com/prathmick/mpsedc-scheme-tracker.git
git branch -M main
git push -u origin main
```

When prompted for password, use your GitHub Personal Access Token (not your password).

## Step 3: Verify

Go to https://github.com/prathmick/mpsedc-scheme-tracker and verify your code is there.

## Step 4: Deploy to Railway

Once code is on GitHub:

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Select `mpsedc-scheme-tracker`
6. Railway will auto-detect and deploy!

---

**Need help?** Follow the Railway deployment guide after pushing to GitHub.
