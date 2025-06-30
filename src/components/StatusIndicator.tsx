
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Timer } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'in' | 'out' | 'idle';
  className?: string;
  checkInTime?: Date | null;
  totalWorkedTime?: number; // in seconds
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  className = '', 
  checkInTime,
  totalWorkedTime = 0 
}) => {
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'in' && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const secondsWorked = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
        setCurrentSessionTime(secondsWorked);
      }, 1000);
    } else {
      setCurrentSessionTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, checkInTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'in':
        return {
          icon: CheckCircle,
          text: 'Checked In',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          dotClass: 'status-online'
        };
      case 'out':
        return {
          icon: XCircle,
          text: 'Checked Out',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          dotClass: 'status-offline'
        };
      case 'idle':
        return {
          icon: Clock,
          text: 'Idle',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          dotClass: 'status-idle'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} rounded-xl p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative">
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${config.dotClass}`}></div>
        </div>
        <div>
          <div className={`font-semibold ${config.textColor}`}>
            {config.text}
          </div>
          <div className="text-xs text-muted-foreground">
            Status: {status === 'in' ? 'Active' : status === 'out' ? 'Offline' : 'Away'}
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="space-y-2">
        {status === 'in' && (
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-green-600" />
            <div className="text-sm">
              <span className="font-medium text-green-800">Current Session: </span>
              <span className="font-mono text-green-700">{formatTime(currentSessionTime)}</span>
            </div>
          </div>
        )}
        
        {totalWorkedTime > 0 && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <span className="font-medium text-blue-800">Total Today: </span>
              <span className="font-mono text-blue-700">{formatTime(totalWorkedTime)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;
