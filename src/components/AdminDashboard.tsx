
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
import EmployeeZoneAssignment from './EmployeeZoneAssignment';
import InventoryManagementView from './InventoryManagementView';
import PayrollManagement from './PayrollManagement';
import ReportsAnalyticsView from './ReportsAnalyticsView';
import SettingsView from './SettingsView';
import EnhancedTeamManagement from './EnhancedTeamManagement';
import SupervisorAllocationManagement from './SupervisorAssignmentManagement';
import SuperAdminDataManagement from './SuperAdminDataManagement';
import AdvanceManagement from './AdvanceManagement';
import AssetManagement from './AssetManagement';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboardOverview />;
      case 'employees':
        return <EnhancedEmployeeManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'enhanced-tasks':
        return <EnhancedTaskManagement />;
      case 'zones':
        return <ZoneManagement />;
      case 'zone-assignment':
        return <EmployeeZoneAssignment />;
      case 'team-management':
        return <EnhancedTeamManagement />;
      case 'supervisor-assignment':
        return <SupervisorAllocationManagement />;
      case 'inventory':
        return <InventoryManagementView />;
      case 'payroll':
        return <PayrollManagement />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'data-management':
        return <SuperAdminDataManagement />;
      case 'advance-management':
        return <AdvanceManagement />;
      case 'asset-management':
        return <AssetManagement />;
      case 'settings':
        return <SettingsView />;
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
      case 'tasks':
        return 'Task Management';
      case 'enhanced-tasks':
        return 'Enhanced Task Management';
      case 'zones':
        return 'Zone Management';
      case 'zone-assignment':
        return 'Zone Assignment';
      case 'team-management':
        return 'Team Management';
      case 'supervisor-assignment':
        return 'Supervisor Allocation';
      case 'kyc-management':
        return 'Employee Verification (KYC)';
      case 'inventory':
        return 'Inventory Management';
      case 'payroll':
        return 'Payroll Management';
      case 'reports':
        return 'Reports & Analytics';
      case 'data-management':
        return 'Data Management';
      case 'advance-management':
        return 'Advance Management';
      case 'asset-management':
        return 'Asset Management';
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
