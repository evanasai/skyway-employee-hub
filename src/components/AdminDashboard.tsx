
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import EmployeeManagementTable from './EmployeeManagementTable';
import SimpleZoneEditor from './SimpleZoneEditor';
import TaskManagement from './TaskManagement';
import EnhancedReportDownloader from './EnhancedReportDownloader';
import InventoryManagement from './InventoryManagement';

const AdminDashboard = () => {
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
      case 'dashboard':
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dashboard stats and overview */}
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Admin Dashboard</span>
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
