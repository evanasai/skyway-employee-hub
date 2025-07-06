import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { TaskSubmission } from '@/types/database';

const TaskManagement = () => {
  const [tasks, setTasks] = useState<TaskSubmission[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskSubmission | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          employees!task_submissions_employee_id_fkey (
            name,
            employee_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedTasks: TaskSubmission[] = (data || []).map(task => ({
        ...task,
        status: task.status || 'pending_review', // Ensure status has a default value
        employees: task.employees && !Array.isArray(task.employees) ? {
          name: task.employees.name,
          employee_id: task.employees.employee_id
        } : null
      }));

      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch task submissions",
        variant: "destructive"
      });
    }
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

      fetchTasks();
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>
            Review and approve employee task submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({tasks.length})
            </Button>
            <Button
              variant={filter === 'submitted' ? 'default' : 'outline'}
              onClick={() => setFilter('submitted')}
            >
              Pending ({tasks.filter(t => t.status === 'submitted').length})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              Approved ({tasks.filter(t => t.status === 'approved').length})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({tasks.filter(t => t.status === 'rejected').length})
            </Button>
          </div>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <p className="text-gray-500">No tasks found</p>
            ) : (
              filteredTasks.map((task) => (
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
                          Time: {task.start_time ? new Date(task.start_time).toLocaleString() : 'N/A'} - {task.end_time ? new Date(task.end_time).toLocaleString() : 'N/A'}
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
            <CardTitle>Task Details</CardTitle>
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

export default TaskManagement;
