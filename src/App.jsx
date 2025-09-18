import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth/AuthContext.jsx';
import { Toaster } from 'sonner';

// Import pages and components
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BlueprintPage from './pages/BlueprintPage.jsx';
import MagazinePage from './pages/MagazinePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import PublicMagazinePage from './pages/PublicMagazinePage.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';

import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/blueprint" 
          element={
            <ProtectedRoute>
              <BlueprintPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/magazine/:id" 
          element={
            <ProtectedRoute>
              <MagazinePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Public magazine viewing routes */}
        <Route path="/issues/:slug" element={<PublicMagazinePage />} />
        <Route path="/issues" element={<PublicMagazinePage />} />
        <Route path="/latest" element={<PublicMagazinePage latest />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
