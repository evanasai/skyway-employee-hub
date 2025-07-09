
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
        // Fetch zones assigned to this employee
        const { data: zoneAssignments } = await supabase
          .from('zone_assignments')
          .select(`
            zones (*)
          `)
          .eq('employee_id', employee.id)
          .eq('is_active', true);

        const zones = zoneAssignments?.map(assignment => assignment.zones).filter(Boolean) || [];
        setAssignedZones(zones);
      }
    } catch (error) {
      console.error('Error fetching assigned zones:', error);
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
