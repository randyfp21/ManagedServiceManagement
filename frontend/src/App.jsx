import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeePage from './pages/EmployeePage';
import GroupPage from './pages/GroupPage';
import CustomerPage from './pages/CustomerPage';
import SummaryPage from './pages/SummaryPage';
import RevenuePage from './pages/RevenuePage';
import PersonalNotesPage from './pages/PersonalNotesPage';
import TimelinePage from './pages/TimelinePage';
import AuditLogPage from './pages/AuditLogPage';
import { getToken } from './utils/api';

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard & App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeePage />} />
          <Route path="groups" element={<GroupPage />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="summary" element={<SummaryPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="personal-notes" element={<PersonalNotesPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
