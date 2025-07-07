
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardContent from './DashboardContent';
import DashboardViews from './DashboardViews';
import ErrorBoundary from './ErrorBoundary';
import LoadingState from './LoadingState';
import EmployeeSidebar from './EmployeeSidebar';
import { useNavigationState } from '@/hooks/useNavigationState';
import { useStatePersistence } from '@/hooks/useStatePersistence';
import { useCheckInOut } from '@/hooks/useCheckInOut';
import { useAttendanceStatus } from '@/hooks/useAttendanceStatus';
import { useAssignedZones } from '@/hooks/useAssignedZones';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { currentView, navigateTo, goBack, canGoBack } = useNavigationState('dashboard');
  
  // Use state persistence for dashboard state
  const [dashboardState, setDashboardState] = useState({
    lastRefresh: Date.now(),
    userPreferences: {}
  });
  
  const { restoreState } = useStatePersistence('dashboard', dashboardState, 'Dashboard');
  
  const { isCheckedIn, currentAttendance, currentZone, handleCheckIn, handleCheckOut } = useCheckInOut(user);
  const { isLoading: attendanceLoading } = useAttendanceStatus(user);
  const { assignedZones, isLoading: zonesLoading } = useAssignedZones(user);
  const { monthlyStats, isLoading: statsLoading } = useMonthlyStats(user);

  // Restore state on mount if available
  useEffect(() => {
    const restored = restoreState();
    if (restored) {
      setDashboardState(restored);
    }
  }, []);

  // Handle loading states
  if (!user) {
    return <LoadingState type="card" message="Loading user data..." />;
  }

  if (attendanceLoading || zonesLoading || statsLoading) {
    return <LoadingState type="card" message="Loading dashboard..." />;
  }

  const handleNavigate = (view: string) => {
    console.log(`Navigating to: ${view}`);
    navigateTo(view);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Employee Dashboard';
      case 'profile':
        return 'My Profile';
      case 'performance':
        return 'Monthly Performance';
      case 'payslips':
        return 'Payslips';
      case 'documents':
        return 'My Documents';
      case 'leave':
        return 'Request Leave';
      case 'task':
        return 'Submit Task';
      case 'advance':
        return 'Advance Request';
      case 'asset':
        return 'Asset Request';
      case 'support':
        return 'Support';
      default:
        return 'Employee Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <EmployeeSidebar currentView={currentView} onNavigate={handleNavigate} />
        
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
                {currentView === 'dashboard' ? (
                  <ErrorBoundary componentName="Dashboard Content">
                    <DashboardContent
                      user={user}
                      isCheckedIn={isCheckedIn}
                      currentAttendance={currentAttendance}
                      currentZone={currentZone}
                      assignedZones={assignedZones}
                      monthlyStats={monthlyStats}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                      onNavigate={handleNavigate}
                    />
                  </ErrorBoundary>
                ) : (
                  <ErrorBoundary componentName="Dashboard Views">
                    <DashboardViews
                      currentView={currentView}
                      onBack={canGoBack ? goBack : () => navigateTo('dashboard')}
                    />
                  </ErrorBoundary>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
