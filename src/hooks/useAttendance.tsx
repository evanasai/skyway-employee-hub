
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types';

export const useAttendance = (user: User | null) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkAttendanceStatus();
    }
  }, [user]);

  const checkAttendanceStatus = async () => {
    if (!user) return;

    try {
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
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const mockLocation = {
          lat: 12.9716,
          lng: 77.5946,
          address: 'Bangalore Office'
        };

        const { data: attendance, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: employee.id,
            check_in_time: new Date().toISOString(),
            location_lat: mockLocation.lat,
            location_lng: mockLocation.lng,
            location_address: mockLocation.address,
            status: 'checked_in'
          })
          .select()
          .single();

        if (error) throw error;

        setIsCheckedIn(true);
        setCurrentAttendance(attendance);
        toast({
          title: "Checked In Successfully",
          description: "Have a productive day!",
        });
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-in Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleCheckOut = async () => {
    if (!currentAttendance) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: new Date().toISOString(),
          status: 'checked_out'
        })
        .eq('id', currentAttendance.id);

      if (error) throw error;

      setIsCheckedIn(false);
      setCurrentAttendance(null);
      toast({
        title: "Checked Out Successfully",
        description: "Have a great day!",
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Check-out Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return {
    isCheckedIn,
    currentAttendance,
    handleCheckIn,
    handleCheckOut,
    checkAttendanceStatus
  };
};
