
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import EmployeeSidebar from './EmployeeSidebar';
import AdminDashboard from './AdminDashboard';
import DashboardViews from './DashboardViews';
import DashboardContent from './DashboardContent';
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

  // Show different views based on currentView
  if (currentView !== 'dashboard') {
    return <DashboardViews currentView={currentView} onBack={handleBackToDashboard} />;
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
