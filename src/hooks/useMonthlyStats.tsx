
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useMonthlyStats = (user: User | null) => {
  const [monthlyStats, setMonthlyStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    approvedTasks: 0
  });

  useEffect(() => {
    if (user) {
      fetchMonthlyStats();
    }
  }, [user]);

  const fetchMonthlyStats = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
        const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString();

        const { data: tasks } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        if (tasks) {
          setMonthlyStats({
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            pendingTasks: tasks.filter(t => t.status === 'pending_review').length,
            approvedTasks: tasks.filter(t => t.status === 'approved').length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  return { monthlyStats, fetchMonthlyStats };
};
