
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeManagement from './EmployeeManagement';
import TaskManagement from './TaskManagement';
import InventoryManagement from './InventoryManagement';
import PayrollManagement from './PayrollManagement';
import AdminSidebar from './AdminSidebar';
import EnhancedEmployeeManagement from './EnhancedEmployeeManagement';
import EnhancedTaskManagement from './EnhancedTaskManagement';
import TestCredentialsButton from './TestCredentialsButton';

interface AdminDashboardProps {
  // You can define props here if needed
}

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentView === 'dashboard' && 'Dashboard Overview'}
              {currentView === 'employees' && 'Employee Management'}
              {currentView === 'enhanced-employees' && 'Enhanced Employee Management'}
              {currentView === 'tasks' && 'Task Management'}
              {currentView === 'enhanced-tasks' && 'Enhanced Task Management'}
              {currentView === 'zones' && 'Zone Management'}
              {currentView === 'inventory' && 'Inventory Management'}
              {currentView === 'payroll' && 'Payroll Management'}
              {currentView === 'reports' && 'Reports & Analytics'}
              {currentView === 'settings' && 'Settings'}
            </h1>
            <div className="flex items-center space-x-4">
              <TestCredentialsButton />
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {currentView === 'dashboard' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
                <p>Welcome to the admin dashboard. Use the sidebar to manage various aspects of the system.</p>
              </div>
            )}
            {currentView === 'employees' && <EmployeeManagement />}
            {currentView === 'enhanced-employees' && <EnhancedEmployeeManagement />}
            {currentView === 'tasks' && <TaskManagement />}
            {currentView === 'enhanced-tasks' && <EnhancedTaskManagement />}
            {currentView === 'zones' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Zone Management</h2>
                <p>Zone management functionality will be implemented here.</p>
              </div>
            )}
            {currentView === 'inventory' && <InventoryManagement />}
            {currentView === 'payroll' && <PayrollManagement />}
            {currentView === 'reports' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Reports & Analytics</h2>
                <p>Reports and analytics functionality will be implemented here.</p>
              </div>
            )}
            {currentView === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                <p>Settings functionality will be implemented here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
