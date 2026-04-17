# Implementation Plan: MPSEDC Government Scheme Application Tracker

## Overview

Implement the full-stack MPSEDC Scheme Tracker incrementally: infrastructure and database first, then the Express backend (auth, CRUD, workflow, dashboard, audit), then the React frontend (routing, pages, PWA), finishing with integration wiring and end-to-end validation.

All code is plain JavaScript — no TypeScript.

---

## Tasks

- [x] 1. Project scaffolding and infrastructure setup
  - [x] 1.1 Create root monorepo structure with `backend/` and `frontend/` directories
    - Create `backend/package.json` with dependencies: `express`, `mysql2`, `jsonwebtoken`, `bcryptjs`, `swagger-jsdoc`, `swagger-ui-express`, `cors`, `dotenv`, `express-validator`
    - Create `frontend/package.json` with dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `recharts`, `lucide-react`; devDependencies: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `vite-plugin-pwa`
    - Create root `.gitignore` covering `node_modules`, `.env`, `dist`
    - _Requirements: 11.1, 11.6_

  - [x] 1.2 Create `docker-compose.yml` for MySQL 8.0
    - Define `mysql` service using `mysql:8.0` image with env vars `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
    - Expose port `${DB_PORT:-3306}:3306`
    - Mount `./backend/migrations/001_init.sql` to `/docker-entrypoint-initdb.d/001_init.sql`
    - Add named volume `mysql_data` and healthcheck (`mysqladmin ping`)
    - _Requirements: 11.1_

  - [x] 1.3 Create `backend/.env.example` and `backend/.env`
    - Document all variables: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`, `DB_CONNECTION_LIMIT`, `JWT_SECRET`, `JWT_EXPIRES_IN`
    - _Requirements: 11.6_

  - [x] 1.4 Create SQL migration script `backend/migrations/001_init.sql`
    - `CREATE TABLE IF NOT EXISTS` for `users`, `schemes`, `applications`, `application_status_history`, `audit_logs` with all columns, constraints, and foreign keys as defined in the design
    - Seed 5 schemes: PM Kisan, Ladli Behna, Ayushman Bharat, PM Awas Yojana, Sambal Yojana
    - _Requirements: 11.2, 11.3, 11.4, 12.1, 4.6_

- [x] 2. Backend core: Express app, DB pool, and middleware
  - [x] 2.1 Create `backend/src/config/db.js` — mysql2 connection pool
    - Use `mysql2/promise` `createPool` with env-driven config (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_CONNECTION_LIMIT`)
    - Export pool and a `testConnection()` function that logs success on startup
    - _Requirements: 11.5_

  - [x] 2.2 Create `backend/src/app.js` — Express app setup
    - Apply middleware: `cors`, `express.json()`, error handler
    - Mount route stubs at `/api/auth`, `/api/applications`, `/api/schemes`, `/api/dashboard`, `/api/audit-logs`
    - Mount Swagger UI at `/api-docs`
    - _Requirements: 8.1, 8.4_

  - [x] 2.3 Create `backend/server.js` — HTTP server entry point
    - Call `testConnection()`, then `app.listen(PORT)` with startup log
    - _Requirements: 11.5_

  - [x] 2.4 Create `backend/src/middleware/auth.js` — JWT verification middleware
    - Extract Bearer token from `Authorization` header
    - Verify with `jsonwebtoken` using `JWT_SECRET`; attach decoded payload to `req.user`
    - Return HTTP 401 if token is missing or invalid
    - _Requirements: 2.1, 2.2_

  - [x] 2.5 Create `backend/src/middleware/rbac.js` — role enforcement middleware
    - Export `requireRole(...roles)` factory that checks `req.user.role`
    - Return HTTP 403 if role not in allowed list
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 2.6 Create `backend/src/middleware/auditLogger.js` — audit capture middleware
    - Listen to `res.on('finish')` and write `req.auditPayload` to `audit_logs` via `auditService.log()` when `statusCode < 400`
    - Fire-and-forget (non-blocking)
    - _Requirements: 12.2, 12.3_

- [x] 3. Backend: Authentication
  - [x] 3.1 Create `backend/src/services/authService.js`
    - `hashPassword(plain)` using `bcryptjs.hash` with salt rounds 10
    - `comparePassword(plain, hash)` using `bcryptjs.compare`
    - `signToken(payload)` using `jsonwebtoken.sign` with `JWT_SECRET` and `JWT_EXPIRES_IN`
    - _Requirements: 1.2, 1.5_

  - [x] 3.2 Create `backend/src/validators/authValidator.js`
    - `express-validator` chains for register (username, email, password, role) and login (email, password)
    - Return HTTP 400 with field-level errors on failure
    - _Requirements: 1.7_

  - [x] 3.3 Create `backend/src/controllers/authController.js`
    - `register`: check duplicate email (HTTP 409), hash password, insert user, set `req.auditPayload` for `REGISTER`
    - `login`: lookup user by email, compare password (HTTP 401 on failure), sign JWT, set `req.auditPayload` for `LOGIN`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 3.4 Create `backend/src/routes/auth.js` with Swagger JSDoc annotations
    - `POST /api/auth/register` → validator → controller → auditLogger
    - `POST /api/auth/login` → validator → controller → auditLogger
    - Annotate with `@swagger` tags: request body, 200/201/400/401/409 responses, no auth required
    - _Requirements: 1.1, 1.4, 8.2_

- [x] 4. Backend: Scheme management
  - [x] 4.1 Create `backend/src/services/schemeService.js`
    - `getAllSchemes()`, `createScheme(data)`, `updateScheme(id, data)`, `deleteScheme(id)`
    - `deleteScheme` checks for associated applications and throws if any exist
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 Create `backend/src/controllers/schemeController.js`
    - Map service calls to HTTP responses; set `req.auditPayload` for `CREATE_SCHEME`, `UPDATE_SCHEME`, `DELETE_SCHEME`
    - Return HTTP 422 when deleting a scheme with existing applications
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 12.2_

  - [x] 4.3 Create `backend/src/routes/schemes.js` with Swagger JSDoc annotations
    - `GET /api/schemes` → auth middleware → controller
    - `POST /api/schemes` → auth → requireRole('Admin') → controller → auditLogger
    - `PUT /api/schemes/:id` → auth → requireRole('Admin') → controller → auditLogger
    - `DELETE /api/schemes/:id` → auth → requireRole('Admin') → controller → auditLogger
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.2_

- [x] 5. Backend: Workflow state machine and application service
  - [x] 5.1 Create `backend/src/utils/workflowStateMachine.js`
    - Define `TRANSITIONS` table: `Draft→Review` (User+Admin), `Review→Approved` (Admin), `Review→Draft` (Admin)
    - Export `isValidTransition(currentStatus, targetStatus, role)` and `getAllowedTransitions(currentStatus, role)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write unit tests for workflowStateMachine.js
    - Test all valid transitions return `true`
    - Test all invalid transitions return `false`
    - Test User role cannot perform Admin-only transitions
    - Test `getAllowedTransitions` returns correct arrays per status/role
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 5.3 Create `backend/src/services/applicationService.js`
    - `listApplications(filters, pagination, user)` — apply role scoping (User sees own, Admin sees all), filtering by `schemeId`/`status`/`district`/`search`, sorting, pagination; JOIN with `schemes` and `users`
    - `getApplicationById(id, user)` — role-scoped fetch; throw 404 if not found
    - `createApplication(data, userId)` — insert with `status: 'Draft'`
    - `updateApplication(id, data, user)` — throw 422 if status is `Approved`
    - `deleteApplication(id, user)` — throw 422 if status is not `Draft`
    - `transitionStatus(id, targetStatus, user)` — call `isValidTransition`, throw 422 on invalid; update `status`, `transitionedAt`, `transitionedBy`; insert into `application_status_history`
    - _Requirements: 3.1–3.13, 5.1–5.6_

  - [x] 5.4 Create `backend/src/controllers/applicationController.js`
    - Map service calls to HTTP responses for all application endpoints
    - Set `req.auditPayload` for `CREATE_APPLICATION`, `UPDATE_APPLICATION`, `DELETE_APPLICATION`, `STATUS_TRANSITION`
    - _Requirements: 3.1–3.13, 5.6, 12.2_

  - [x] 5.5 Create `backend/src/validators/applicationValidator.js`
    - Validate `citizenName`, `citizenAadhaar` (12 digits), `schemeId` (integer), `district` on create/update
    - Validate `status` field on status transition endpoint
    - _Requirements: 3.2_

  - [x] 5.6 Create `backend/src/utils/csvExporter.js`
    - `generateCsv(applications)` — build CSV string with header row and rows for all applications
    - Mask Aadhaar: replace first 8 digits with `XXXX-XXXX-`, keep last 4
    - Escape commas and quotes in field values
    - _Requirements: 7.1, 7.2_

  - [x] 5.7 Create `backend/src/routes/applications.js` with Swagger JSDoc annotations
    - Mount all application endpoints with correct auth/rbac middleware and auditLogger
    - `GET /api/applications/export` must be defined before `GET /api/applications/:id` to avoid route conflict
    - Annotate all endpoints with `@swagger` tags including query params, request bodies, and all response schemas
    - _Requirements: 3.1–3.13, 5.1, 7.1, 7.3, 8.2_

- [x] 6. Backend: Audit service and audit log endpoint
  - [x] 6.1 Create `backend/src/services/auditService.js`
    - `log({ userId, userEmail, role, action, resourceType, resourceId, details, ipAddress })` — insert into `audit_logs`
    - `listAuditLogs(filters, pagination)` — paginated query with optional filters: `userId`, `action`, `resourceType`, `startDate`, `endDate`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 6.2 Create `backend/src/controllers/auditLogController.js` and `backend/src/routes/auditLogs.js`
    - `GET /api/audit-logs` → auth → requireRole('Admin') → controller
    - Return HTTP 403 for non-Admin users
    - Annotate with `@swagger` tags
    - _Requirements: 12.4, 12.5, 12.6, 8.2_

- [x] 7. Backend: Dashboard endpoint
  - [x] 7.1 Create `backend/src/services/dashboardService.js` and `backend/src/controllers/dashboardController.js`
    - Query aggregate counts: total, by status, by scheme (JOIN), by district
    - Query 10 most recently updated applications for `recentActivity`
    - _Requirements: 6.1_

  - [x] 7.2 Create `backend/src/routes/dashboard.js` with Swagger JSDoc annotations
    - `GET /api/dashboard/stats` → auth → requireRole('Admin') → controller
    - _Requirements: 6.1, 8.2_

- [x] 8. Backend: Swagger configuration
  - [x] 8.1 Create `backend/swagger/swaggerConfig.js`
    - Configure `swagger-jsdoc` with OpenAPI 3.0, `bearerAuth` security scheme, `apis: ['./src/routes/*.js']`
    - Mount in `app.js`: `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))`
    - _Requirements: 8.1, 8.3, 8.4_

- [x] 9. Backend checkpoint
  - Ensure all backend routes respond correctly, DB migrations run cleanly via Docker, and Swagger UI loads at `/api-docs`. Ask the user if questions arise.

- [x] 10. Frontend: Project setup and configuration
  - [x] 10.1 Configure Vite with React plugin and Tailwind CSS
    - Create `frontend/vite.config.js` with `@vitejs/plugin-react` and `vite-plugin-pwa` (manifest + Workbox config as per design)
    - Create `frontend/tailwind.config.js` and `frontend/postcss.config.js`
    - Create `frontend/index.html` with root div and script entry
    - _Requirements: 9.5_

  - [x] 10.2 Create `frontend/src/api/axiosInstance.js`
    - Configure `baseURL` from `import.meta.env.VITE_API_URL`
    - Request interceptor: attach JWT from `localStorage`
    - Response interceptor: handle 401 (clear token, redirect to `/login`) and 403 globally
    - _Requirements: 2.7_

  - [x] 10.3 Create `frontend/src/context/AuthContext.jsx`
    - Store `{ user, token }` state; read from `localStorage` on mount with client-side expiry check
    - Expose `login(token)` (decode JWT payload, set state + localStorage) and `logout()` (clear state + localStorage)
    - _Requirements: 2.6, 2.7_

  - [x] 10.4 Create `frontend/src/context/NotificationContext.jsx`
    - Store toast queue `[{ id, type, message }]`
    - Expose `notify(type, message)` to push notifications; auto-dismiss after 4 seconds
    - _Requirements: (cross-cutting UX)_

- [x] 11. Frontend: Layout and routing
  - [x] 11.1 Create `frontend/src/routes/ProtectedRoute.jsx` and `frontend/src/routes/AdminRoute.jsx`
    - `ProtectedRoute`: redirect to `/login` if no authenticated user
    - `AdminRoute`: redirect to `/applications` if role is not `Admin`
    - _Requirements: 2.6, 2.7_

  - [x] 11.2 Create `frontend/src/components/layout/Navbar.jsx`, `Sidebar.jsx`, and `Layout.jsx`
    - Navbar: app title, user info, logout button
    - Sidebar: navigation links; hide Dashboard, Schemes, Audit Log links for `User` role
    - Layout: wraps pages with Navbar + Sidebar
    - _Requirements: 2.6_

  - [x] 11.3 Create `frontend/src/App.jsx` with full route tree
    - Public routes: `/login`, `/register`
    - Protected routes under `Layout`: `/applications`, `/applications/new`, `/applications/:id`, `/applications/:id/edit`
    - Admin-only routes: `/dashboard`, `/schemes`, `/audit-logs`
    - Catch-all redirect to `/applications`
    - _Requirements: 2.6, 2.7_

  - [x] 11.4 Create `frontend/src/main.jsx`
    - Render `<App />` wrapped in `AuthContext` and `NotificationContext` providers
    - Register service worker via `vite-plugin-pwa` virtual module
    - _Requirements: 9.2, 9.3_

- [x] 12. Frontend: Common components
  - [x] 12.1 Create `frontend/src/components/common/StatusBadge.jsx`
    - Render color-coded chip: Draft (gray), Review (yellow/amber), Approved (green)
    - _Requirements: 5.7_

  - [x] 12.2 Create `frontend/src/components/common/Pagination.jsx`
    - Accept `page`, `totalPages`, `onPageChange` props; render prev/next and page number buttons
    - _Requirements: 10.3_

  - [x] 12.3 Create `frontend/src/components/common/LoadingSpinner.jsx` and `ConfirmDialog.jsx`
    - `LoadingSpinner`: centered spinner for async loading states
    - `ConfirmDialog`: modal with confirm/cancel for destructive actions
    - _Requirements: 6.7_

  - [x] 12.4 Create `frontend/src/components/common/OfflineIndicator.jsx` and `frontend/src/hooks/useOnlineStatus.js`
    - `useOnlineStatus`: listen to `window` `online`/`offline` events, return boolean
    - `OfflineIndicator`: display a banner when offline
    - _Requirements: 9.4_

  - [x] 12.5 Create `frontend/src/utils/formatters.js`
    - `formatDate(isoString)` — human-readable date/time
    - `maskAadhaar(aadhaar)` — `XXXX-XXXX-{last4}`
    - `formatRelativeTime(isoString)` — relative timestamp (e.g., "2 hours ago")
    - _Requirements: 7.2, 12.8_

- [x] 13. Frontend: Authentication pages
  - [x] 13.1 Create `frontend/src/pages/LoginPage.jsx`
    - Form with email and password fields; call `POST /api/auth/login` via axiosInstance
    - On success: call `AuthContext.login(token)`, redirect to `/applications`
    - Show error message on 401
    - _Requirements: 1.4, 1.6_

  - [x] 13.2 Create `frontend/src/pages/RegisterPage.jsx`
    - Form with username, email, password, role (select: Admin/User)
    - Call `POST /api/auth/register`; show success and redirect to `/login`
    - Show field-level errors on 400, duplicate error on 409
    - _Requirements: 1.1, 1.3, 1.7_

- [x] 14. Frontend: Applications list page
  - [x] 14.1 Create `frontend/src/hooks/useApplications.js`
    - Encapsulate `GET /api/applications` with filter/pagination params
    - Expose `applications`, `pagination`, `loading`, `error`, `refetch`
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 14.2 Create `frontend/src/pages/ApplicationsPage.jsx`
    - Render paginated table with columns: Citizen Name, Scheme, District, Status (StatusBadge), Created Date, Actions (lucide-react icons: Eye, Edit, Trash2)
    - Filter controls for Scheme (select), Status (select), District (input); reset to page 1 on filter change
    - Search input for citizen name
    - Admin-only "Export CSV" button: call `/api/applications/export` with `responseType: 'blob'` and trigger download
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 7.4_

- [x] 15. Frontend: Application detail and form pages
  - [x] 15.1 Create `frontend/src/pages/ApplicationDetailPage.jsx`
    - Fetch application by ID; display all fields with `StatusBadge`
    - Render workflow action buttons contextually:
      - User + Draft: "Submit for Review" button
      - Admin + Review: "Approve" and "Return to Draft" buttons
      - Admin + Approved: no action buttons
    - Call `PATCH /api/applications/:id/status` on button click; refetch on success
    - _Requirements: 5.7, 5.8_

  - [x] 15.2 Create `frontend/src/pages/ApplicationFormPage.jsx` (create and edit)
    - Form fields: Citizen Name, Citizen Aadhaar (12-digit input), Scheme (select from `GET /api/schemes`), District
    - On create: `POST /api/applications`; on edit: `PUT /api/applications/:id`
    - Disable form and show message if application status is `Approved`
    - _Requirements: 3.1, 3.2, 3.8, 3.9_

- [ ] 16. Frontend: Schemes page (Admin)
  - [ ] 16.1 Create `frontend/src/hooks/useSchemes.js` and `frontend/src/pages/SchemesPage.jsx`
    - List all schemes in a table with Name, Description, Department columns
    - Admin-only Add/Edit/Delete actions using lucide-react icons
    - Inline or modal form for create/edit; confirm dialog before delete
    - Show 422 error message when deleting a scheme with applications
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 17. Frontend: Admin Dashboard page
  - [x] 17.1 Create dashboard chart components
    - `frontend/src/components/dashboard/StatCard.jsx`: icon (lucide-react), count, label
    - `frontend/src/components/dashboard/SchemeBarChart.jsx`: Recharts `BarChart` with `XAxis`, `YAxis`, `Tooltip`, `Bar`
    - `frontend/src/components/dashboard/StatusPieChart.jsx`: Recharts `PieChart` with `Pie`, `Cell` (gray/amber/green), `Legend`, `Tooltip`
    - `frontend/src/components/dashboard/RecentActivity.jsx`: list of 10 recent applications with name, scheme, StatusBadge, relative timestamp
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x] 17.2 Create `frontend/src/pages/DashboardPage.jsx`
    - Fetch `GET /api/dashboard/stats` on mount; show `LoadingSpinner` while loading
    - Render 4 StatCards, SchemeBarChart, StatusPieChart, RecentActivity
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 18. Frontend: Audit Log page (Admin)
  - [x] 18.1 Create `frontend/src/pages/AuditLogPage.jsx`
    - Fetch `GET /api/audit-logs` with pagination and filters
    - Table columns: Timestamp, User (email), Role, Action, Resource Type, Resource ID, IP Address
    - Filter controls: Action (select), Resource Type (select), User (input), date range (start/end date inputs)
    - Pagination controls consistent with ApplicationsPage
    - _Requirements: 12.7, 12.8, 12.9, 12.10_

- [x] 19. Frontend checkpoint
  - Ensure all pages render without errors, routing works correctly, auth guards redirect properly, and the PWA manifest is valid. Ask the user if questions arise.

- [x] 20. PWA assets and configuration
  - [x] 20.1 Create PWA icon assets in `frontend/public/icons/`
    - Add `icon-192.png` (192×192) and `icon-512.png` (512×512) placeholder PNG icons
    - Verify `vite-plugin-pwa` manifest config references correct icon paths
    - _Requirements: 9.1, 9.3_

  - [x] 20.2 Verify `vite.config.js` PWA configuration
    - Confirm `registerType: 'autoUpdate'`, manifest fields (`name`, `short_name`, `start_url`, `display: 'standalone'`, `theme_color`, `background_color`, icons)
    - Confirm Workbox `globPatterns` caches `js`, `css`, `html`, `ico`, `png`, `svg`
    - Confirm runtime caching for `/api/schemes` with `NetworkFirst` strategy
    - _Requirements: 9.1, 9.2, 9.5_

- [x] 21. Integration wiring and final validation
  - [x] 21.1 Wire all backend routes into `app.js` and verify middleware order
    - Confirm middleware chain: `cors → json → auth → rbac → route handler → auditLogger → error handler`
    - Confirm `/api/applications/export` route is registered before `/:id` to avoid shadowing
    - _Requirements: 2.1, 7.3, 12.2_

  - [x] 21.2 Verify frontend Axios instance and environment variable wiring
    - Confirm `VITE_API_URL` is set in `frontend/.env` (e.g., `http://localhost:5000/api`)
    - Confirm all API calls use `axiosInstance` (not raw `axios`)
    - Confirm 401 interceptor triggers `AuthContext.logout()` and redirects to `/login`
    - _Requirements: 2.7_

  - [ ]* 21.3 Write integration smoke tests for critical API flows
    - Test register → login → create application → transition status → export CSV flow
    - Test Admin-only endpoints return 403 for User role
    - Test audit log entries are created for each mutating action
    - _Requirements: 1.1–1.7, 3.1–3.13, 5.1–5.6, 7.1, 12.2_

- [x] 22. Final checkpoint — Ensure all tests pass
  - Ensure all unit tests and integration tests pass, Docker Compose starts cleanly, Swagger UI is accessible, and PWA installs in a supported browser. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The `/api/applications/export` route must be registered before `/api/applications/:id` in Express to prevent route shadowing
- Aadhaar masking must be applied in both the CSV exporter (backend) and the API list/detail responses
- The `auditLogger` middleware relies on controllers setting `req.auditPayload` before responding — this contract must be maintained across all mutating controllers
- PWA icons are required for the install prompt to appear; placeholder PNGs are sufficient for development
