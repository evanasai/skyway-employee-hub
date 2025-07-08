
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
  assigned_to: string[];
  due_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  required_fields: {
    location: boolean;
    photos: boolean;
    comments: boolean;
    start_end_time: boolean;
    additional_notes: boolean;
  };
}

interface TasksListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, onEdit, onDelete }) => {
  const getRequiredFieldsBadges = (required_fields: any) => {
    const requiredFields = [];
    if (required_fields.location) requiredFields.push('Location');
    if (required_fields.photos) requiredFields.push('Photos');
    if (required_fields.comments) requiredFields.push('Comments');
    if (required_fields.start_end_time) requiredFields.push('Time');
    if (required_fields.additional_notes) requiredFields.push('Notes');
    
    return requiredFields.map(field => (
      <Badge key={field} variant="outline" className="text-xs">
        {field}
      </Badge>
    ));
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
                    <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Type:</strong> {task.task_type}
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
                  <div className="flex items-center space-x-1 mb-2">
                    <span className="text-sm text-gray-600"><strong>Required Fields:</strong></span>
                    {getRequiredFieldsBadges(task.required_fields)}
                  </div>
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
