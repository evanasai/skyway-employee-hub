
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  FileText, 
  Calendar, 
  CreditCard,
  Package,
  HelpCircle
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      icon: ClipboardList,
      title: 'Submit Task',
      description: 'Upload work photos & notes',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      icon: Calendar,
      title: 'Request Leave',
      description: 'Apply for time off',
      color: 'bg-green-100 text-green-700'
    },
    {
      icon: CreditCard,
      title: 'Advance Request',
      description: 'Request salary advance',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      icon: Package,
      title: 'Asset Request',
      description: 'Request tools & equipment',
      color: 'bg-orange-100 text-orange-700'
    },
    {
      icon: FileText,
      title: 'View Payslips',
      description: 'Download monthly payslips',
      color: 'bg-indigo-100 text-indigo-700'
    },
    {
      icon: HelpCircle,
      title: 'Support',
      description: 'Get help & support',
      color: 'bg-teal-100 text-teal-700'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-shadow"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
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
