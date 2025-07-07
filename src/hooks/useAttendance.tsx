
import { useState } from 'react';
import { User } from '@/types';
import { useAttendanceStatus } from './useAttendanceStatus';
import { useAssignedZones } from './useAssignedZones';
import { useCheckInOut } from './useCheckInOut';

export const useAttendance = (user: User | null) => {
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  
  const {
    isCheckedIn,
    setIsCheckedIn,
    currentAttendance,
    setCurrentAttendance,
    checkAttendanceStatus
  } = useAttendanceStatus(user);
  
  const { assignedZones } = useAssignedZones(user);
  
  const { handleCheckIn, handleCheckOut } = useCheckInOut(
    user,
    setIsCheckedIn,
    setCurrentAttendance,
    setCurrentZone,
    currentAttendance
  );

  return {
    isCheckedIn,
    currentAttendance,
    currentZone,
    assignedZones,
    handleCheckIn,
    handleCheckOut,
    checkAttendanceStatus
  };
};
