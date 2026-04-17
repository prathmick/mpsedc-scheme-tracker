# Requirements Document

## Introduction

The MPSEDC Government Scheme Application Tracker is a full-stack web application that enables officers of Madhya Pradesh State Electronics Development Corporation (MPSEDC) to manage citizen welfare scheme applications (e.g., PM Kisan, Ladli Behna, Ayushman Bharat). The system provides JWT-based authentication, role-based access control (Admin/User), full CRUD operations on applications, a 3-stage approval workflow (Draft → Review → Approved), an admin dashboard with statistics and charts, CSV export, and Progressive Web App (PWA) support.

The backend is built with Node.js 20 + Express 4 + MySQL 8.0 (Docker) + swagger-jsdoc. The frontend is built with React 18 + Vite 5 + Tailwind CSS 3 + Recharts + lucide-react + react-router-dom v6 + Axios. All code is plain JavaScript — no TypeScript.

---

## Glossary

- **System**: The MPSEDC Government Scheme Application Tracker application (backend API + frontend UI).
- **API**: The Express 4 REST API backend service.
- **UI**: The React 18 frontend single-page application.
- **Officer**: A registered user (role: User) who creates and manages scheme applications on behalf of citizens.
- **Admin**: A registered user (role: Admin) who has full access including dashboard statistics, user management, and all applications.
- **Citizen**: A beneficiary of a government welfare scheme; represented as data within an application record.
- **Application**: A record representing a citizen's request to enroll in a government welfare scheme.
- **Scheme**: A government welfare program (e.g., PM Kisan, Ladli Behna, Ayushman Bharat).
- **Workflow**: The 3-stage lifecycle of an Application: Draft → Review → Approved.
- **JWT**: JSON Web Token used for stateless authentication.
- **RBAC**: Role-Based Access Control governing what each role (Admin/User) can do.
- **Dashboard**: An admin-only page displaying aggregated statistics, charts, and recent activity.
- **CSV Export**: A downloadable comma-separated values file containing application data.
- **PWA**: Progressive Web App — a web application installable on devices with offline capability via a service worker and web manifest.
- **Docker**: Container platform used to run the MySQL 8.0 database.
- **Swagger**: API documentation generated via swagger-jsdoc and served at `/api-docs`.
- **Audit Log / Transaction Log**: A chronological record of all significant actions performed in the system, capturing who did what, on which resource, and when.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As an officer or admin, I want to register and log in with a username and password, so that I can securely access the system.

#### Acceptance Criteria

1. THE API SHALL expose a `POST /api/auth/register` endpoint that accepts `username`, `email`, `password`, and `role` fields.
2. WHEN a registration request is received with a unique email and valid fields, THE API SHALL hash the password using bcryptjs and store the user record in MySQL.
3. IF a registration request is received with an email that already exists, THEN THE API SHALL return HTTP 409 with a descriptive error message.
4. THE API SHALL expose a `POST /api/auth/login` endpoint that accepts `email` and `password`.
5. WHEN a login request is received with valid credentials, THE API SHALL return a signed JWT containing `userId`, `email`, and `role`, with an expiry of 24 hours.
6. IF a login request is received with invalid credentials, THEN THE API SHALL return HTTP 401 with a descriptive error message.
7. THE API SHALL validate all auth request bodies and return HTTP 400 with field-level error details when required fields are missing or malformed.

---

### Requirement 2: Role-Based Access Control (RBAC)

**User Story:** As a system administrator, I want role-based access control enforced on all protected routes, so that officers cannot access admin-only features.

#### Acceptance Criteria

1. THE API SHALL protect all non-auth endpoints with a JWT middleware that verifies the token on every request.
2. IF a request is received without a valid JWT, THEN THE API SHALL return HTTP 401.
3. THE API SHALL define two roles: `Admin` and `User`.
4. WHILE a request is authenticated with role `User`, THE API SHALL restrict access to admin-only endpoints and return HTTP 403 if a User attempts to access them.
5. WHILE a request is authenticated with role `Admin`, THE API SHALL permit access to all endpoints including user management and dashboard statistics.
6. THE UI SHALL hide admin-only navigation items and routes from users with role `User`.
7. THE UI SHALL redirect unauthenticated users to the login page when they attempt to access protected routes.

---

### Requirement 3: Scheme Application CRUD

**User Story:** As an officer, I want to create, view, update, and delete scheme applications, so that I can manage citizen welfare enrollments.

#### Acceptance Criteria

1. THE API SHALL expose a `POST /api/applications` endpoint that creates a new Application record with status `Draft`.
2. WHEN a create request is received, THE API SHALL require the fields: `citizenName`, `citizenAadhaar`, `schemeId`, and `district`.
3. THE API SHALL expose a `GET /api/applications` endpoint that returns a paginated list of Applications.
4. WHILE a request is authenticated with role `User`, THE API SHALL return only Applications created by that officer in list and detail responses.
5. WHILE a request is authenticated with role `Admin`, THE API SHALL return all Applications regardless of creator in list and detail responses.
6. THE API SHALL expose a `GET /api/applications/:id` endpoint that returns a single Application by ID.
7. IF a request is received for an Application ID that does not exist, THEN THE API SHALL return HTTP 404.
8. THE API SHALL expose a `PUT /api/applications/:id` endpoint that updates editable fields of an Application.
9. WHEN an update request is received for an Application with status `Approved`, THE API SHALL return HTTP 422 with a message indicating the application cannot be modified after approval.
10. THE API SHALL expose a `DELETE /api/applications/:id` endpoint that removes an Application record.
11. WHEN a delete request is received for an Application with status other than `Draft`, THE API SHALL return HTTP 422 with a message indicating only Draft applications can be deleted.
12. THE API SHALL support filtering Applications by `schemeId`, `status`, and `district` via query parameters on the list endpoint.
13. THE API SHALL support sorting Applications by `createdAt` and `updatedAt` via query parameters on the list endpoint.

---

### Requirement 4: Scheme Management

**User Story:** As an admin, I want to manage the list of government schemes, so that officers can associate applications with the correct scheme.

#### Acceptance Criteria

1. THE API SHALL expose a `GET /api/schemes` endpoint that returns all available Schemes.
2. THE API SHALL expose a `POST /api/schemes` endpoint, accessible only to Admins, that creates a new Scheme with fields: `name`, `description`, and `department`.
3. THE API SHALL expose a `PUT /api/schemes/:id` endpoint, accessible only to Admins, that updates a Scheme's fields.
4. THE API SHALL expose a `DELETE /api/schemes/:id` endpoint, accessible only to Admins, that removes a Scheme.
5. IF a delete request is received for a Scheme that has associated Applications, THEN THE API SHALL return HTTP 422 with a message indicating the scheme cannot be deleted while applications exist.
6. THE System SHALL pre-seed the database with at least the following schemes: PM Kisan, Ladli Behna, Ayushman Bharat, PM Awas Yojana, and Sambal Yojana.

---

### Requirement 5: 3-Stage Approval Workflow

**User Story:** As an officer and admin, I want applications to move through a Draft → Review → Approved workflow, so that there is a clear approval process for citizen scheme enrollments.

#### Acceptance Criteria

1. THE API SHALL expose a `PATCH /api/applications/:id/status` endpoint that transitions an Application's status.
2. THE System SHALL enforce the following valid transitions only: `Draft → Review`, `Review → Approved`, and `Review → Draft` (rejection/return).
3. IF a status transition request is received that does not match a valid transition, THEN THE API SHALL return HTTP 422 with a message listing the valid transitions from the current status.
4. WHILE a request is authenticated with role `User`, THE API SHALL permit only the `Draft → Review` transition (submit for review).
5. WHILE a request is authenticated with role `Admin`, THE API SHALL permit all valid transitions.
6. WHEN a status transition occurs, THE API SHALL record a `transitionedAt` timestamp and the `transitionedBy` user ID on the Application record.
7. THE UI SHALL display the current status of each Application with a visual status badge using distinct colors: Draft (gray), Review (yellow), Approved (green).
8. THE UI SHALL display workflow action buttons contextually based on the Application's current status and the authenticated user's role.

---

### Requirement 6: Admin Dashboard

**User Story:** As an admin, I want a dashboard with statistics and charts, so that I can monitor the overall state of scheme applications across the system.

#### Acceptance Criteria

1. THE API SHALL expose a `GET /api/dashboard/stats` endpoint, accessible only to Admins, that returns aggregate counts: total applications, applications by status, applications by scheme, and applications by district.
2. THE UI SHALL render a Dashboard page accessible only to users with role `Admin`.
3. THE UI SHALL display four stat cards showing: Total Applications, Draft count, Review count, and Approved count.
4. THE UI SHALL render a bar chart (using Recharts) showing application counts grouped by Scheme name.
5. THE UI SHALL render a pie chart (using Recharts) showing the distribution of applications by status.
6. THE UI SHALL display a Recent Activity list showing the 10 most recently updated Applications with their name, scheme, status, and last-updated timestamp.
7. WHEN the Dashboard page is loaded, THE UI SHALL fetch fresh data from the API and display a loading indicator while the request is in progress.

---

### Requirement 7: CSV Export

**User Story:** As an admin, I want to export application data as a CSV file, so that I can analyze or share the data in spreadsheet tools.

#### Acceptance Criteria

1. THE API SHALL expose a `GET /api/applications/export` endpoint, accessible only to Admins, that returns a CSV file of all Applications.
2. THE CSV file SHALL include the following columns: Application ID, Citizen Name, Citizen Aadhaar (masked — last 4 digits visible), Scheme Name, District, Status, Created At, Updated At, Officer Name.
3. WHEN the export endpoint is called, THE API SHALL set the response `Content-Type` to `text/csv` and `Content-Disposition` to `attachment; filename="applications_export.csv"`.
4. THE UI SHALL provide an "Export CSV" button on the Applications list page, visible only to Admins, that triggers a download of the CSV file.

---

### Requirement 8: Swagger API Documentation

**User Story:** As a developer, I want auto-generated API documentation, so that I can understand and test all available endpoints.

#### Acceptance Criteria

1. THE API SHALL serve interactive Swagger UI documentation at the `/api-docs` route using swagger-jsdoc and swagger-ui-express.
2. THE API SHALL annotate all endpoints with JSDoc comments that define request parameters, request bodies, response schemas, and authentication requirements.
3. THE Swagger documentation SHALL include a security scheme definition for Bearer JWT authentication.
4. WHEN a developer accesses `/api-docs`, THE API SHALL render the Swagger UI without requiring authentication.

---

### Requirement 9: Progressive Web App (PWA) Support

**User Story:** As an officer in a low-connectivity area, I want the application to be installable and partially usable offline, so that I can access previously loaded data without an internet connection.

#### Acceptance Criteria

1. THE UI SHALL include a `manifest.json` with `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, and icon definitions.
2. THE UI SHALL register a service worker that caches the application shell (HTML, CSS, JS assets) for offline access.
3. WHEN the UI is loaded in a supported browser, THE System SHALL make the application installable via the browser's native install prompt.
4. WHILE the device is offline, THE UI SHALL display a clear offline indicator to the user.
5. THE UI SHALL be built with Vite 5 using the `vite-plugin-pwa` plugin to generate the service worker and manifest automatically.

---

### Requirement 10: Application List UI with Filtering and Pagination

**User Story:** As an officer or admin, I want to browse, filter, and paginate through applications in the UI, so that I can efficiently find and manage specific records.

#### Acceptance Criteria

1. THE UI SHALL display a paginated table of Applications with columns: Citizen Name, Scheme, District, Status, Created Date, and Actions.
2. THE UI SHALL provide filter controls for Scheme, Status, and District that update the displayed list without a full page reload.
3. THE UI SHALL display pagination controls that allow navigating between pages of results.
4. WHEN a filter is changed, THE UI SHALL reset to page 1 of the results.
5. THE UI SHALL provide a search input that filters applications by citizen name on the client side or via API query parameter.
6. THE UI SHALL use lucide-react icons for action buttons (edit, delete, view) in the Applications table.

---

### Requirement 11: Database Schema and Docker Setup

**User Story:** As a developer, I want a MySQL 8.0 database running in Docker with a well-defined schema, so that I can set up the development environment quickly and reliably.

#### Acceptance Criteria

1. THE System SHALL include a `docker-compose.yml` file that defines a MySQL 8.0 service with environment variables for database name, user, password, and root password.
2. THE System SHALL include a SQL migration/seed script that creates all required tables: `users`, `schemes`, `applications`, and `application_status_history`.
3. THE `applications` table SHALL include columns: `id`, `citizenName`, `citizenAadhaar`, `schemeId`, `district`, `status`, `createdBy`, `transitionedAt`, `transitionedBy`, `createdAt`, `updatedAt`.
4. THE `application_status_history` table SHALL record every status transition with: `applicationId`, `fromStatus`, `toStatus`, `transitionedBy`, `transitionedAt`.
5. THE API SHALL use a connection pool to manage MySQL connections and SHALL log a startup message confirming successful database connection.
6. THE System SHALL include a `.env.example` file documenting all required environment variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `PORT`.

---

### Requirement 12: Transaction / Audit Log

**User Story:** As an admin, I want a complete audit trail of all significant actions performed in the system, so that I can track who did what and when for accountability and compliance purposes.

#### Acceptance Criteria

1. THE System SHALL include an `audit_logs` table in the database with columns: `id`, `userId`, `userEmail`, `role`, `action`, `resourceType`, `resourceId`, `details` (JSON), `ipAddress`, `createdAt`.
2. THE API SHALL write an entry to the `audit_logs` table for each of the following actions: `LOGIN`, `REGISTER`, `CREATE_APPLICATION`, `UPDATE_APPLICATION`, `DELETE_APPLICATION`, `STATUS_TRANSITION`, `CREATE_SCHEME`, `UPDATE_SCHEME`, `DELETE_SCHEME`.
3. WHEN an audit log entry is created, THE API SHALL capture the authenticated user's `userId`, `userEmail`, and `role`, the `action` name, the `resourceType` (e.g., `application`, `scheme`, `user`), the `resourceId`, a `details` JSON snapshot of the relevant change, the client `ipAddress`, and the `createdAt` timestamp.
4. THE API SHALL expose a `GET /api/audit-logs` endpoint accessible only to Admins that returns a paginated list of audit log entries.
5. THE `GET /api/audit-logs` endpoint SHALL support filtering by `userId`, `action`, `resourceType`, `startDate`, and `endDate` via query parameters.
6. IF a request to `GET /api/audit-logs` is received from a user with role `User`, THEN THE API SHALL return HTTP 403.
7. THE UI SHALL include an Audit Log page accessible only to users with role `Admin`, reachable from the admin navigation.
8. THE UI Audit Log page SHALL display a table of log entries with columns: Timestamp, User (email), Role, Action, Resource Type, Resource ID, and IP Address.
9. THE UI Audit Log page SHALL provide filter controls for Action, Resource Type, User, and date range that update the displayed list without a full page reload.
10. THE UI Audit Log page SHALL display pagination controls consistent with the Applications list page.
