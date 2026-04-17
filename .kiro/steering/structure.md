# Project Structure & Organization

## Directory Layout

```
mpsedc-scheme-tracker/
├── .kiro/                          # Kiro configuration and specs
│   └── specs/
│       └── mpsedc-scheme-tracker/  # Feature specifications
├── backend/                        # Express.js REST API
│   ├── src/
│   │   ├── app.js                  # Express app setup
│   │   ├── config/
│   │   │   ├── db.js               # Database connection
│   │   │   └── migrate.js          # Migration runner
│   │   ├── controllers/            # HTTP request handlers
│   │   │   ├── authController.js
│   │   │   ├── applicationController.js
│   │   │   ├── schemeController.js
│   │   │   ├── dashboardController.js
│   │   │   └── auditLogController.js
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── rbac.js             # Role-based access control
│   │   │   └── auditLogger.js      # Audit logging
│   │   ├── routes/                 # API route definitions
│   │   │   ├── auth.js
│   │   │   ├── applications.js
│   │   │   ├── schemes.js
│   │   │   ├── dashboard.js
│   │   │   └── auditLogs.js
│   │   ├── services/               # Business logic layer
│   │   │   ├── authService.js
│   │   │   ├── applicationService.js
│   │   │   ├── schemeService.js
│   │   │   ├── dashboardService.js
│   │   │   └── auditService.js
│   │   ├── validators/             # Input validation
│   │   │   ├── authValidator.js
│   │   │   └── applicationValidator.js
│   │   └── utils/                  # Helper utilities
│   │       ├── csvExporter.js      # CSV export logic
│   │       └── workflowStateMachine.js  # Status transition rules
│   ├── migrations/
│   │   └── 001_init.sql            # Database schema
│   ├── data/
│   │   └── mpsedc_tracker.db       # SQLite database file
│   ├── swagger/
│   │   └── swaggerConfig.js        # API documentation config
│   ├── server.js                   # Server entry point
│   ├── package.json
│   └── .env                        # Environment variables
│
├── frontend/                       # React SPA
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Root component
│   │   ├── index.css               # Global styles
│   │   ├── api/
│   │   │   └── axiosInstance.js    # Axios HTTP client
│   │   ├── components/
│   │   │   ├── common/             # Reusable UI components
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── OfflineIndicator.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── dashboard/          # Dashboard-specific components
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── SchemeBarChart.jsx
│   │   │   │   ├── StatusPieChart.jsx
│   │   │   │   └── RecentActivity.jsx
│   │   │   └── layout/             # Layout components
│   │   ├── context/                # React Context for state
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── NotificationContext.jsx  # Notifications
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useApplications.js
│   │   │   ├── useSchemes.js
│   │   │   └── useOnlineStatus.js
│   │   ├── pages/                  # Full-page components (routes)
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ApplicationsPage.jsx
│   │   │   ├── ApplicationFormPage.jsx
│   │   │   ├── ApplicationDetailPage.jsx
│   │   │   ├── SchemesPage.jsx
│   │   │   └── AuditLogPage.jsx
│   │   ├── routes/                 # Route configuration
│   │   └── utils/
│   │       └── formatters.js       # Formatting utilities
│   ├── public/
│   │   └── icons/                  # App icons
│   ├── index.html                  # HTML entry point
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── package.json
│   └── .env                        # Environment variables
│
├── .vscode/                        # VS Code settings
├── .git/                           # Git repository
├── .gitignore
├── package.json                    # Root package.json
├── docker-compose.yml              # Docker Compose config
├── Dockerfile                      # Docker image config
├── Procfile                        # Heroku/Railway deployment
├── README.md                       # Project documentation
├── QUICK_DEPLOY.md                 # Quick deployment guide
├── DEPLOYMENT_GUIDE.md             # Detailed deployment guide
├── DEPLOYMENT_SUMMARY.md           # Deployment summary
├── PRE_DEPLOYMENT_CHECKLIST.md     # Pre-deployment checklist
└── RAILWAY_DEPLOYMENT_STEPS.md     # Railway-specific steps
```

## Key Directories Explained

### Backend (`backend/src/`)

**controllers/** - HTTP request handlers
- Receive requests, call services, return responses
- Handle validation errors and HTTP status codes

**services/** - Business logic layer
- Core application logic
- Database operations
- Workflow state management
- Data transformation and masking

**middleware/** - Express middleware
- `auth.js` - JWT token verification
- `rbac.js` - Role-based access control
- `auditLogger.js` - Log all actions

**routes/** - API endpoint definitions
- Mount controllers to HTTP methods
- Apply middleware (auth, RBAC)

**validators/** - Input validation
- Validate request data before processing
- Return validation errors

**utils/** - Helper functions
- `workflowStateMachine.js` - Status transition rules
- `csvExporter.js` - CSV export functionality

**config/** - Configuration
- `db.js` - Database connection setup
- `migrate.js` - Run migrations

### Frontend (`frontend/src/`)

**pages/** - Full-page components
- Map to routes
- Fetch data and manage page-level state
- Compose smaller components

**components/** - Reusable UI components
- `common/` - Generic components (buttons, dialogs, spinners)
- `dashboard/` - Dashboard-specific components
- `layout/` - Layout wrappers

**context/** - Global state management
- `AuthContext.jsx` - User authentication state
- `NotificationContext.jsx` - Toast notifications

**hooks/** - Custom React hooks
- Encapsulate logic for data fetching
- Manage component state

**api/** - HTTP client setup
- Axios instance with base URL
- Request/response interceptors

**utils/** - Helper functions
- Formatting, parsing, calculations

## Data Flow

### Backend Request Flow
```
HTTP Request
    ↓
Route Handler
    ↓
Middleware (Auth, RBAC, Audit)
    ↓
Controller (Validate, Call Service)
    ↓
Service (Business Logic, DB Operations)
    ↓
Response (JSON)
```

### Frontend Data Flow
```
User Interaction
    ↓
Component/Hook
    ↓
API Call (Axios)
    ↓
Context Update (State)
    ↓
Component Re-render
```

## Important Files

**Backend**
- `backend/server.js` - Entry point, starts Express server
- `backend/src/app.js` - Express app configuration
- `backend/migrations/001_init.sql` - Database schema

**Frontend**
- `frontend/src/main.jsx` - React entry point
- `frontend/src/App.jsx` - Root component with routing
- `frontend/index.html` - HTML template

**Configuration**
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables
- `package.json` - Root scripts for running both apps

## Naming Conventions

**Files**
- Controllers: `*Controller.js`
- Services: `*Service.js`
- Validators: `*Validator.js`
- React components: `PascalCase.jsx`
- Utilities: `camelCase.js`

**Database**
- Tables: lowercase, plural (users, applications)
- Columns: camelCase (citizenName, createdAt)
- Foreign keys: `{table}Id` (userId, schemeId)

**API Routes**
- Resources: `/api/{resource}` (plural)
- Actions: `/api/{resource}/{id}/{action}`
- Status codes: Standard HTTP (200, 201, 400, 401, 404, 422, 500)
