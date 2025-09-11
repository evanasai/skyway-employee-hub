
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, isLoading, refreshUser } = useAuth();

  // Refresh user data when component mounts to ensure synchronization
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [user?.employeeId]);

  // Show loading state
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

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log('Current user:', user);

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/superadmin" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'supervisor':
      return <Navigate to="/supervisor" replace />;
    case 'employee':
    default:
      return <Navigate to="/employee" replace />;
  }
};

export default Index;
