
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CheckInButton from './CheckInButton';
import QuickActions from './QuickActions';
import LiveClock from './LiveClock';
import StatusIndicator from './StatusIndicator';
import TaskSubmissionForm from './TaskSubmissionForm';
import LeaveRequestForm from './LeaveRequestForm';
import AdvanceRequestForm from './AdvanceRequestForm';
import AssetRequestForm from './AssetRequestForm';
import PayslipsView from './PayslipsView';
import SupportView from './SupportView';
import AdminDashboard from './AdminDashboard';
import EmployeeSidebar from './EmployeeSidebar';
import MonthlyPerformance from './MonthlyPerformance';
import MyDocuments from './MyDocuments';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Calendar, Users, CheckCircle, Clock, Phone, Mail } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    approvedTasks: 0
  });

  useEffect(() => {
    if (user) {
      checkAttendanceStatus();
      fetchMonthlyStats();
    }
  }, [user]);

  const checkAttendanceStatus = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const today = new Date().toISOString().split('T')[0];
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('check_in_time', today)
          .order('check_in_time', { ascending: false })
          .limit(1)
          .single();

        if (attendance && attendance.status === 'checked_in') {
          setIsCheckedIn(true);
          setCurrentAttendance(attendance);
        }
      }
    } catch (error) {
      console.log('No attendance record found for today');
    }
  };

  const fetchMonthlyStats = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
        const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString();

        const { data: tasks } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        if (tasks) {
          setMonthlyStats({
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            pendingTasks: tasks.filter(t => t.status === 'pending_review').length,
            approvedTasks: tasks.filter(t => t.status === 'approved').length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        // Get current location (mock for now)
        const mockLocation = {
          lat: 12.9716,
          lng: 77.5946,
          address: 'Bangalore Office'
        };

        const { data: attendance, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: employee.id,
            check_in_time: new Date().toISOString(),
            location_lat: mockLocation.lat,
            location_lng: mockLocation.lng,
            location_address: mockLocation.address,
            status: 'checked_in'
          })
          .select()
          .single();

        if (error) throw error;

        setIsCheckedIn(true);
        setCurrentAttendance(attendance);
        toast({
          title: "Checked In Successfully",
          description: "Have a productive day!",
        });
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-in Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleCheckOut = async () => {
    if (!currentAttendance) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: new Date().toISOString(),
          status: 'checked_out'
        })
        .eq('id', currentAttendance.id);

      if (error) throw error;

      setIsCheckedIn(false);
      setCurrentAttendance(null);
      toast({
        title: "Checked Out Successfully",
        description: "Have a great day!",
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Check-out Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleNavigate = (view: string) => {
    if (view === 'task' && !isCheckedIn) {
      toast({
        title: "Check-in Required",
        description: "Please check in first to submit tasks",
        variant: "destructive"
      });
      return;
    }
    setCurrentView(view);
  };

  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <AdminDashboard />;
  }

  if (currentView === 'task') {
    return <TaskSubmissionForm onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'leave') {
    return <LeaveRequestForm onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'advance') {
    return <AdvanceRequestForm onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'asset') {
    return <AssetRequestForm onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'payslips') {
    return <PayslipsView onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'support') {
    return <SupportView onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'performance') {
    return <MonthlyPerformance onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'documents') {
    return <MyDocuments onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <EmployeeSidebar currentView={currentView} onNavigate={handleNavigate} />
        
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Employee Dashboard</span>
            </div>
          </header>
          
          <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header - Mobile Optimized */}
              <Card className="gradient-bg text-white">
                <CardHeader>
                  <div className="space-y-4">
                    {/* Name and Welcome Message - Top */}
                    <div className="text-center md:text-left">
                      <CardTitle className="text-2xl font-bold">Welcome back, {user?.name}!</CardTitle>
                      <p className="text-blue-100">Employee ID: {user?.employeeId}</p>
                    </div>
                    
                    {/* Time and Date - Center */}
                    <div className="flex justify-center">
                      <LiveClock />
                    </div>
                    
                    {/* Status Indicator - Bottom */}
                    <div>
                      <StatusIndicator 
                        status={isCheckedIn ? 'in' : 'out'} 
                        checkInTime={currentAttendance?.check_in_time ? new Date(currentAttendance.check_in_time) : null}
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Check-in/Check-out Button */}
              <CheckInButton
                isCheckedIn={isCheckedIn}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />

              {/* Monthly Stats */}
              {isCheckedIn && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>This Month's Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalTasks}</div>
                        <div className="text-sm text-gray-600">Total Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{monthlyStats.completedTasks}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{monthlyStats.pendingTasks}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{monthlyStats.approvedTasks}</div>
                        <div className="text-sm text-gray-600">Approved</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <QuickActions onNavigate={handleNavigate} />

              {/* Contact Information - After Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help? Contact Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => window.open('tel:+917842288660')}
                    >
                      <Phone className="h-4 w-4" />
                      <span>+91 7842288660</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => window.open('https://wa.me/917842288660')}
                    >
                      <Phone className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => window.open('mailto:info@skywaynetworks.in')}
                    >
                      <Mail className="h-4 w-4" />
                      <span>info@skywaynetworks.in</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
