
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types';
import { useZoneValidation } from './useZoneValidation';

export const useCheckInOut = (user: User | null) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<any>(null);
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  const { checkZoneValidation } = useZoneValidation();

  const handleCheckIn = async (photoData?: string, location?: GeolocationPosition | null) => {
    if (!user) return;

    if (!location) {
      toast({
        title: "Location Required",
        description: "Location access is required for check-in",
        variant: "destructive"
      });
      throw new Error("Location required");
    }

    // Check zone validation
    const zoneValidation = await checkZoneValidation(location);
    if (!zoneValidation.isValid) {
      toast({
        title: "Outside Authorized Zone",
        description: "You are not in the zone. Please come to the zone and then check in.",
        variant: "destructive"
      });
      throw new Error("Outside authorized zone");
    }

    if (zoneValidation.zoneName) {
      setCurrentZone(zoneValidation.zoneName);
    }

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
          location_lat: location.coords.latitude,
          location_lng: location.coords.longitude,
          location_address: zoneValidation.zoneName || 'GPS Location',
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
              console.log('Photo uploaded successfully:', uploadData.path);
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
      setCurrentZone(null);
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
    currentZone,
    handleCheckIn, 
    handleCheckOut 
  };
};
