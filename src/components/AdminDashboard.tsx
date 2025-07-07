
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import EmployeeManagementTable from './EmployeeManagementTable';
import SimpleZoneEditor from './SimpleZoneEditor';
import TaskManagement from './TaskManagement';
import EnhancedReportDownloader from './EnhancedReportDownloader';
import InventoryManagement from './InventoryManagement';
import SettingsManagement from './SettingsManagement';
import PayrollManagement from './PayrollManagement';
import AdvanceExpenseManagement from './AdvanceExpenseManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'employees':
        return <EmployeeManagementTable />;
      case 'zones':
        return <SimpleZoneEditor />;
      case 'tasks':
        return <TaskManagement />;
      case 'reports':
        return <EnhancedReportDownloader />;
      case 'inventory':
        return <InventoryManagement />;
      case 'settings':
        return <SettingsManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'advances':
        return <AdvanceExpenseManagement />;
      case 'dashboard':
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Total Employees</h3>
                <p className="text-3xl font-bold text-blue-600">--</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Active Zones</h3>
                <p className="text-3xl font-bold text-green-600">--</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Pending Tasks</h3>
                <p className="text-3xl font-bold text-orange-600">--</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Pending Advances</h3>
                <p className="text-3xl font-bold text-red-600">--</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Departments</h3>
                <p className="text-3xl font-bold text-purple-600">--</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
                <p className="text-3xl font-bold text-indigo-600">--</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar currentView={currentView} onNavigate={setCurrentView} />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="-ml-1 text-white hover:bg-blue-700" />
              <div className="flex items-center space-x-3">
                <div className="text-white">
                  <h1 className="text-xl font-bold">Skyway Networks</h1>
                  <p className="text-xs text-blue-100">Admin Panel</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-blue-100 capitalize">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
