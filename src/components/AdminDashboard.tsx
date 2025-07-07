
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
import ZoneManagement from './ZoneManagement';
import ReportsAndAnalytics from './ReportsAndAnalytics';
import Settings from './Settings';
import TestCredentialsButton from './TestCredentialsButton';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+8 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zones Managed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Across 3 departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4,25,000</div>
            <p className="text-xs text-muted-foreground">For December 2024</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Button 
              onClick={() => setCurrentView('enhanced-employees')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">👥</span>
              <span>Manage Employees</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('enhanced-tasks')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">📋</span>
              <span>Task Management</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('payroll')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">💰</span>
              <span>Process Payroll</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('zones')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">🗺️</span>
              <span>Zone Management</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Database Status</span>
              <span className="text-green-600 font-medium">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Authentication Service</span>
              <span className="text-green-600 font-medium">✓ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Backup</span>
              <span className="text-gray-600">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active Users</span>
              <span className="text-blue-600 font-medium">{user?.name} ({user?.role})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AdminSidebar currentView={currentView} onNavigate={setCurrentView} />
        
        <SidebarInset className="flex-1 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 w-full">
              <div className="flex items-center justify-between w-full max-w-full">
                <div className="flex items-center space-x-2">
                  <SidebarTrigger className="-ml-1" />
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
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
                    <p className="text-sm text-gray-600">
                      Welcome back, {user?.name} ({user?.role})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <TestCredentialsButton />
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
                {currentView === 'dashboard' && renderDashboardOverview()}
                {currentView === 'employees' && <EmployeeManagement />}
                {currentView === 'enhanced-employees' && <EnhancedEmployeeManagement />}
                {currentView === 'tasks' && <TaskManagement />}
                {currentView === 'enhanced-tasks' && <EnhancedTaskManagement />}
                {currentView === 'zones' && <ZoneManagement />}
                {currentView === 'inventory' && <InventoryManagement />}
                {currentView === 'payroll' && <PayrollManagement />}
                {currentView === 'reports' && <ReportsAndAnalytics />}
                {currentView === 'settings' && <Settings />}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
