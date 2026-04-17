# MPSEDC Government Scheme Application Tracker

A full-stack web application for managing government scheme applications with role-based access control, workflow management, and comprehensive audit logging.

## 🌟 Features

- **User Authentication**: Secure registration and login with JWT
- **Application Management**: Create, read, update, delete applications
- **Workflow Management**: Draft → Review → Approved status transitions
- **Role-Based Access**: Admin and User roles with different permissions
- **Dashboard**: Real-time statistics and analytics
- **CSV Export**: Export applications data
- **Audit Logging**: Complete transaction history
- **Responsive Design**: Works on desktop and mobile
- **PWA Support**: Install as app on mobile devices

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: SQLite
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **API Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js 20+
- npm 10+
- Git

## 🚀 Local Development

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/mpsedc-scheme-tracker.git
cd mpsedc-scheme-tracker
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
DB_NAME=mpsedc_tracker.db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Application

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Docs: http://localhost:5000/api-docs

## 👤 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin@123 | Admin |
| officer1@example.com | User@123 | User |
| officer2@example.com | User@123 | User |

## 📊 Database Schema

### Users
- id, username, email, password_hash, role, createdAt, updatedAt

### Schemes
- id, name, description, department, createdAt, updatedAt

### Applications
- id, citizenName, citizenAadhaar, schemeId, district, status, createdBy, transitionedAt, transitionedBy, createdAt, updatedAt

### Application Status History
- id, applicationId, fromStatus, toStatus, transitionedBy, transitionedAt

### Audit Logs
- id, userId, userEmail, role, action, resourceType, resourceId, details, ipAddress, createdAt

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Applications
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `PATCH /api/applications/:id/status` - Change status
- `GET /api/applications/export` - Export as CSV

### Schemes
- `GET /api/schemes` - List schemes
- `POST /api/schemes` - Create scheme (Admin only)
- `PUT /api/schemes/:id` - Update scheme (Admin only)
- `DELETE /api/schemes/:id` - Delete scheme (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get statistics (Admin only)

### Audit Logs
- `GET /api/audit-logs` - List audit logs (Admin only)

## 🚢 Deployment

### Quick Deploy to Railway

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "MPSEDC Tracker"
   git push -u origin main
   ```

2. **Deploy Backend**
   - Go to railway.app
   - Create new project from GitHub
   - Set environment variables
   - Deploy

3. **Deploy Frontend**
   - Go to vercel.com
   - Import GitHub repo
   - Set `VITE_API_URL` environment variable
   - Deploy

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for detailed instructions.

## 📁 Project Structure

```
mpsedc-scheme-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── app.js
│   ├── migrations/
│   ├── data/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
├── DEPLOYMENT_GUIDE.md
├── QUICK_DEPLOY.md
├── Dockerfile
└── README.md
```

## 🛠️ Development

### Add New Feature

1. Create feature branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make changes
3. Test locally
4. Commit and push
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

5. Create Pull Request

### Run Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `DB_NAME` - SQLite database filename
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - JWT expiration time
- `NODE_ENV` - Environment (development/production)

### Frontend
- `VITE_API_URL` - Backend API URL

## 🐛 Troubleshooting

### Backend won't start
- Check Node.js version: `node --version`
- Check port 5000 is available
- Check environment variables
- Check logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check backend is running
- Check browser console for errors
- Check CORS settings

### Database issues
- Delete `backend/data/mpsedc_tracker.db` to reset
- Check backend logs for migration errors
- Ensure write permissions on `backend/data/` directory

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Quick Deploy](./QUICK_DEPLOY.md)
- [Pre-Deployment Checklist](./PRE_DEPLOYMENT_CHECKLIST.md)
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- Your Name

## 📞 Support

For issues and questions, please create an issue on GitHub.

---

**Ready to deploy? Check out [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)!**
