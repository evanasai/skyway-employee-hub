
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useAssignedZones = (user: User | null) => {
  const [assignedZones, setAssignedZones] = useState<any[]>([]);
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignedZones = async () => {
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
        // Fetch zones assigned to this employee with proper join
        const { data: zoneAssignments, error } = await supabase
          .from('zone_assignments')
          .select(`
            zones!zone_assignments_zone_id_fkey (
              id,
              name,
              coordinates,
              is_active
            )
          `)
          .eq('employee_id', employee.id)
          .eq('is_active', true);

        if (error) {
          console.error('Zone assignment fetch error:', error);
          setAssignedZones([]);
          return;
        }

        const zones = zoneAssignments?.map(assignment => assignment.zones).filter(Boolean) || [];
        setAssignedZones(zones);
      }
    } catch (error) {
      console.error('Error fetching assigned zones:', error);
      setAssignedZones([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssignedZones();
    }
  }, [user]);

  return { 
    assignedZones, 
    currentZone,
    isLoading,
    fetchAssignedZones 
  };
};
