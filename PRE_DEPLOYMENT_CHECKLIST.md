# Pre-Deployment Checklist

## Before You Deploy

### Code Quality
- [ ] All features tested locally
- [ ] No console errors
- [ ] No broken links
- [ ] Responsive design verified

### Security
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Remove any hardcoded credentials
- [ ] Enable HTTPS (automatic on Railway/Vercel)
- [ ] Set `NODE_ENV=production`

### Configuration
- [ ] Backend `.env` configured for production
- [ ] Frontend `.env` has correct `VITE_API_URL`
- [ ] Database migrations tested
- [ ] All environment variables documented

### Testing
- [ ] User registration works
- [ ] User login works
- [ ] Create application works
- [ ] View applications works
- [ ] Filter/search works
- [ ] CSV export works
- [ ] Dashboard loads
- [ ] Audit logs visible (Admin only)

### GitHub
- [ ] Code pushed to GitHub
- [ ] `.gitignore` includes `node_modules`, `.env`, `data/`
- [ ] No sensitive data in commits
- [ ] README.md created (optional)

### Deployment
- [ ] Railway account created
- [ ] Vercel account created (if using)
- [ ] GitHub connected to Railway
- [ ] GitHub connected to Vercel (if using)

## Deployment Steps

### Step 1: Backend on Railway
- [ ] Create new Railway project
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Add environment variables
- [ ] Deploy
- [ ] Copy backend URL

### Step 2: Frontend on Vercel
- [ ] Create new Vercel project
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Add `VITE_API_URL` environment variable
- [ ] Deploy
- [ ] Copy frontend URL

### Step 3: Verification
- [ ] Backend API responds (check `/api-docs`)
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login with test account
- [ ] Can create application
- [ ] Can view dashboard
- [ ] Can export CSV

## Post-Deployment

### Monitoring
- [ ] Check Railway logs regularly
- [ ] Monitor Vercel deployment status
- [ ] Set up error alerts (optional)

### Maintenance
- [ ] Keep dependencies updated
- [ ] Monitor database size
- [ ] Regular backups (export CSV)
- [ ] Review audit logs

### Optimization
- [ ] Enable caching headers
- [ ] Optimize images
- [ ] Monitor performance
- [ ] Consider CDN for static assets

## Troubleshooting

### If Backend Won't Start
1. Check Railway logs
2. Verify environment variables
3. Ensure Node.js version is 20+
4. Check for syntax errors

### If Frontend Can't Connect
1. Verify `VITE_API_URL` is correct
2. Check backend is running
3. Look for CORS errors
4. Check network tab in browser

### If Database Issues
1. Check backend logs
2. Verify migrations ran
3. Check file permissions
4. Ensure SQLite is supported

## Success Criteria

✅ Backend running on Railway
✅ Frontend running on Vercel
✅ Can access frontend URL
✅ Can login with test account
✅ Can create and view applications
✅ Dashboard shows statistics
✅ CSV export works
✅ No console errors

## Support Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Node.js Docs: https://nodejs.org/docs
- SQLite Docs: https://www.sqlite.org/docs.html

---

**Ready to deploy? Follow QUICK_DEPLOY.md!**
