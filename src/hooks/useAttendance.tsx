
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types';
import { Zone } from '@/types/database';

export const useAttendance = (user: User | null) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<any>(null);
  const [currentZone, setCurrentZone] = useState<string | null>(null);

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

  const isPointInPolygon = (point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean => {
    const x = point.lat;
    const y = point.lng;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  };

  const checkZoneValidation = async (location: GeolocationPosition): Promise<{ isValid: boolean; zoneName?: string }> => {
    try {
      const { data: zones, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching zones:', error);
        return { isValid: true }; // Allow check-in if zone check fails
      }

      if (!zones || zones.length === 0) {
        // If no zones are configured, allow check-in anywhere
        return { isValid: true };
      }

      const currentPoint = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };

      for (const zone of zones) {
        const coordinates = Array.isArray(zone.coordinates) ? zone.coordinates : [];
        if (isPointInPolygon(currentPoint, coordinates)) {
          return { isValid: true, zoneName: zone.name };
        }
      }

      return { isValid: false };
    } catch (error) {
      console.error('Error checking zone validation:', error);
      return { isValid: true }; // Allow check-in if zone check fails
    }
  };

  const handleCheckIn = async (photoData?: string, location?: GeolocationPosition | null) => {
    if (!user) return;

    if (!location) {
      toast({
        title: "Location Required",
        description: "Location access is required for check-in",
        variant: "destructive"
      });
      return;
    }

    // Check zone validation
    const zoneValidation = await checkZoneValidation(location);
    if (!zoneValidation.isValid) {
      toast({
        title: "Outside Authorized Zone",
        description: "You can only check in from authorized work zones",
        variant: "destructive"
      });
      return;
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
    handleCheckOut,
    checkAttendanceStatus
  };
};
