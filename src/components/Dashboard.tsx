
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAttendance } from '@/hooks/useAttendance';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
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
  const [teamInfo, setTeamInfo] = useState<any>(null);

  // Use attendance hook for check-in/out functionality
  const {
    isCheckedIn,
    currentAttendance,
    currentZone,
    assignedZones,
    handleCheckIn,
    handleCheckOut
  } = useAttendance(user);

  // Use monthly stats hook
  const { monthlyStats } = useMonthlyStats(user);

  const employeeTypes = [
    { value: 'all', label: 'All Employees' },
    { value: 'employee', label: 'Regular Employee' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' }
  ];

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchTeamInfo();
    }
  }, [user]);

  const fetchTeamInfo = async () => {
    if (!user) return;
    
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        // Check if employee is part of any team
        const { data: teamMember } = await supabase
          .from('team_members')
          .select(`
            *,
            teams (
              id,
              name,
              category,
              departments (
                name
              )
            )
          `)
          .eq('employee_id', employee.id)
          .single();

        if (teamMember) {
          setTeamInfo(teamMember.teams);
        }
      }
    } catch (error) {
      console.log('No team assignment found for employee');
    }
  };

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

  const handleNavigate = (view: string) => {
    // Map the navigation views to match the component structure
    const viewMapping: { [key: string]: string } = {
      'task': 'task-submission',
      'leave': 'leave-request',
      'advance': 'advance-request',
      'support': 'support',
      'performance': 'monthly-performance',
      'asset': 'asset-request'
    };
    
    setCurrentView(viewMapping[view] || view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardContent
            user={user!}
            isCheckedIn={isCheckedIn}
            currentAttendance={currentAttendance}
            currentZone={currentZone}
            assignedZones={assignedZones}
            monthlyStats={monthlyStats}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onNavigate={handleNavigate}
          />
        );
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
        return (
          <DashboardContent
            user={user!}
            isCheckedIn={isCheckedIn}
            currentAttendance={currentAttendance}
            currentZone={currentZone}
            assignedZones={assignedZones}
            monthlyStats={monthlyStats}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onNavigate={handleNavigate}
          />
        );
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
                      <div className="flex flex-col text-sm text-gray-600">
                        <span>Welcome back, {user?.name} ({user?.role})</span>
                        <span>Department: {user?.department}</span>
                        {teamInfo && (
                          <span>Team: {teamInfo.name} ({teamInfo.category})</span>
                        )}
                      </div>
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
