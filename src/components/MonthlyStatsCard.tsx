
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface MonthlyStatsCardProps {
  monthlyStats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    approvedTasks: number;
  };
  isCheckedIn: boolean;
}

const MonthlyStatsCard = ({ monthlyStats, isCheckedIn }: MonthlyStatsCardProps) => {
  if (!isCheckedIn) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>This Month's Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{monthlyStats.completedTasks}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{monthlyStats.pendingTasks}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{monthlyStats.approvedTasks}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyStatsCard;
