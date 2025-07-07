
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<DepartmentTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    department_id: '',
    task_name: '',
    task_description: '',
    task_type: '',
    priority: 'medium',
    due_date: ''
  });

  const taskTypes = [
    'Security Check',
    'Maintenance',
    'Installation',
    'Inspection',
    'Documentation',
    'Cleaning',
    'Delivery',
    'Training',
    'Quality Assurance'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchDepartments();
    fetchDepartmentTasks();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDepartmentTasks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('department_task_assignments')
        .select(`
          *,
          departments!inner(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasksWithDeptName = (data || []).map((task: any) => ({
        ...task,
        department_name: task.departments?.name || 'Unknown Department'
      }));

      setDepartmentTasks(tasksWithDeptName);
    } catch (error) {
      console.error('Error fetching department tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch department tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async () => {
    if (!formData.task_name.trim() || !formData.department_id || !formData.task_type) {
      toast({
        title: "Missing Information",
        description: "Task name, department, and task type are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const taskData = {
        department_id: formData.department_id,
        task_name: formData.task_name.trim(),
        task_description: formData.task_description.trim() || null,
        task_type: formData.task_type,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      const { error } = await supabase
        .from('department_task_assignments')
        .insert(taskData);

      if (error) throw error;

      resetForm();
      await fetchDepartmentTasks();
      
      toast({
        title: "Task Created",
        description: "Department task has been created successfully",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create department task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async () => {
    if (!editingTask) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('department_task_assignments')
        .update({
          department_id: formData.department_id,
          task_name: formData.task_name.trim(),
          task_description: formData.task_description.trim() || null,
          task_type: formData.task_type,
          priority: formData.priority,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      resetForm();
      await fetchDepartmentTasks();
      
      toast({
        title: "Task Updated",
        description: "Department task has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update department task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('department_task_assignments')
        .update({ is_active: false })
        .eq('id', taskId);

      if (error) throw error;

      await fetchDepartmentTasks();
      toast({
        title: "Task Deleted",
        description: "Department task has been deactivated successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete department task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingTask(null);
    setFormData({
      department_id: '',
      task_name: '',
      task_description: '',
      task_type: '',
      priority: 'medium',
      due_date: ''
    });
  };

  const startEditing = (task: DepartmentTask) => {
    setEditingTask(task);
    setFormData({
      department_id: task.department_id,
      task_name: task.task_name,
      task_description: task.task_description || '',
      task_type: task.task_type,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
    });
    setIsCreating(false);
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority) || priorities[1];
    return <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>;
  };

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
          {(isCreating || editingTask) && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={formData.department_id} 
                    onValueChange={(value) => setFormData({...formData, department_id: value})}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task_name">Task Name *</Label>
                  <Input
                    id="task_name"
                    value={formData.task_name}
                    onChange={(e) => setFormData({...formData, task_name: e.target.value})}
                    placeholder="Enter task name"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="task_type">Task Type *</Label>
                  <Select 
                    value={formData.task_type} 
                    onValueChange={(value) => setFormData({...formData, task_type: value})}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({...formData, priority: value})}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="task_description">Task Description</Label>
                <Textarea
                  id="task_description"
                  value={formData.task_description}
                  onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                  placeholder="Enter task description (optional)"
                  disabled={isLoading}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={editingTask ? updateTask : createTask}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingTask ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isCreating && !editingTask && (
            <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Department Task
            </Button>
          )}

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
                {departmentTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <p>No department tasks created yet</p>
                        <p className="text-sm">Click "Create Department Task" to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  departmentTasks.map((task) => (
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
                            onClick={() => startEditing(task)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentTaskManagement;
