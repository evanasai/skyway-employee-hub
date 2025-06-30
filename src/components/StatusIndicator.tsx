
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'in' | 'out' | 'idle';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className = '' }) => {
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
      <div className="flex items-center space-x-3">
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
    </div>
  );
};

export default StatusIndicator;
