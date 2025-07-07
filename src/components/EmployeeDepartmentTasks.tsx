
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface EmployeeDepartmentTask {
  id: string;
  task_name: string;
  task_description: string;
  task_type: string;
  priority: string;
  due_date: string | null;
  assigned_at: string;
  department_name: string;
}

interface EmployeeDepartmentTasksProps {
  employeeId: string;
  employeeDepartment: string;
}

const EmployeeDepartmentTasks = ({ employeeId, employeeDepartment }: EmployeeDepartmentTasksProps) => {
  const [departmentTasks, setDepartmentTasks] = useState<EmployeeDepartmentTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDepartmentTasks();
  }, [employeeId, employeeDepartment]);

  const fetchDepartmentTasks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employee_department_tasks')
        .select('*')
        .eq('employee_id', employeeId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setDepartmentTasks(data || []);
    } catch (error) {
      console.error('Error fetching department tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your department tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading your department tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Department Tasks</CardTitle>
          <CardDescription>
            Tasks assigned to your department: {employeeDepartment}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departmentTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tasks assigned to your department yet</p>
                <p className="text-sm">Check back later for new assignments</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {departmentTasks.map((task) => (
                <Card key={task.id} className={`${
                  isOverdue(task.due_date) ? 'border-red-200 bg-red-50' : 
                  isDueSoon(task.due_date) ? 'border-yellow-200 bg-yellow-50' : 
                  'border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-lg">{task.task_name}</h4>
                          {getPriorityIcon(task.priority)}
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline">{task.task_type}</Badge>
                          </div>
                          {task.due_date && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span className={
                                isOverdue(task.due_date) ? 'text-red-600 font-medium' :
                                isDueSoon(task.due_date) ? 'text-yellow-600 font-medium' :
                                'text-gray-600'
                              }>
                                Due: {new Date(task.due_date).toLocaleDateString()}
                                {isOverdue(task.due_date) && ' (Overdue)'}
                                {isDueSoon(task.due_date) && !isOverdue(task.due_date) && ' (Due Soon)'}
                              </span>
                            </div>
                          )}
                        </div>

                        {task.task_description && (
                          <p className="text-gray-700 mb-3">{task.task_description}</p>
                        )}

                        <div className="text-xs text-gray-500">
                          Assigned: {new Date(task.assigned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDepartmentTasks;
