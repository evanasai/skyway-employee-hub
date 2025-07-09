import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { useTaskStatus } from '@/hooks/useTaskStatus';
import { User } from '@/types';

interface TaskStatusGuardProps {
  user: User | null;
  onLogout: () => void;
  children?: React.ReactNode;
}

const TaskStatusGuard: React.FC<TaskStatusGuardProps> = ({ user, onLogout, children }) => {
  const { canLogout, isTaskActive, taskStatus } = useTaskStatus(user);

  const handleLogoutClick = () => {
    if (canLogout()) {
      onLogout();
    }
  };

  return (
    <div>
      {children}
      
      {/* Show warning if user tries to logout during active task */}
      {isTaskActive() && (
        <Alert className="mt-4 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>You have an active task in progress. Please complete your task before logging out.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogoutClick}
                disabled={!canLogout()}
                className="ml-4"
              >
                {canLogout() ? 'Logout' : 'Complete Task First'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TaskStatusGuard;