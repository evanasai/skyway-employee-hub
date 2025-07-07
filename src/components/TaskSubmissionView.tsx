
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, CheckCircle, Clock, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TaskSubmissionViewProps {
  onBack: () => void;
}

interface TaskSubmission {
  id: string;
  task_type: string;
  task_description: string;
  status: string;
  created_at: string;
  start_time: string;
  end_time: string;
  location_address: string;
}

const TaskSubmissionView = ({ onBack }: TaskSubmissionViewProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [formData, setFormData] = useState({
    task_type: '',
    task_description: '',
    start_time: '',
    end_time: '',
    location_address: '',
    comments: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { data, error } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('employee_id', employee.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching task submissions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { error } = await supabase
          .from('task_submissions')
          .insert([{
            employee_id: employee.id,
            ...formData,
            status: 'submitted'
          }]);

        if (error) throw error;

        toast({
          title: "Task Submitted",
          description: "Your task has been submitted successfully.",
        });

        setFormData({
          task_type: '',
          task_description: '',
          start_time: '',
          end_time: '',
          location_address: '',
          comments: ''
        });
        setShowForm(false);
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Error",
        description: "Failed to submit task.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Task Submissions</h2>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit Task
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Select value={formData.task_type} onValueChange={(value) => setFormData({...formData, task_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="task_description">Task Description</Label>
                <Textarea
                  value={formData.task_description}
                  onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                  placeholder="Describe the task performed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location_address">Location</Label>
                <Input
                  value={formData.location_address}
                  onChange={(e) => setFormData({...formData, location_address: e.target.value})}
                  placeholder="Task location address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  placeholder="Any additional comments or observations"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Submit Task</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(submission.status)}
                    <h3 className="font-semibold capitalize">{submission.task_type}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{submission.task_description}</p>
                  <p className="text-xs text-gray-500">
                    Location: {submission.location_address}
                  </p>
                  <p className="text-xs text-gray-500">
                    Duration: {new Date(submission.start_time).toLocaleString()} - {new Date(submission.end_time).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium capitalize">{submission.status}</span>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {submissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No task submissions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskSubmissionView;
