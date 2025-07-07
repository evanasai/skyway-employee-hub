
import { User } from '@/types';
import { useAttendanceStatus } from './useAttendanceStatus';
import { useAssignedZones } from './useAssignedZones';
import { useCheckInOut } from './useCheckInOut';

export const useAttendance = (user: User | null) => {
  const {
    isCheckedIn,
    currentAttendance,
    currentZone,
    handleCheckIn, 
    handleCheckOut 
  } = useCheckInOut(user);
  
  const {
    checkAttendanceStatus
  } = useAttendanceStatus(user);
  
  const { assignedZones } = useAssignedZones(user);

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
