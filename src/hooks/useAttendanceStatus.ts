
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useAttendanceStatus = (user: User | null) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAttendanceStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const today = new Date().toISOString().split('T')[0];
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('check_in_time', today)
          .order('check_in_time', { ascending: false })
          .limit(1)
          .single();

        if (attendance && attendance.status === 'checked_in') {
          setIsCheckedIn(true);
          setCurrentAttendance(attendance);
        }
      }
    } catch (error) {
      console.log('No attendance record found for today');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAttendanceStatus();
    }
  }, [user]);

  return {
    isCheckedIn,
    setIsCheckedIn,
    currentAttendance,
    setCurrentAttendance,
    checkAttendanceStatus,
    isLoading
  };
};
