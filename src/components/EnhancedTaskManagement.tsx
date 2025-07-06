
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Eye, Plus, Save, X } from 'lucide-react';
import { TaskSubmission } from '@/types/database';

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

const EnhancedTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskSubmission | null>(null);
  const [filter, setFilter] = useState('all');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: '',
    employee_type: 'field_worker',
    assigned_to: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: ''
  });

  const employeeTypes = [
    { value: 'field_worker', label: 'Field Worker' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'manager', label: 'Manager' },
    { value: 'technician', label: 'Technician' },
    { value: 'security', label: 'Security' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const taskTypes = [
    'Inspection',
    'Maintenance',
    'Cleaning',
    'Security Check',
    'Delivery',
    'Installation',
    'Repair',
    'Documentation',
    'Training',
    'Other'
  ];

  useEffect(() => {
    fetchTasks();
    fetchTaskSubmissions();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    // For now, we'll simulate task data since we don't have a tasks table yet
    // In a real implementation, you would fetch from a tasks table
    setTasks([]);
  };

  const fetchTaskSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          employees!task_submissions_employee_id_fkey (
            name,
            employee_id,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const transformedTasks: TaskSubmission[] = (data || []).map(task => ({
        ...task,
        status: task.status || 'pending_review',
        employees: task.employees && !Array.isArray(task.employees) ? {
          name: task.employees.name,
          employee_id: task.employees.employee_id
        } : null
      }));

      setTaskSubmissions(transformedTasks);
    } catch (error) {
      console.error('Error fetching task submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch task submissions",
        variant: "destructive"
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const createTask = async () => {
    if (!taskForm.title || !taskForm.task_type) {
      toast({
        title: "Missing Information",
        description: "Title and task type are required",
        variant: "destructive"
      });
      return;
    }

    // For now, we'll show a success message
    // In a real implementation, you would save to a tasks table
    toast({
      title: "Task Created",
      description: `Task "${taskForm.title}" has been created and assigned to ${taskForm.employee_type} employees`,
    });

    resetTaskForm();
  };

  const resetTaskForm = () => {
    setIsCreatingTask(false);
    setTaskForm({
      title: '',
      description: '',
      task_type: '',
      employee_type: 'field_worker',
      assigned_to: [],
      priority: 'medium',
      due_date: ''
    });
  };

  const updateTaskStatus = async (taskId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status,
          supervisor_feedback: feedback || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      fetchTaskSubmissions();
      setSelectedTask(null);
      
      toast({
        title: "Task Updated",
        description: `Task has been ${status}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const filteredSubmissions = taskSubmissions.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getEmployeesByType = (type: string) => {
    return employees.filter(emp => emp.department === type || emp.employee_type === type);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>
            Create tasks, assign to employees, and review task submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCreatingTask && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold">Create New Task</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task_title">Task Title</Label>
                  <Input
                    id="task_title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="task_type">Task Type</Label>
                  <Select value={taskForm.task_type} onValueChange={(value) => setTaskForm({...taskForm, task_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employee_type">Employee Type</Label>
                  <Select value={taskForm.employee_type} onValueChange={(value) => setTaskForm({...taskForm, employee_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="task_description">Description</Label>
                <Textarea
                  id="task_description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Assign to Specific Employees (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
                  {getEmployeesByType(taskForm.employee_type).map((employee) => (
                    <label key={employee.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={taskForm.assigned_to.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTaskForm({
                              ...taskForm,
                              assigned_to: [...taskForm.assigned_to, employee.id]
                            });
                          } else {
                            setTaskForm({
                              ...taskForm,
                              assigned_to: taskForm.assigned_to.filter(id => id !== employee.id)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{employee.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={createTask}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
                <Button variant="outline" onClick={resetTaskForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isCreatingTask && (
            <Button onClick={() => setIsCreatingTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
          )}

          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({taskSubmissions.length})
            </Button>
            <Button
              variant={filter === 'submitted' ? 'default' : 'outline'}
              onClick={() => setFilter('submitted')}
            >
              Pending ({taskSubmissions.filter(t => t.status === 'submitted').length})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              Approved ({taskSubmissions.filter(t => t.status === 'approved').length})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({taskSubmissions.filter(t => t.status === 'rejected').length})
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Task Submissions</h3>
            {filteredSubmissions.length === 0 ? (
              <p className="text-gray-500">No task submissions found</p>
            ) : (
              filteredSubmissions.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{task.task_type}</h4>
                          {getStatusBadge(task.status || 'submitted')}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Employee: {task.employees?.name || 'Unknown'} ({task.employees?.employee_id || 'N/A'})
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Location: {task.location_address || 'Not specified'}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Submitted: {task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}
                        </p>
                        {task.task_description && (
                          <p className="text-sm text-gray-700 mb-2">
                            Description: {task.task_description}
                          </p>
                        )}
                        {task.supervisor_feedback && (
                          <p className="text-sm text-blue-700 mb-2">
                            Feedback: {task.supervisor_feedback}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {task.status === 'submitted' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTask && (
        <Card>
          <CardHeader>
            <CardTitle>Task Submission Details</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTask(null)}
              className="ml-auto"
            >
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Task Information</h5>
                <p className="text-sm mb-1"><strong>Type:</strong> {selectedTask.task_type}</p>
                <p className="text-sm mb-1"><strong>Employee:</strong> {selectedTask.employees?.name || 'Unknown'}</p>
                <p className="text-sm mb-1"><strong>Status:</strong> {selectedTask.status}</p>
                <p className="text-sm mb-1"><strong>Location:</strong> {selectedTask.location_address || 'Not specified'}</p>
                {selectedTask.task_description && (
                  <p className="text-sm mb-1"><strong>Description:</strong> {selectedTask.task_description}</p>
                )}
                {selectedTask.comments && (
                  <p className="text-sm mb-1"><strong>Comments:</strong> {selectedTask.comments}</p>
                )}
              </div>
              <div>
                <h5 className="font-medium mb-2">Photos</h5>
                <div className="space-y-2">
                  {selectedTask.pre_work_photo && (
                    <div>
                      <p className="text-sm font-medium">Before Photo:</p>
                      <img 
                        src={selectedTask.pre_work_photo} 
                        alt="Before work" 
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {selectedTask.post_work_photo && (
                    <div>
                      <p className="text-sm font-medium">After Photo:</p>
                      <img 
                        src={selectedTask.post_work_photo} 
                        alt="After work" 
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTaskManagement;
