
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
        // For now, fetch all active zones as assigned zones
        // In future, this should be based on actual zone assignments
        const { data: zones } = await supabase
          .from('zones')
          .select('*')
          .eq('is_active', true);

        setAssignedZones(zones || []);
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
