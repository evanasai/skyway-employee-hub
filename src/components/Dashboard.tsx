
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardContent from './DashboardContent';
import DashboardViews from './DashboardViews';
import ErrorBoundary from './ErrorBoundary';
import LoadingState from './LoadingState';
import { useNavigationState } from '@/hooks/useNavigationState';
import { useStatePersistence } from '@/hooks/useStatePersistence';
import { useCheckInOut } from '@/hooks/useCheckInOut';
import { useAttendanceStatus } from '@/hooks/useAttendanceStatus';
import { useAssignedZones } from '@/hooks/useAssignedZones';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';

const Dashboard = () => {
  const { user } = useAuth();
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

  if (currentView === 'dashboard') {
    return (
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
    );
  }

  return (
    <ErrorBoundary componentName="Dashboard Views">
      <DashboardViews
        currentView={currentView}
        onBack={canGoBack ? goBack : () => navigateTo('dashboard')}
      />
    </ErrorBoundary>
  );
};

export default Dashboard;
