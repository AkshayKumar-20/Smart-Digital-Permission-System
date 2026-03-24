import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LoginPage    from './pages/Login';
import RegisterPage from './pages/Register';
import StudentDash  from './pages/student/StudentDashboard';
import TeacherDash  from './pages/teacher/TeacherDashboard';
import HODDash      from './pages/hod/HODDashboard';
import PrincipalDash from './pages/principal/PrincipalDashboard';
import WatchmanDash from './pages/watchman/WatchmanDashboard';
import AdminDash   from './pages/admin/AdminDashboard';

/**
 * RoleRoute — Wraps a route so only the allowed role can access it.
 * If no user: redirect to /login.
 * If wrong role: redirect to /[their-role].
 */
const RoleRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Default → redirect based on login state */}
      <Route path="/" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
      }/>

      {/* Auth */}
      <Route path="/login"    element={user ? <Navigate to={`/${user.role}`} replace/> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} replace/> : <RegisterPage />} />

      {/* Role Dashboards */}
      <Route path="/student/*" element={
        <RoleRoute allowedRole="student"><StudentDash /></RoleRoute>
      }/>
      <Route path="/teacher/*" element={
        <RoleRoute allowedRole="teacher"><TeacherDash /></RoleRoute>
      }/>
      <Route path="/hod/*" element={
        <RoleRoute allowedRole="hod"><HODDash /></RoleRoute>
      }/>
      <Route path="/principal/*" element={
        <RoleRoute allowedRole="principal"><PrincipalDash /></RoleRoute>
      }/>
      <Route path="/watchman/*" element={
        <RoleRoute allowedRole="watchman"><WatchmanDash /></RoleRoute>
      }/>
      <Route path="/admin/*" element={
        <RoleRoute allowedRole="admin"><AdminDash /></RoleRoute>
      }/>

      {/* Catchall */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontFamily: 'Inter, sans-serif', borderRadius: '10px' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}