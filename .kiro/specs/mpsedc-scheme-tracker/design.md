# Design Document: MPSEDC Government Scheme Application Tracker

## Overview

The MPSEDC Government Scheme Application Tracker is a full-stack web application for officers of Madhya Pradesh State Electronics Development Corporation (MPSEDC) to manage citizen welfare scheme applications. The system provides secure JWT-based authentication, role-based access control (Admin/User), full CRUD on applications, a 3-stage approval workflow (Draft  Review  Approved), an admin dashboard with statistics and charts, CSV export, audit logging, and Progressive Web App (PWA) support.

**Tech Stack:**
- Backend: Node.js 20, Express 4, MySQL 8.0 (Docker), mysql2, jsonwebtoken, bcryptjs, swagger-jsdoc, swagger-ui-express — plain JavaScript
- Frontend: React 18, Vite 5, Tailwind CSS 3, Recharts, lucide-react, react-router-dom v6, Axios, vite-plugin-pwa — plain JavaScript

---

## Architecture

The system follows a classic client-server architecture with a clear separation between the backend REST API and the frontend SPA.

```
-
                        Client (Browser)                         
  React 18 SPA (Vite 5, Tailwind CSS, Recharts, lucide-react)   
  PWA: vite-plugin-pwa  service worker + manifest.json         
-
                          HTTPS / REST (Axios)
                         
-
                    Backend API (Node.js 20)                     
  Express 4 REST API                                             
   Auth middleware (JWT verification)                         
   RBAC middleware (role enforcement)                         
   Audit log middleware (action capture)                      
   Routes: /api/auth, /api/applications, /api/schemes,       
             /api/dashboard, /api/audit-logs                    
   Swagger UI at /api-docs                                    

                          mysql2 connection pool
                         

                  MySQL 8.0 (Docker Container)                   
  Tables: users, schemes, applications,                          
          application_status_history, audit_logs                 

```

### Key Architectural Decisions

1. **Stateless JWT authentication** — no server-side sessions; the JWT payload carries `userId`, `email`, and `role`.
2. **Connection pooling** — `mysql2/promise` pool with configurable `connectionLimit` to handle concurrent requests efficiently.
3. **Middleware pipeline** — Express middleware chain: `cors  json parser  auth  rbac  route handler  audit logger  error handler`.
4. **Audit logging as middleware** — a post-route middleware captures the result of mutating operations and writes to `audit_logs` asynchronously (fire-and-forget, non-blocking).
5. **Frontend state via React Context** — `AuthContext` for auth state, `NotificationContext` for toast messages; no Redux needed given the scope.
6. **PWA via vite-plugin-pwa** — Workbox-based service worker generated at build time; caches app shell for offline access.

---

## Components and Interfaces

### Directory / Folder Structure

#### Backend (`/backend`)

```
backend/
 src/
    config/
       db.js                  # mysql2 pool creation & connection test
    middleware/
       auth.js                # JWT verification middleware
       rbac.js                # Role-based access control middleware
       auditLogger.js         # Audit log capture middleware
    routes/
       auth.js                # POST /api/auth/register, /api/auth/login
       applications.js        # CRUD + status + export endpoints
       schemes.js             # Scheme CRUD endpoints
       dashboard.js           # GET /api/dashboard/stats
       auditLogs.js           # GET /api/audit-logs
    controllers/
       authController.js
       applicationController.js
       schemeController.js
       dashboardController.js
       auditLogController.js
    services/
       authService.js         # Password hashing, JWT signing
       applicationService.js  # Business logic, workflow transitions
       schemeService.js
       auditService.js        # Audit log write helper
    validators/
       authValidator.js       # express-validator rules for auth
       applicationValidator.js
    utils/
       csvExporter.js         # CSV generation logic
       workflowStateMachine.js # Transition table & validation
    app.js                     # Express app setup, route mounting
 migrations/
    001_init.sql               # CREATE TABLE + seed data
 swagger/
    swaggerConfig.js           # swagger-jsdoc options
 .env.example
 .env
 package.json
 server.js                      # Entry point: starts HTTP server
```

#### Frontend (`/frontend`)

```
frontend/
 public/
    icons/                     # PWA icons (192x192, 512x512)
    favicon.ico
 src/
    api/
       axiosInstance.js       # Axios instance with base URL + interceptors
    context/
       AuthContext.jsx        # Auth state, login/logout helpers
       NotificationContext.jsx # Toast notification state
    components/
       layout/
          Navbar.jsx
          Sidebar.jsx
          Layout.jsx
       common/
          StatusBadge.jsx    # Color-coded status chip
          Pagination.jsx
          LoadingSpinner.jsx
          OfflineIndicator.jsx
          ConfirmDialog.jsx
       dashboard/
           StatCard.jsx
           SchemeBarChart.jsx
           StatusPieChart.jsx
           RecentActivity.jsx
    pages/
       LoginPage.jsx
       RegisterPage.jsx
       ApplicationsPage.jsx   # List + filter + pagination
       ApplicationDetailPage.jsx
       ApplicationFormPage.jsx # Create / Edit form
       SchemesPage.jsx
       DashboardPage.jsx
       AuditLogPage.jsx
    routes/
       ProtectedRoute.jsx     # Redirects unauthenticated users
       AdminRoute.jsx         # Redirects non-admin users
    hooks/
       useApplications.js
       useSchemes.js
       useOnlineStatus.js     # navigator.onLine + event listeners
    utils/
       formatters.js          # Date, Aadhaar masking helpers
    App.jsx                    # Router setup
    main.jsx                   # React DOM render + SW registration
 index.html
 vite.config.js                 # Vite + vite-plugin-pwa config
 tailwind.config.js
 postcss.config.js
 package.json
```

### Authentication & RBAC Middleware

#### `auth.js` — JWT Verification

```js
// Extracts Bearer token from Authorization header,
// verifies with jsonwebtoken, attaches decoded payload to req.user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

#### `rbac.js` — Role Enforcement

```js
// Factory: requireRole('Admin') returns middleware that checks req.user.role
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};
```

#### `auditLogger.js` — Audit Capture

The audit logger is attached as a post-handler middleware on mutating routes. It reads `req.auditPayload` (set by the controller) and writes to `audit_logs` asynchronously:

```js
const auditLogger = async (req, res, next) => {
  res.on('finish', async () => {
    if (req.auditPayload && res.statusCode < 400) {
      await auditService.log({
        userId: req.user?.id,
        userEmail: req.user?.email,
        role: req.user?.role,
        ...req.auditPayload,
        ipAddress: req.ip,
      });
    }
  });
  next();
};
```

Controllers set `req.auditPayload` before calling `next()` or sending a response:

```js
req.auditPayload = {
  action: 'CREATE_APPLICATION',
  resourceType: 'application',
  resourceId: newApp.id,
  details: { citizenName, schemeId, district },
};
```

### Workflow State Machine

The approval workflow is encoded as a pure transition table in `workflowStateMachine.js`:

```js
const TRANSITIONS = {
  Draft:   { User: ['Review'],            Admin: ['Review'] },
  Review:  { User: [],                    Admin: ['Approved', 'Draft'] },
  Approved:{ User: [],                    Admin: [] },
};

function isValidTransition(currentStatus, targetStatus, role) {
  const allowed = TRANSITIONS[currentStatus]?.[role] ?? [];
  return allowed.includes(targetStatus);
}

function getAllowedTransitions(currentStatus, role) {
  return TRANSITIONS[currentStatus]?.[role] ?? [];
}
```

This pure function is the single source of truth for workflow logic, making it straightforward to unit-test and property-test.

### Frontend Component Hierarchy and Routing

```
App.jsx
 BrowserRouter
     /login               LoginPage
     /register            RegisterPage
     ProtectedRoute (requires auth)
         Layout (Navbar + Sidebar)
             /                    redirect to /applications
             /applications        ApplicationsPage
             /applications/new    ApplicationFormPage
             /applications/:id    ApplicationDetailPage
             /applications/:id/edit  ApplicationFormPage
             AdminRoute (requires Admin role)
                /dashboard       DashboardPage
                /schemes         SchemesPage
                /audit-logs      AuditLogPage
             *                    redirect to /applications
```

#### `ProtectedRoute.jsx`

```jsx
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};
```

#### `AdminRoute.jsx`

```jsx
const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/applications" replace />;
  return children;
};
```

### State Management

**`AuthContext`** — stores `{ user, token }`, exposes `login(token)` and `logout()`. Token is persisted to `localStorage`. On app load, the context reads from `localStorage` and validates the token expiry client-side.

**`NotificationContext`** — stores a queue of `{ id, type, message }` toast notifications. Components call `notify('success', 'Application created')` to push a notification.

**Axios Instance** (`axiosInstance.js`) — configured with `baseURL` from `VITE_API_URL`. A request interceptor attaches the JWT from `localStorage`. A response interceptor handles 401 (auto-logout) and 403 (redirect) globally.

### Admin Dashboard Design

`DashboardPage` fetches `GET /api/dashboard/stats` on mount and renders:

1. **StatCard  4** — Total, Draft, Review, Approved counts. Each card shows an icon (lucide-react), count, and label.
2. **SchemeBarChart** — Recharts `BarChart` with `XAxis` (scheme names), `YAxis` (count), `Tooltip`, `Bar`. Data: `stats.byScheme`.
3. **StatusPieChart** — Recharts `PieChart` with `Pie`, `Cell` (gray/yellow/green), `Legend`, `Tooltip`. Data: `stats.byStatus`.
4. **RecentActivity** — A list of the 10 most recently updated applications showing citizen name, scheme, status badge, and relative timestamp.

### PWA Setup

`vite.config.js` uses `vite-plugin-pwa`:

```js
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'MPSEDC Scheme Tracker',
    short_name: 'SchemeTracker',
    start_url: '/',
    display: 'standalone',
    theme_color: '#1e40af',
    background_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/api\/schemes/,
        handler: 'NetworkFirst',
        options: { cacheName: 'api-schemes' },
      },
    ],
  },
})
```

`OfflineIndicator.jsx` uses the `useOnlineStatus` hook (listens to `window.online`/`offline` events) to display a banner when the device is offline.

### CSV Export Design

`GET /api/applications/export` (Admin only):

1. Controller queries all applications with a JOIN to `schemes` and `users` tables.
2. Aadhaar is masked: `XXXX-XXXX-` + last 4 digits.
3. `csvExporter.js` uses Node.js built-in string concatenation (no external CSV library needed) to build the CSV string with proper comma-escaping and a header row.
4. Response headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="applications_export.csv"`.
5. Frontend: Admin-only "Export CSV" button calls `axiosInstance.get('/applications/export', { responseType: 'blob' })` and triggers a browser download via a temporary `<a>` element.

### Swagger / OpenAPI Setup

`swagger/swaggerConfig.js`:

```js
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'MPSEDC Scheme Tracker API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};
module.exports = swaggerJsdoc(options);
```

Mounted in `app.js`:
```js
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

All route files include JSDoc `@swagger` annotations defining request bodies, parameters, and response schemas.

---

## Data Models

### Entity Relationship Diagram

```
users
  id (PK)
  username
  email (UNIQUE)
  password_hash
  role  ENUM('Admin','User')
  createdAt
  updatedAt

schemes
  id (PK)
  name
  description
  department
  createdAt
  updatedAt

applications
  id (PK)
  citizenName
  citizenAadhaar
  schemeId (FK  schemes.id)
  district
  status  ENUM('Draft','Review','Approved')
  createdBy (FK  users.id)
  transitionedAt
  transitionedBy (FK  users.id, nullable)
  createdAt
  updatedAt

application_status_history
  id (PK)
  applicationId (FK  applications.id)
  fromStatus
  toStatus
  transitionedBy (FK  users.id)
  transitionedAt

audit_logs
  id (PK)
  userId (FK  users.id, nullable for pre-auth actions)
  userEmail
  role
  action
  resourceType
  resourceId
  details  JSON
  ipAddress
  createdAt
```

### SQL Table Definitions (`migrations/001_init.sql`)

```sql
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
  createdAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schemes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  department  VARCHAR(200),
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  citizenName     VARCHAR(200) NOT NULL,
  citizenAadhaar  VARCHAR(12) NOT NULL,
  schemeId        INT NOT NULL,
  district        VARCHAR(100) NOT NULL,
  status          ENUM('Draft', 'Review', 'Approved') NOT NULL DEFAULT 'Draft',
  createdBy       INT NOT NULL,
  transitionedAt  DATETIME,
  transitionedBy  INT,
  createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (schemeId)       REFERENCES schemes(id),
  FOREIGN KEY (createdBy)      REFERENCES users(id),
  FOREIGN KEY (transitionedBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS application_status_history (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  applicationId   INT NOT NULL,
  fromStatus      ENUM('Draft', 'Review', 'Approved') NOT NULL,
  toStatus        ENUM('Draft', 'Review', 'Approved') NOT NULL,
  transitionedBy  INT NOT NULL,
  transitionedAt  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicationId)  REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (transitionedBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  userId       INT,
  userEmail    VARCHAR(255),
  role         VARCHAR(50),
  action       VARCHAR(100) NOT NULL,
  resourceType VARCHAR(100),
  resourceId   VARCHAR(100),
  details      JSON,
  ipAddress    VARCHAR(45),
  createdAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed schemes
INSERT INTO schemes (name, description, department) VALUES
  ('PM Kisan', 'Income support for farmers', 'Agriculture'),
  ('Ladli Behna', 'Financial assistance for women', 'Women & Child Development'),
  ('Ayushman Bharat', 'Health insurance for poor families', 'Health'),
  ('PM Awas Yojana', 'Housing for all scheme', 'Housing'),
  ('Sambal Yojana', 'Unorganised worker welfare', 'Labour');
```

---

## API Design

### Base URL: `/api`

All protected endpoints require `Authorization: Bearer <token>` header.

### Authentication Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/auth/register` | No | — | Register new user |
| POST | `/auth/login` | No | — | Login, receive JWT |

**POST /auth/register**
```json
// Request
{ "username": "officer1", "email": "officer@mp.gov.in", "password": "Secret123!", "role": "User" }

// Response 201
{ "message": "User registered successfully", "userId": 1 }

// Response 409
{ "message": "Email already registered" }

// Response 400
{ "errors": [{ "field": "email", "message": "Invalid email format" }] }
```

**POST /auth/login**
```json
// Request
{ "email": "officer@mp.gov.in", "password": "Secret123!" }

// Response 200
{ "token": "<jwt>", "user": { "id": 1, "username": "officer1", "email": "...", "role": "User" } }

// Response 401
{ "message": "Invalid email or password" }
```

### Application Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/applications` | Yes | Any | List applications (paginated, filtered) |
| POST | `/applications` | Yes | Any | Create application |
| GET | `/applications/export` | Yes | Admin | Export CSV |
| GET | `/applications/:id` | Yes | Any | Get single application |
| PUT | `/applications/:id` | Yes | Any | Update application |
| DELETE | `/applications/:id` | Yes | Any | Delete application |
| PATCH | `/applications/:id/status` | Yes | Any | Transition status |

**GET /applications** — Query params: `page` (default 1), `limit` (default 10), `schemeId`, `status`, `district`, `search`, `sortBy` (`createdAt`|`updatedAt`), `order` (`asc`|`desc`)

```json
// Response 200
{
  "data": [
    {
      "id": 1, "citizenName": "Ramesh Kumar", "citizenAadhaar": "XXXX-XXXX-1234",
      "schemeId": 1, "schemeName": "PM Kisan", "district": "Bhopal",
      "status": "Draft", "createdBy": 2, "officerName": "officer1",
      "createdAt": "2024-01-15T10:00:00Z", "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}
```

**POST /applications**
```json
// Request
{ "citizenName": "Ramesh Kumar", "citizenAadhaar": "123456789012", "schemeId": 1, "district": "Bhopal" }

// Response 201
{ "message": "Application created", "application": { "id": 1, "status": "Draft", ... } }
```

**PATCH /applications/:id/status**
```json
// Request
{ "status": "Review" }

// Response 200
{ "message": "Status updated", "application": { "id": 1, "status": "Review", ... } }

// Response 422 (invalid transition)
{ "message": "Invalid transition from Approved. Valid transitions: none" }

// Response 403 (User attempting Admin-only transition)
{ "message": "Forbidden: insufficient role for this transition" }
```

**DELETE /applications/:id**
```json
// Response 422 (non-Draft)
{ "message": "Only Draft applications can be deleted" }
```

### Scheme Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/schemes` | Yes | Any | List all schemes |
| POST | `/schemes` | Yes | Admin | Create scheme |
| PUT | `/schemes/:id` | Yes | Admin | Update scheme |
| DELETE | `/schemes/:id` | Yes | Admin | Delete scheme |

**DELETE /schemes/:id**
```json
// Response 422 (has applications)
{ "message": "Cannot delete scheme with existing applications" }
```

### Dashboard Endpoint

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/dashboard/stats` | Yes | Admin | Aggregate statistics |

```json
// Response 200
{
  "total": 120,
  "byStatus": { "Draft": 45, "Review": 30, "Approved": 45 },
  "byScheme": [
    { "schemeName": "PM Kisan", "count": 40 },
    { "schemeName": "Ladli Behna", "count": 35 }
  ],
  "byDistrict": [
    { "district": "Bhopal", "count": 25 }
  ],
  "recentActivity": [
    { "id": 1, "citizenName": "Ramesh Kumar", "schemeName": "PM Kisan", "status": "Review", "updatedAt": "..." }
  ]
}
```

### Audit Log Endpoint

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/audit-logs` | Yes | Admin | Paginated audit log |

Query params: `page`, `limit`, `userId`, `action`, `resourceType`, `startDate`, `endDate`

```json
// Response 200
{
  "data": [
    {
      "id": 1, "userId": 2, "userEmail": "officer@mp.gov.in", "role": "User",
      "action": "CREATE_APPLICATION", "resourceType": "application", "resourceId": "5",
      "details": { "citizenName": "Ramesh Kumar" }, "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 300, "totalPages": 15 }
}
```

---

## Docker Compose Setup

`docker-compose.yml`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: mpsedc_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/migrations/001_init.sql:/docker-entrypoint-initdb.d/001_init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

## Environment Variables (`.env.example`)

```
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mpsedc_tracker
DB_USER=mpsedc_user
DB_PASSWORD=mpsedc_pass
DB_ROOT_PASSWORD=rootpassword
DB_CONNECTION_LIMIT=10

# Auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Frontend (Vite)
VITE_API_URL=http://localhost:5000/api
```

