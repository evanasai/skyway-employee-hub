
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  Calendar, 
  CreditCard,
  HelpCircle
} from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (view: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      icon: ClipboardList,
      title: 'Submit Task',
      description: 'Upload work photos & notes',
      color: 'bg-blue-100 text-blue-700',
      action: () => onNavigate('task')
    },
    {
      icon: Calendar,
      title: 'Request Leave',
      description: 'Apply for time off',
      color: 'bg-green-100 text-green-700',
      action: () => onNavigate('leave')
    },
    {
      icon: CreditCard,
      title: 'Advance Request',
      description: 'Request salary advance',
      color: 'bg-purple-100 text-purple-700',
      action: () => onNavigate('advance')
    },
    {
      icon: HelpCircle,
      title: 'Support',
      description: 'Get help & support',
      color: 'bg-teal-100 text-teal-700',
      action: () => onNavigate('support')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto min-h-[80px] flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-shadow p-3"
                onClick={action.action}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium leading-tight">{action.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-1 line-clamp-2">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
