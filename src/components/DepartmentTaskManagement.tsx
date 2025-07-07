
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDepartmentTasks } from '@/hooks/useDepartmentTasks';
import DepartmentTaskForm from './DepartmentTaskForm';
import DepartmentTasksTable from './DepartmentTasksTable';

interface DepartmentTask {
  id: string;
  department_id: string;
  task_name: string;
  task_description: string;
  task_type: string;
  priority: string;
  due_date: string | null;
  assigned_at: string;
  is_active: boolean;
  department_name?: string;
}

const DepartmentTaskManagement = () => {
  const {
    departments,
    departmentTasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask
  } = useDepartmentTasks();

  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<DepartmentTask | null>(null);

  const handleSubmit = async (formData: any) => {
    if (editingTask) {
      return await updateTask(editingTask.id, formData);
    } else {
      return await createTask(formData);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTask(null);
  };

  const handleEdit = (task: DepartmentTask) => {
    setEditingTask(task);
    setIsCreating(false);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const showForm = isCreating || editingTask;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department Task Management</CardTitle>
          <CardDescription>
            Assign tasks to departments. All employees in the department will see these tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showForm && (
            <DepartmentTaskForm
              departments={departments}
              editingTask={editingTask}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          {!showForm && (
            <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Department Task
            </Button>
          )}

          <DepartmentTasksTable
            tasks={departmentTasks}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentTaskManagement;
