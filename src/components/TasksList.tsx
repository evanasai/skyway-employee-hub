
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  employee_type: string;
  assigned_to: string[];
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface TasksListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  employeeTypes: { value: string; label: string }[];
}

const TasksList: React.FC<TasksListProps> = ({ tasks, onEdit, onDelete, employeeTypes }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getEmployeeTypeLabel = (type: string) => {
    const employeeType = employeeTypes.find(et => et.value === type);
    return employeeType ? employeeType.label : type;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Created Tasks ({tasks.length})</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks created yet</p>
      ) : (
        tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    {getPriorityBadge(task.priority)}
                    <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Type:</strong> {task.task_type}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Target:</strong> {getEmployeeTypeLabel(task.employee_type)}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Description:</strong> {task.description}
                    </p>
                  )}
                  {task.due_date && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Due:</strong> {new Date(task.due_date).toLocaleString()}
                    </p>
                  )}
                  {task.assigned_to.length > 0 && (
                    <p className="text-sm text-blue-600">
                      Assigned to {task.assigned_to.length} specific employee(s)
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default TasksList;
