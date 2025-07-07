
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface DepartmentTask {
  id: string;
  department_id: string;
  task_name: string;
  task_description: string;
  task_type: string;
  priority: string;
  due_date: string | null;
  department_name?: string;
}

interface DepartmentTasksTableProps {
  tasks: DepartmentTask[];
  isLoading: boolean;
  onEdit: (task: DepartmentTask) => void;
  onDelete: (taskId: string) => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
];

const DepartmentTasksTable = ({ tasks, isLoading, onEdit, onDelete }: DepartmentTasksTableProps) => {
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority) || priorities[1];
    return <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>;
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-gray-500">
                  <p>No department tasks created yet</p>
                  <p className="text-sm">Click "Create Department Task" to get started</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{task.task_name}</div>
                  {task.task_description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {task.task_description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{task.department_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{task.task_type}</Badge>
              </TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(task)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DepartmentTasksTable;
