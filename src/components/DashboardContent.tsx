
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
    <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
    </div>
  );
};

export default DashboardContent;
