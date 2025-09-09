import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [], requireAuth = true }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return <Loading message="Verifying access..." />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but we need to check roles
  if (requireAuth && isAuthenticated && user) {
    // Check for specific required role
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Check for allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRole) => {
  return (props) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based route components
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const StoreOwnerRoute = ({ children }) => (
  <ProtectedRoute requiredRole="store_owner">
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children }) => (
  <ProtectedRoute requiredRole="user">
    {children}
  </ProtectedRoute>
);

// Multi-role route component
export const MultiRoleRoute = ({ children, allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    {children}
  </ProtectedRoute>
);

// Public route (no authentication required)
export const PublicRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

// Guest route (only for non-authenticated users)
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading message="Loading..." />;
  }

  if (isAuthenticated && user) {
    // Redirect authenticated users to their appropriate dashboard
    const getDashboardRoute = (role) => {
      switch (role) {
        case 'admin':
          return '/admin/dashboard';
        case 'store_owner':
          return '/owner/dashboard';
        case 'user':
          return '/user/dashboard';
        default:
          return '/dashboard';
      }
    };

    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;