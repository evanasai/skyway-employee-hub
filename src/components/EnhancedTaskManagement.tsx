
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Eye, Plus } from 'lucide-react';
import { TaskSubmission } from '@/types/database';
import TaskCreationForm from './TaskCreationForm';
import TasksList from './TasksList';

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
    // Mock data for tasks since we don't have a tasks table yet
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Daily Security Patrol',
        description: 'Complete security rounds of assigned zone',
        task_type: 'Security Check',
        employee_type: 'security',
        assigned_to: [],
        priority: 'high',
        due_date: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Equipment Maintenance',
        description: 'Check and maintain equipment in good working condition',
        task_type: 'Maintenance',
        employee_type: 'technician',
        assigned_to: [],
        priority: 'medium',
        due_date: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];
    setTasks(mockTasks);
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

    // Create new task (mock implementation)
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      task_type: taskForm.task_type,
      employee_type: taskForm.employee_type,
      assigned_to: taskForm.assigned_to,
      priority: taskForm.priority,
      due_date: taskForm.due_date,
      status: 'active',
      created_at: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);

    toast({
      title: "Task Created",
      description: `Task "${taskForm.title}" has been created and assigned to ${taskForm.employee_type} employees`,
    });

    resetTaskForm();
  };

  const updateTask = async () => {
    if (!editingTask) return;

    const updatedTask: Task = {
      ...editingTask,
      title: taskForm.title,
      description: taskForm.description,
      task_type: taskForm.task_type,
      employee_type: taskForm.employee_type,
      assigned_to: taskForm.assigned_to,
      priority: taskForm.priority,
      due_date: taskForm.due_date
    };

    setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));

    toast({
      title: "Task Updated",
      description: `Task "${taskForm.title}" has been updated successfully`,
    });

    resetTaskForm();
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    toast({
      title: "Task Deleted",
      description: "Task has been deleted successfully",
    });
  };

  const startEditingTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      employee_type: task.employee_type,
      assigned_to: task.assigned_to,
      priority: task.priority,
      due_date: task.due_date
    });
    setIsCreatingTask(true);
  };

  const resetTaskForm = () => {
    setIsCreatingTask(false);
    setEditingTask(null);
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
        description: `Task submission has been ${status}`,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>
            Create tasks, assign to employee types, and review task submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TaskCreationForm
            isCreating={isCreatingTask}
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            employees={employees}
            employeeTypes={employeeTypes}
            taskTypes={taskTypes}
            onSave={editingTask ? updateTask : createTask}
            onCancel={resetTaskForm}
          />

          {!isCreatingTask && (
            <Button onClick={() => setIsCreatingTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
          )}

          <TasksList
            tasks={tasks}
            onEdit={startEditingTask}
            onDelete={deleteTask}
            employeeTypes={employeeTypes}
          />

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Task Submissions Review</h3>
            
            <div className="flex space-x-2 mb-4">
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
