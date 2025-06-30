
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-accent/20">
      <div className="flex items-center justify-center space-x-3 mb-2">
        <Clock className="h-6 w-6 text-accent" />
        <div className="text-3xl font-bold text-primary font-mono">
          {formatTime(time)}
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        {formatDate(time)}
      </div>
    </div>
  );
};

export default LiveClock;
