import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Layout from './components/layout/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import DashboardPage from './pages/DashboardPage';
import SchemesPage from './pages/SchemesPage';
import AuditLogPage from './pages/AuditLogPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/applications" replace />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/new" element={<ApplicationFormPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="applications/:id/edit" element={<ApplicationFormPage />} />

          {/* Admin-only routes */}
          <Route
            path="dashboard"
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="schemes"
            element={
              <AdminRoute>
                <SchemesPage />
              </AdminRoute>
            }
          />
          <Route
            path="audit-logs"
            element={
              <AdminRoute>
                <AuditLogPage />
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/applications" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
