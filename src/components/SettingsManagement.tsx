
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  form_fields: any[];
  is_active: boolean;
  created_at: string;
}

interface DepartmentTask {
  id: string;
  department_id: string;
  task_id: string;
  is_required: boolean;
}

const SettingsManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([]);
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDeptForTasks, setSelectedDeptForTasks] = useState<string>('');
  
  const [deptFormData, setDeptFormData] = useState({
    name: ''
  });

  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    form_fields: [] as any[]
  });

  useEffect(() => {
    fetchDepartments();
    fetchTasks();
    fetchDepartmentTasks();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchDepartmentTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('department_tasks')
        .select('*');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setDepartmentTasks(data || []);
    } catch (error) {
      console.error('Error fetching department tasks:', error);
    }
  };

  const createDepartment = async () => {
    if (!deptFormData.name) {
      toast({
        title: "Missing Information",
        description: "Department name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('departments')
        .insert({
          name: deptFormData.name,
          is_active: true
        });

      if (error) throw error;

      resetDeptForm();
      fetchDepartments();
      
      toast({
        title: "Department Created",
        description: "New department has been added successfully",
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive"
      });
    }
  };

  const updateDepartment = async () => {
    if (!editingDept) return;

    try {
      const { error } = await supabase
        .from('departments')
        .update({
          name: deptFormData.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDept.id);

      if (error) throw error;

      resetDeptForm();
      fetchDepartments();
      
      toast({
        title: "Department Updated",
        description: "Department has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive"
      });
    }
  };

  const deleteDepartment = async (deptId: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update({ is_active: false })
        .eq('id', deptId);

      if (error) throw error;

      fetchDepartments();
      toast({
        title: "Department Deleted",
        description: "Department has been deactivated successfully",
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive"
      });
    }
  };

  const createTask = async () => {
    if (!taskFormData.name) {
      toast({
        title: "Missing Information",
        description: "Task name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          name: taskFormData.name,
          description: taskFormData.description,
          form_fields: taskFormData.form_fields,
          is_active: true
        });

      if (error) throw error;

      resetTaskForm();
      fetchTasks();
      
      toast({
        title: "Task Created",
        description: "New task has been added successfully",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async () => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          name: taskFormData.name,
          description: taskFormData.description,
          form_fields: taskFormData.form_fields,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      resetTaskForm();
      fetchTasks();
      
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_active: false })
        .eq('id', taskId);

      if (error) throw error;

      fetchTasks();
      toast({
        title: "Task Deleted",
        description: "Task has been deactivated successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const assignTaskToDepartment = async (deptId: string, taskId: string, isRequired: boolean) => {
    try {
      const { error } = await supabase
        .from('department_tasks')
        .upsert({
          department_id: deptId,
          task_id: taskId,
          is_required: isRequired
        });

      if (error) throw error;

      fetchDepartmentTasks();
      toast({
        title: "Task Assignment Updated",
        description: "Task assignment has been updated successfully",
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive"
      });
    }
  };

  const resetDeptForm = () => {
    setIsCreatingDept(false);
    setEditingDept(null);
    setDeptFormData({ name: '' });
  };

  const resetTaskForm = () => {
    setIsCreatingTask(false);
    setEditingTask(null);
    setTaskFormData({ name: '', description: '', form_fields: [] });
  };

  const startEditingDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptFormData({ name: dept.name });
    setIsCreatingDept(false);
  };

  const startEditingTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      name: task.name,
      description: task.description,
      form_fields: task.form_fields || []
    });
    setIsCreatingTask(false);
  };

  const isTaskAssignedToDept = (deptId: string, taskId: string) => {
    return departmentTasks.some(dt => dt.department_id === deptId && dt.task_id === taskId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings Management</CardTitle>
          <CardDescription>
            Manage departments, tasks, and their assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="departments">
            <TabsList>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="assignments">Task Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="departments" className="space-y-4">
              {(isCreatingDept || editingDept) && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <Label htmlFor="dept_name">Department Name</Label>
                    <Input
                      id="dept_name"
                      value={deptFormData.name}
                      onChange={(e) => setDeptFormData({...deptFormData, name: e.target.value})}
                      placeholder="Enter department name"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={editingDept ? updateDepartment : createDepartment}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingDept ? 'Update Department' : 'Create Department'}
                    </Button>
                    <Button variant="outline" onClick={resetDeptForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!isCreatingDept && !editingDept && (
                <Button onClick={() => setIsCreatingDept(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Department
                </Button>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.filter(d => d.is_active).map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Active
                          </span>
                        </TableCell>
                        <TableCell>{new Date(dept.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingDept(dept)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteDepartment(dept.id)}
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
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              {(isCreatingTask || editingTask) && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <Label htmlFor="task_name">Task Name</Label>
                    <Input
                      id="task_name"
                      value={taskFormData.name}
                      onChange={(e) => setTaskFormData({...taskFormData, name: e.target.value})}
                      placeholder="Enter task name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task_description">Description</Label>
                    <Input
                      id="task_description"
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={editingTask ? updateTask : createTask}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                    <Button variant="outline" onClick={resetTaskForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!isCreatingTask && !editingTask && (
                <Button onClick={() => setIsCreatingTask(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.filter(t => t.is_active).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Active
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingTask(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
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
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <div>
                <Label htmlFor="select_dept">Select Department</Label>
                <Select value={selectedDeptForTasks} onValueChange={setSelectedDeptForTasks}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter(d => d.is_active).map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDeptForTasks && (
                <div className="space-y-2">
                  <h4 className="font-medium">Assign Tasks to {departments.find(d => d.id === selectedDeptForTasks)?.name}</h4>
                  {tasks.filter(t => t.is_active).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{task.name}</span>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <Checkbox
                        checked={isTaskAssignedToDept(selectedDeptForTasks, task.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            assignTaskToDepartment(selectedDeptForTasks, task.id, false);
                          } else {
                            // Remove assignment (you'd need a delete endpoint)
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManagement;
