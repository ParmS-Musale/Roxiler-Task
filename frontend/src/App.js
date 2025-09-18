import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute, { 
  GuestRoute, 
  AdminRoute, 
  StoreOwnerRoute, 
  UserRoute 
} from './components/auth/ProtectedRoute';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import StoreManagement from './components/admin/StoreManagement';

// Store Owner Components
import OwnerDashboard from './components/store-owner/OwnerDashboard';
import RatingAnalytics from './components/store-owner/RatingAnalytics';

// User Components
import UserDashboard from './components/user/UserDashboard';
import StoreList from './components/user/StoreList';
import RatingForm from './components/user/RatingForm';

// Other Components
import Home from './components/common/Home';
import StoreDetail from './components/store-owner/StoreDetail';
import Unauthorized from './components/common/Unauthorized';
import NotFound from './components/common/NotFound';

import { ROUTES } from './utils/constants';
import useAuth from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/stores" element={<StoreList />} />
              <Route path="/stores/:id" element={<StoreDetail />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Guest Only Routes */}
              <Route path="/login" element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } />
              
              <Route path="/register" element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } />

              {/* Protected Dashboard Redirect */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              
              <Route path="/admin/stores" element={
                <AdminRoute>
                  <StoreManagement />
                </AdminRoute>
              } />

              {/* Store Owner Routes */}
              <Route path="/owner/dashboard" element={
                <StoreOwnerRoute>
                  <OwnerDashboard />
                </StoreOwnerRoute>
              } />
              
              <Route path="/owner/analytics" element={
                <StoreOwnerRoute>
                  <RatingAnalytics />
                </StoreOwnerRoute>
              } />

              {/* User Routes */}
              <Route path="/user/dashboard" element={
                <UserRoute>
                  <UserDashboard />
                </UserRoute>
              } />
              
              <Route path="/user/rate/:storeId" element={
                <UserRoute>
                  <RatingForm />
                </UserRoute>
              } />

              {/* 404 and Catch All */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'store_owner':
        return '/owner/dashboard';
      case 'user':
        return '/user/dashboard';
      default:
        return '/';
    }
  };

  return <Navigate to={getDashboardRoute(user.role)} replace />;
};

export default App;