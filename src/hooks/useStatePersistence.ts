
import { useEffect, useRef } from 'react';

interface StateBackup {
  timestamp: number;
  data: any;
  component: string;
}

export const useStatePersistence = (key: string, state: any, componentName: string) => {
  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Save state to localStorage periodically
  useEffect(() => {
    const saveState = () => {
      try {
        const backup: StateBackup = {
          timestamp: Date.now(),
          data: stateRef.current,
          component: componentName
        };
        localStorage.setItem(`state_backup_${key}`, JSON.stringify(backup));
      } catch (error) {
        console.warn('Failed to backup state:', error);
      }
    };

    const interval = setInterval(saveState, 5000); // Save every 5 seconds
    
    // Save on component unmount
    return () => {
      clearInterval(interval);
      saveState();
    };
  }, [key, componentName]);

  // Function to restore state from backup
  const restoreState = (): any | null => {
    try {
      const backup = localStorage.getItem(`state_backup_${key}`);
      if (backup) {
        const parsed: StateBackup = JSON.parse(backup);
        // Only restore if backup is less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Failed to restore state:', error);
    }
    return null;
  };

  return { restoreState };
};
