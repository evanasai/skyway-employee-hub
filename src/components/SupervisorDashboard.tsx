import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupervisorSidebar from './SupervisorSidebar';
import TeamManagement from './TeamManagement';
import TaskManagement from './TaskManagement';
import SupervisorAssignmentManagement from './SupervisorAssignmentManagement';
import ReportsAnalyticsView from './ReportsAnalyticsView';

const SupervisorDashboard = () => {
  const { logout, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Under supervision</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Supervisor management tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Button 
              onClick={() => setCurrentView('team')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">👥</span>
              <span>Manage Team</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('tasks')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">📋</span>
              <span>Task Review</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('assignments')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">📊</span>
              <span>Assignments</span>
            </Button>
            <Button 
              onClick={() => setCurrentView('reports')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-lg mb-1">📈</span>
              <span>Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'team':
        return <TeamManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'assignments':
        return <SupervisorAssignmentManagement />;
      case 'reports':
        return <ReportsAnalyticsView />;
      default:
        return renderDashboardOverview();
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Supervisor Dashboard';
      case 'team': return 'Team Management';
      case 'tasks': return 'Task Management';
      case 'assignments': return 'Assignment Management';
      case 'reports': return 'Reports & Analytics';
      default: return 'Supervisor Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <SupervisorSidebar currentView={currentView} onNavigate={setCurrentView} />
        
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

export default SupervisorDashboard;
