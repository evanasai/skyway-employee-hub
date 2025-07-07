
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, Trash2, Download } from 'lucide-react';

interface DebugLog {
  timestamp: number;
  type: 'error' | 'navigation' | 'state' | 'api';
  message: string;
  data?: any;
}

const DevDebugger: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Load existing logs from localStorage
    const loadLogs = () => {
      const keys = Object.keys(localStorage);
      const debugLogs: DebugLog[] = [];
      
      keys.forEach(key => {
        if (key.startsWith('debug_') || key.startsWith('error_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            debugLogs.push({
              timestamp: parseInt(key.split('_')[1]) || Date.now(),
              type: key.startsWith('error_') ? 'error' : 'navigation',
              message: data.error || data.message || 'Debug entry',
              data
            });
          } catch (e) {
            console.warn('Failed to parse debug log:', e);
          }
        }
      });
      
      setLogs(debugLogs.sort((a, b) => b.timestamp - a.timestamp));
    };

    loadLogs();
  }, []);

  const clearLogs = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('debug_') || key.startsWith('error_')) {
        localStorage.removeItem(key);
      }
    });
    setLogs([]);
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50"
        size="sm"
        variant="outline"
      >
        <Bug className="h-4 w-4" />
        Debug ({logs.length})
      </Button>

      {isVisible && (
        <Card className="fixed bottom-16 right-4 w-96 max-h-96 overflow-auto z-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Debug Logs
              </span>
              <div className="flex gap-2">
                <Button onClick={exportLogs} size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button onClick={clearLogs} size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.slice(0, 10).map((log, index) => (
              <div key={index} className="text-xs border-b pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={log.type === 'error' ? 'destructive' : 'secondary'}>
                    {log.type}
                  </Badge>
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1">{log.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default DevDebugger;
