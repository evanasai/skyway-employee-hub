
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';
import EmployeeSidebar from './EmployeeSidebar';
import AdminDashboard from './AdminDashboard';
import DashboardViews from './DashboardViews';
import DashboardContent from './DashboardContent';
import { useAttendance } from '@/hooks/useAttendance';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { user, logout } = useAuth();
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
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center space-x-2">
              <SidebarTrigger className="-ml-1" />
              <span className="font-semibold">Employee Dashboard</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
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
