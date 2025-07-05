
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/AdminDashboard';
import SupervisorDashboard from '@/components/SupervisorDashboard';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

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
