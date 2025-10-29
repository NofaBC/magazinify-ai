import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MagazineCreator = lazy(() => import('./pages/MagazineCreator'));
const MagazineViewer = lazy(() => import('./pages/MagazineViewer'));
const Settings = lazy(() => import('./pages/Settings'));

// A simple component to protect routes
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Or a proper loading spinner component
    return <div>Loading authentication...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Add a route for forgot password if needed */}

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <MagazineCreator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/magazine/:magazineId"
          element={
            <ProtectedRoute>
              <MagazineViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/*" // Use * for nested routes inside Settings.jsx
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 Page (optional) */}
        <Route path="*" element={<div>404: Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
