import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';

const LoginPage = () => {
  const { user, isLoading } = useAuth();

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

  // If user is already logged in, redirect to their appropriate dashboard
  if (user) {
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
  }

  return <LoginForm />;
};

export default LoginPage;