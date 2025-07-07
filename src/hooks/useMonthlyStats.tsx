
import { useState, useEffect } from 'react';
import { User } from '@/types';

export const useMonthlyStats = (user: User | null) => {
  const [monthlyStats, setMonthlyStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    approvedTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMonthlyStats = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API call for now
      // In real implementation, this would fetch from Supabase
      setTimeout(() => {
        setMonthlyStats({
          totalTasks: 12,
          completedTasks: 8,
          pendingTasks: 2,
          approvedTasks: 6
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMonthlyStats();
    }
  }, [user]);

  return { 
    monthlyStats, 
    isLoading,
    fetchMonthlyStats 
  };
};
