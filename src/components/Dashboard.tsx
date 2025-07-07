
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmployeeSidebar from './EmployeeSidebar';
import DashboardContent from './DashboardContent';
import TasksList from './TasksList';
import EmployeeProfile from './EmployeeProfile';
import PayslipsView from './PayslipsView';
import MyDocuments from './MyDocuments';
import SupportView from './SupportView';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common employee tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Button 
              onClick={() => setCurrentView('tasks')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">📋</span>
              <span>My Tasks</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('profile')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">👤</span>
              <span>Profile</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('payslips')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">💰</span>
              <span>Payslips</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('documents')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">📄</span>
              <span>Documents</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <EmployeeSidebar currentView={currentView} onNavigate={setCurrentView} />
        
        <SidebarInset className="flex-1 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 w-full">
              <div className="flex items-center justify-between w-full max-w-full">
                <div className="flex items-center space-x-2">
                  <SidebarTrigger className="-ml-1" />
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      {currentView === 'dashboard' && 'Employee Dashboard'}
                      {currentView === 'tasks' && 'My Tasks'}
                      {currentView === 'profile' && 'My Profile'}
                      {currentView === 'payslips' && 'Payslips'}
                      {currentView === 'documents' && 'My Documents'}
                      {currentView === 'support' && 'Support'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      Welcome back, {user?.name} ({user?.role})
                    </p>
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
                {currentView === 'dashboard' && renderDashboardOverview()}
                {currentView === 'tasks' && <TasksList />}
                {currentView === 'profile' && <EmployeeProfile />}
                {currentView === 'payslips' && <PayslipsView />}
                {currentView === 'documents' && <MyDocuments />}
                {currentView === 'support' && <SupportView />}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
