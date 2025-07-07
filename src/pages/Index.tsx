
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/AdminDashboard';
import SupervisorDashboard from '@/components/SupervisorDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if no user
  if (!user) {
    return <LoginForm />;
  }

  console.log('Current user:', user);

  // Show AdminDashboard for admin and super_admin roles
  if (user.role === 'admin' || user.role === 'super_admin') {
    return <AdminDashboard />;
  }

  // Show SupervisorDashboard for supervisor role
  if (user.role === 'supervisor') {
    return <SupervisorDashboard />;
  }

  // Show regular Dashboard for employees
  return <Dashboard />;
};

export default Index;
