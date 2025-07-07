
import React from 'react';
import EmployeeDashboardHeader from './EmployeeDashboardHeader';
import CheckInButton from './CheckInButton';
import AssignedZones from './AssignedZones';
import MonthlyStatsCard from './MonthlyStatsCard';
import QuickActions from './QuickActions';
import ContactCard from './ContactCard';
import { User } from '@/types';

interface DashboardContentProps {
  user: User;
  isCheckedIn: boolean;
  currentAttendance: any;
  currentZone: string | null;
  assignedZones: any[];
  monthlyStats: any;
  onCheckIn: (photoData?: string, location?: GeolocationPosition | null) => void;
  onCheckOut: () => void;
  onNavigate: (view: string) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  user,
  isCheckedIn,
  currentAttendance,
  currentZone,
  assignedZones,
  monthlyStats,
  onCheckIn,
  onCheckOut,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      {/* Header with Welcome, Time, and Status */}
      <EmployeeDashboardHeader 
        user={user} 
        isCheckedIn={isCheckedIn} 
        currentAttendance={currentAttendance}
        currentZone={currentZone}
      />

      {/* Check-in/Check-out Button */}
      <CheckInButton
        isCheckedIn={isCheckedIn}
        onCheckIn={onCheckIn}
        onCheckOut={onCheckOut}
      />

      {/* Assigned Zones */}
      <AssignedZones zones={assignedZones} />

      {/* Monthly Stats */}
      <MonthlyStatsCard 
        monthlyStats={monthlyStats} 
        isCheckedIn={isCheckedIn} 
      />

      {/* Quick Actions */}
      <QuickActions onNavigate={onNavigate} />

      {/* Contact Information */}
      <ContactCard />
    </div>
  );
};

export default DashboardContent;
