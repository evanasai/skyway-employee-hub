
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
  department_id: string;
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

const EnhancedTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskSubmission | null>(null);
  const [filter, setFilter] = useState('all');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: '',
    department_id: '',
    required_fields: {
      location: false,
      photos: false,
      comments: false,
      start_end_time: false,
      additional_notes: false
    }
  });

  useEffect(() => {
    fetchTasks();
    fetchTaskSubmissions();
    fetchDepartments();
    fetchAvailableTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('task_definitions')
        .select(`
          *,
          departments!task_definitions_department_id_fkey (
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedTasks: Task[] = (data || []).map(task => {
        let requiredFields = {
          location: false,
          photos: false,
          comments: false,
          start_end_time: false,
          additional_notes: false
        };

        // Parse required_fields if it's a valid object
        if (task.required_fields && typeof task.required_fields === 'object' && !Array.isArray(task.required_fields)) {
          const fields = task.required_fields as Record<string, any>;
          requiredFields = {
            location: Boolean(fields.location),
            photos: Boolean(fields.photos),
            comments: Boolean(fields.comments),
            start_end_time: Boolean(fields.start_end_time),
            additional_notes: Boolean(fields.additional_notes)
          };
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          task_type: task.task_type,
          department_id: task.department_id,
          status: 'active' as const,
          created_at: task.created_at,
          required_fields: requiredFields
        };
      });

      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch task definitions",
        variant: "destructive"
      });
    }
  };

  const fetchAvailableTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableTasks(data || []);
    } catch (error) {
      console.error('Error fetching available tasks:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
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

  const createTask = async () => {
    if (!taskForm.title || !taskForm.task_type || !taskForm.department_id) {
      toast({
        title: "Missing Information",
        description: "Title, task type, and department are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('task_definitions')
        .insert({
          title: taskForm.title,
          description: taskForm.description,
          task_type: taskForm.task_type,
          department_id: taskForm.department_id,
          required_fields: taskForm.required_fields,
          is_active: true
        });

      if (error) throw error;

      await fetchTasks();

      toast({
        title: "Task Created",
        description: `Task "${taskForm.title}" has been created successfully`,
      });

      resetTaskForm();
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
        .from('task_definitions')
        .update({
          title: taskForm.title,
          description: taskForm.description,
          task_type: taskForm.task_type,
          department_id: taskForm.department_id,
          required_fields: taskForm.required_fields,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      await fetchTasks();

      toast({
        title: "Task Updated",
        description: `Task "${taskForm.title}" has been updated successfully`,
      });

      resetTaskForm();
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
        .from('task_definitions')
        .update({ is_active: false })
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully",
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

  const startEditingTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      department_id: task.department_id,
      required_fields: task.required_fields
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
      department_id: '',
      required_fields: {
        location: false,
        photos: false,
        comments: false,
        start_end_time: false,
        additional_notes: false
      }
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
            departments={departments}
            availableTasks={availableTasks}
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
