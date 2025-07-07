import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import EmployeeSidebar from './EmployeeSidebar';
import DashboardContent from './DashboardContent';
import TasksList from './TasksList';
import EmployeeProfile from './EmployeeProfile';
import PayslipsView from './PayslipsView';
import MyDocuments from './MyDocuments';
import SupportView from './SupportView';
import MonthlyPerformanceView from './MonthlyPerformanceView';
import LeaveRequestView from './LeaveRequestView';
import TaskSubmissionView from './TaskSubmissionView';
import AdvanceRequestView from './AdvanceRequestView';
import AssetRequestView from './AssetRequestView';

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  employee_type: string;
  assigned_to: string[];
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  status: 'active' | 'inactive';
  created_at: string;
}

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const employeeTypes = [
    { value: 'all', label: 'All Employees' },
    { value: 'employee', label: 'Regular Employee' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' }
  ];

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For now, we'll use mock data since the employee doesn't have tasks in the current schema
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Daily Route Check',
          description: 'Complete daily route inspection',
          task_type: 'Inspection',
          employee_type: 'employee',
          assigned_to: [user.id],
          priority: 'high',
          due_date: new Date().toISOString(),
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Equipment Maintenance',
          description: 'Check and maintain delivery equipment',
          task_type: 'Maintenance',
          employee_type: 'employee',
          assigned_to: [user.id],
          priority: 'medium',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          created_at: new Date().toISOString()
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    console.log('Edit task:', task);
    // TODO: Implement task editing functionality
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('Delete task:', taskId);
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleBack = () => {
    setCurrentView('dashboard');
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">{tasks.filter(t => t.status === 'active').length} active</p>
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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'tasks':
        return (
          <TasksList 
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            employeeTypes={employeeTypes}
          />
        );
      case 'profile':
        return <EmployeeProfile />;
      case 'payslips':
        return <PayslipsView onBack={handleBack} />;
      case 'documents':
        return <MyDocuments onBack={handleBack} />;
      case 'support':
        return <SupportView onBack={handleBack} />;
      case 'monthly-performance':
        return <MonthlyPerformanceView onBack={handleBack} />;
      case 'leave-request':
        return <LeaveRequestView onBack={handleBack} />;
      case 'task-submission':
        return <TaskSubmissionView onBack={handleBack} />;
      case 'advance-request':
        return <AdvanceRequestView onBack={handleBack} />;
      case 'asset-request':
        return <AssetRequestView onBack={handleBack} />;
      default:
        return renderDashboardOverview();
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Employee Dashboard';
      case 'tasks': return 'My Tasks';
      case 'profile': return 'My Profile';
      case 'payslips': return 'Payslips';
      case 'documents': return 'My Documents';
      case 'support': return 'Support';
      case 'monthly-performance': return 'Monthly Performance';
      case 'leave-request': return 'Leave Requests';
      case 'task-submission': return 'Task Submissions';
      case 'advance-request': return 'Advance Requests';
      case 'asset-request': return 'Asset Requests';
      default: return 'Employee Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <EmployeeSidebar currentView={currentView} onNavigate={setCurrentView} />
        
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

export default Dashboard;
