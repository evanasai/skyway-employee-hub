import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import AdminDashboard from '@/components/AdminDashboard';

const AdminPage = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Skyway Networks...</p>
        </div>
      </div>
    );
  }

  // Mandatory authentication - redirect to login if no user
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strict role check - only admin and super_admin allowed
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard />;
};

export default AdminPage;