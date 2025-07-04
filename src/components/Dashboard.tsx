
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

// Component imports
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeDashboardHeader from './EmployeeDashboardHeader';
import CheckInButton from './CheckInButton';
import MonthlyStatsCard from './MonthlyStatsCard';
import QuickActions from './QuickActions';
import ContactCard from './ContactCard';
import TaskSubmissionForm from './TaskSubmissionForm';
import LeaveRequestForm from './LeaveRequestForm';
import AdvanceRequestForm from './AdvanceRequestForm';
import AssetRequestForm from './AssetRequestForm';
import PayslipsView from './PayslipsView';
import SupportView from './SupportView';
import AdminDashboard from './AdminDashboard';
import MonthlyPerformance from './MonthlyPerformance';
import MyDocuments from './MyDocuments';

// Custom hooks
import { useAttendance } from '@/hooks/useAttendance';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  
  // Custom hooks for data management
  const { isCheckedIn, currentAttendance, handleCheckIn, handleCheckOut } = useAttendance(user);
  const { monthlyStats } = useMonthlyStats(user);

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

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Show admin dashboard for admin/super_admin roles
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <AdminDashboard />;
  }

  // Render different views based on currentView
  if (currentView === 'task') {
    return <TaskSubmissionForm onBack={handleBackToDashboard} />;
  }

  if (currentView === 'leave') {
    return <LeaveRequestForm onBack={handleBackToDashboard} />;
  }

  if (currentView === 'advance') {
    return <AdvanceRequestForm onBack={handleBackToDashboard} />;
  }

  if (currentView === 'asset') {
    return <AssetRequestForm onBack={handleBackToDashboard} />;
  }

  if (currentView === 'payslips') {
    return <PayslipsView onBack={handleBackToDashboard} />;
  }

  if (currentView === 'support') {
    return <SupportView onBack={handleBackToDashboard} />;
  }

  if (currentView === 'performance') {
    return <MonthlyPerformance onBack={handleBackToDashboard} />;
  }

  if (currentView === 'documents') {
    return <MyDocuments onBack={handleBackToDashboard} />;
  }

  // Main dashboard view
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
              {/* Header */}
              <EmployeeDashboardHeader 
                user={user!} 
                isCheckedIn={isCheckedIn} 
                currentAttendance={currentAttendance} 
              />

              {/* Check-in/Check-out Button */}
              <CheckInButton
                isCheckedIn={isCheckedIn}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />

              {/* Monthly Stats */}
              <MonthlyStatsCard 
                monthlyStats={monthlyStats} 
                isCheckedIn={isCheckedIn} 
              />

              {/* Quick Actions */}
              <QuickActions onNavigate={handleNavigate} />

              {/* Contact Information */}
              <ContactCard />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
