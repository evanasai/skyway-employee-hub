
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Component imports
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeDashboardHeader from './EmployeeDashboardHeader';
import CheckInButton from './CheckInButton';
import MonthlyStatsCard from './MonthlyStatsCard';
import QuickActions from './QuickActions';
import ContactCard from './ContactCard';
import AssignedZones from './AssignedZones';
import TaskSubmissionForm from './TaskSubmissionForm';
import LeaveRequestForm from './LeaveRequestForm';
import AdvanceRequestForm from './AdvanceRequestForm';
import AssetRequestForm from './AssetRequestForm';
import PayslipsView from './PayslipsView';
import SupportView from './SupportView';
import AdminDashboard from './AdminDashboard';
import MonthlyPerformance from './MonthlyPerformance';
import MyDocuments from './MyDocuments';
import EmployeeProfile from './EmployeeProfile';

// Custom hooks
import { useAttendance } from '@/hooks/useAttendance';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const isMobile = useIsMobile();
  
  // Custom hooks for data management
  const { isCheckedIn, currentAttendance, currentZone, assignedZones, handleCheckIn, handleCheckOut } = useAttendance(user);
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

  // Mobile back button component
  const MobileBackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBackToDashboard}
      className="mb-4 md:hidden"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Dashboard
    </Button>
  );

  // Render different views based on currentView
  if (currentView === 'task') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <TaskSubmissionForm />
      </div>
    );
  }

  if (currentView === 'leave') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <LeaveRequestForm onBack={handleBackToDashboard} />
      </div>
    );
  }

  if (currentView === 'advance') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <AdvanceRequestForm onBack={handleBackToDashboard} />
      </div>
    );
  }

  if (currentView === 'asset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <AssetRequestForm onBack={handleBackToDashboard} />
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <EmployeeProfile onBack={handleBackToDashboard} />
    );
  }

  if (currentView === 'payslips') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <PayslipsView onBack={handleBackToDashboard} />
      </div>
    );
  }

  if (currentView === 'support') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <SupportView onBack={handleBackToDashboard} />
      </div>
    );
  }

  if (currentView === 'performance') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <MonthlyPerformance onBack={handleBackToDashboard} />
      </div>
    );
  }

  if (currentView === 'documents') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <MobileBackButton />
        <MyDocuments onBack={handleBackToDashboard} />
      </div>
    );
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
                currentZone={currentZone}
              />

              {/* Check-in/Check-out Button */}
              <CheckInButton
                isCheckedIn={isCheckedIn}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />

              {/* Assigned Zones */}
              <AssignedZones zones={assignedZones} />

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
