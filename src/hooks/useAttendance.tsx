
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

  const handleCheckIn = async (photoData?: string, location?: GeolocationPosition | null) => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const attendanceData = {
          employee_id: employee.id,
          check_in_time: new Date().toISOString(),
          location_lat: location?.coords.latitude || 12.9716,
          location_lng: location?.coords.longitude || 77.5946,
          location_address: location ? 'GPS Location' : 'Bangalore Office',
          status: 'checked_in'
        };

        const { data: attendance, error } = await supabase
          .from('attendance')
          .insert(attendanceData)
          .select()
          .single();

        if (error) throw error;

        // Store photo if provided
        if (photoData && attendance) {
          try {
            // Convert base64 to blob
            const base64Data = photoData.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });

            const fileName = `checkin_${employee.employee_id}_${Date.now()}.jpg`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('attendance-photos')
              .upload(fileName, blob);

            if (uploadError) {
              console.error('Photo upload failed:', uploadError);
            } else {
              // Update attendance record with photo URL
              await supabase
                .from('attendance')
                .update({ 
                  photo_url: uploadData.path,
                  photo_metadata: {
                    timestamp: new Date().toISOString(),
                    location: location ? {
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                      accuracy: location.coords.accuracy
                    } : null
                  }
                })
                .eq('id', attendance.id);
            }
          } catch (photoError) {
            console.error('Error handling photo:', photoError);
          }
        }

        setIsCheckedIn(true);
        setCurrentAttendance(attendance);
      }
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
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
