import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * AuthGuard component to protect routes that require authentication
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} props.requireAdmin - Whether the route requires admin privileges
 * @returns {JSX.Element} Protected route
 */
const AuthGuard = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Allow a brief delay to check authentication state
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, loading]);

  // Show loading state while checking authentication
  if (loading || isVerifying) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Save the current location for redirecting back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin privilege if required
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default AuthGuard;
