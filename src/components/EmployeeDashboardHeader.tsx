
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import LiveClock from './LiveClock';
import StatusIndicator from './StatusIndicator';
import { User } from '@/types';

interface EmployeeDashboardHeaderProps {
  user: User;
  isCheckedIn: boolean;
  currentAttendance: any;
  currentZone?: string | null;
}

const EmployeeDashboardHeader = ({ user, isCheckedIn, currentAttendance, currentZone }: EmployeeDashboardHeaderProps) => {
  return (
    <Card className="gradient-bg text-white">
      <CardHeader>
        <div className="space-y-4">
          {/* Name and Welcome Message - Top */}
          <div className="text-center md:text-left">
            <CardTitle className="text-2xl font-bold">Welcome back, {user?.name}!</CardTitle>
            <p className="text-blue-100">Employee ID: {user?.employeeId}</p>
            {currentZone && (
              <p className="text-blue-100 text-sm">📍 Current Zone: {currentZone}</p>
            )}
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
  );
};

export default EmployeeDashboardHeader;
