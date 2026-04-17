# Technology Stack & Build System

## Backend

**Runtime & Framework**
- Node.js 20+ (required)
- Express.js 4.18+ - REST API framework
- SQLite 3 - Lightweight relational database

**Authentication & Security**
- jsonwebtoken (JWT) - Token-based authentication
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing

**API Documentation**
- Swagger/OpenAPI - API documentation and testing
- swagger-jsdoc - JSDoc to Swagger conversion
- swagger-ui-express - Interactive API docs UI

**Validation & Utilities**
- express-validator - Input validation middleware
- dotenv - Environment variable management

**Development**
- nodemon - Auto-restart on file changes

## Frontend

**Framework & Build**
- React 18+ - UI library
- Vite 5+ - Build tool and dev server
- React Router v6 - Client-side routing

**Styling & UI**
- Tailwind CSS 3.4+ - Utility-first CSS framework
- PostCSS - CSS processing
- Lucide React - Icon library

**Data Visualization**
- Recharts 2.10+ - React charting library

**HTTP Client**
- Axios 1.6+ - Promise-based HTTP client

**PWA Support**
- vite-plugin-pwa - Progressive Web App plugin

## Common Commands

### Backend

```bash
# Install dependencies
cd backend && npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

### Frontend

```bash
# Install dependencies
cd frontend && npm install

# Start development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

### Root Level

```bash
# Install all dependencies (backend + frontend)
npm run install-all

# Build frontend for production
npm run build

# Start backend server
npm start

# Start backend in dev mode
npm run dev:backend

# Start frontend in dev mode
npm run dev:frontend
```

## Development Environment Setup

**Required Environment Variables**

Backend (`backend/.env`):
```
PORT=5000
DB_NAME=mpsedc_tracker.db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

Frontend (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

## Database

**Type**: SQLite (file-based)
**Location**: `backend/data/mpsedc_tracker.db`
**Migrations**: `backend/migrations/001_init.sql`

**Tables**:
- users - User accounts with roles
- schemes - Government schemes
- applications - Citizen applications
- application_status_history - Status transition audit trail
- audit_logs - Complete action audit log

## Code Style & Conventions

**Backend (Node.js/Express)**
- Use `'use strict';` at top of files
- CommonJS modules (require/module.exports)
- Async/await for asynchronous operations
- Error objects with `.status` property for HTTP status codes
- Service layer pattern for business logic
- Middleware for cross-cutting concerns

**Frontend (React)**
- Functional components with hooks
- ES6 modules (import/export)
- Component organization: common, dashboard, layout, pages
- Context API for state management
- Custom hooks in `src/hooks/`
- Utility functions in `src/utils/`

## Architecture Patterns

**Backend**
- Controllers: Handle HTTP requests/responses
- Services: Business logic and data operations
- Middleware: Authentication, RBAC, audit logging
- Validators: Input validation
- Utils: Helper functions (workflow state machine, CSV export)
- Config: Database and migration setup

**Frontend**
- Pages: Full-page components (routes)
- Components: Reusable UI components
- Context: Global state (Auth, Notifications)
- Hooks: Custom React hooks for logic
- API: Axios instance and configuration
- Utils: Formatting and helper functions

## Deployment

**Backend**: Railway.app or similar Node.js hosting
**Frontend**: Vercel, Netlify, or similar static hosting
**Database**: SQLite (file-based, included in backend)

See deployment guides for detailed instructions.
