
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import AdminDashboardOverview from './AdminDashboardOverview';
import EmployeeManagement from './EmployeeManagement';
import EnhancedEmployeeManagement from './EnhancedEmployeeManagement';
import TaskManagement from './TaskManagement';
import EnhancedTaskManagement from './EnhancedTaskManagement';
import ZoneManagement from './ZoneManagement';
import InventoryManagement from './InventoryManagement';
import PayrollManagement from './PayrollManagement';
import ReportsAndAnalytics from './ReportsAndAnalytics';
import Settings from './Settings';
import KYCManagementView from './KYCManagementView';
import TeamManagementView from './TeamManagementView';
import SupervisorAssignmentView from './SupervisorAssignmentView';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboardOverview />;
      case 'employees':
        return <EmployeeManagement />;
      case 'enhanced-employees':
        return <EnhancedEmployeeManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'enhanced-tasks':
        return <EnhancedTaskManagement />;
      case 'zones':
        return <ZoneManagement />;
      case 'team-management':
        return <TeamManagementView />;
      case 'supervisor-assignment':
        return <SupervisorAssignmentView />;
      case 'kyc-management':
        return <KYCManagementView />;
      case 'inventory':
        return <InventoryManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'reports':
        return <ReportsAndAnalytics />;
      case 'settings':
        return <Settings />;
      default:
        return <AdminDashboardOverview />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Admin Dashboard';
      case 'employees':
        return 'Employee Management';
      case 'enhanced-employees':
        return 'Enhanced Employee Management';
      case 'tasks':
        return 'Task Management';
      case 'enhanced-tasks':
        return 'Enhanced Task Management';
      case 'zones':
        return 'Zone Management';
      case 'team-management':
        return 'Team Management';
      case 'supervisor-assignment':
        return 'Supervisor Assignment';
      case 'kyc-management':
        return 'Employee Verification (KYC)';
      case 'inventory':
        return 'Inventory Management';
      case 'payroll':
        return 'Payroll Management';
      case 'reports':
        return 'Reports & Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Admin Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AdminSidebar currentView={currentView} onNavigate={setCurrentView} />
        
        <SidebarInset className="flex-1 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 w-full">
              <div className="flex items-center justify-between w-full max-w-full">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SW</span>
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        {getViewTitle()}
                      </h1>
                      <p className="text-sm text-gray-600">
                        Welcome back, {user?.name} ({user?.role})
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 w-full">
              <div className="w-full max-w-full px-4 lg:px-6 py-6 lg:py-8">
                {renderCurrentView()}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
