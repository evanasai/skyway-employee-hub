import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Camera, MapPin, Clock, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ErrorBoundary from './ErrorBoundary';
import LoadingState from './LoadingState';
import { useStatePersistence } from '@/hooks/useStatePersistence';
import { useTaskStatus } from '@/hooks/useTaskStatus';

const PREDEFINED_TASK_TYPES = [
  'Fiber Splicing',
  'ONT Installation',
  'New Connection Setup',
  'Troubleshooting / Repair',
  'Site Survey',
  'Backbone Testing',
  'Switch Configuration',
  'Pole Work / Cabling',
  'Customer Visit / Complaint Handling',
  'Other'
];

const TaskSubmissionForm = () => {
  const { user } = useAuth();
  const { updateTaskStatus, isTaskActive } = useTaskStatus(user);
  const [taskType, setTaskType] = useState('');
  const [customTaskType, setCustomTaskType] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [preWorkPhoto, setPreWorkPhoto] = useState<File | null>(null);
  const [postWorkPhoto, setPostWorkPhoto] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkingAttendance, setCheckingAttendance] = useState(true);
  const [activeTaskSubmissionId, setActiveTaskSubmissionId] = useState<string | null>(null);

  // State persistence for form data
  const formState = {
    taskType,
    customTaskType,
    taskDescription,
    comments,
    taskStatus,
    startTime: startTime?.toISOString()
  };

  const { restoreState } = useStatePersistence('task-form', formState, 'TaskSubmissionForm');

  useEffect(() => {
    // Restore form state if available
    const restored = restoreState();
    if (restored) {
      setTaskType(restored.taskType || '');
      setCustomTaskType(restored.customTaskType || '');
      setTaskDescription(restored.taskDescription || '');
      setComments(restored.comments || '');
      setTaskStatus(restored.taskStatus || 'not_started');
      if (restored.startTime) {
        setStartTime(new Date(restored.startTime));
      }
    }

    // Check attendance and get location
    checkAttendanceStatus();
    getCurrentLocation();
  }, []);

  const checkAttendanceStatus = async () => {
    if (!user) {
      setCheckingAttendance(false);
      return;
    }

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const today = new Date().toISOString().split('T')[0];
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('check_in_time', today)
          .order('check_in_time', { ascending: false })
          .limit(1)
          .single();

        if (attendance && attendance.status === 'checked_in') {
          setIsCheckedIn(true);
        } else {
          setIsCheckedIn(false);
          toast({
            title: "Check-in Required",
            description: "You must check in before submitting tasks.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.log('No attendance record found for today');
      setIsCheckedIn(false);
      
      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem(`debug_attendance_${Date.now()}`, JSON.stringify({
          message: 'Failed to check attendance status',
          error: error?.toString(),
          user: user?.employeeId
        }));
      }
    } finally {
      setCheckingAttendance(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude}, ${position.coords.longitude}`
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Access",
            description: "Could not get your current location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handlePreWorkPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreWorkPhoto(e.target.files[0]);
    }
  };

  const handlePostWorkPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPostWorkPhoto(e.target.files[0]);
    }
  };

  const handleStartTask = async () => {
    if (!isCheckedIn) {
      toast({
        title: "Check-in Required",
        description: "You must check in first before starting any task.",
        variant: "destructive",
      });
      return;
    }

    if (!taskType || (!taskDescription && taskType !== 'Other') || !preWorkPhoto) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload pre-work photo.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create initial task submission record
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user?.employeeId)
        .single();

      if (!employee) throw new Error('Employee record not found');

      const { data: taskSubmission, error } = await supabase
        .from('task_submissions')
        .insert({
          employee_id: employee.id,
          task_type: taskType === 'Other' ? customTaskType : taskType,
          task_description: taskDescription,
          location_lat: location?.lat,
          location_lng: location?.lng,
          location_address: location?.address,
          start_time: new Date().toISOString(),
          pre_work_photo: preWorkPhoto ? URL.createObjectURL(preWorkPhoto) : null,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      // Update task status to prevent logout
      await updateTaskStatus('task_started', taskSubmission.id);
      
      setActiveTaskSubmissionId(taskSubmission.id);
      setTaskStatus('in_progress');
      setStartTime(new Date());
      
      toast({
        title: "Task Started",
        description: "Task has been started. Complete your work and upload post-work photo.",
      });
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "Error",
        description: "Failed to start task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitTask = async () => {
    if (!isCheckedIn) {
      toast({
        title: "Check-in Required",
        description: "You must be checked in to submit tasks.",
        variant: "destructive",
      });
      return;
    }

    if (!postWorkPhoto || !activeTaskSubmissionId) {
      toast({
        title: "Missing Information",
        description: "Please upload a post-work photo and ensure task is properly started.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the existing task submission record
      const { error } = await supabase
        .from('task_submissions')
        .update({
          end_time: new Date().toISOString(),
          post_work_photo: URL.createObjectURL(postWorkPhoto),
          comments,
          status: 'submitted'
        })
        .eq('id', activeTaskSubmissionId);

      if (error) throw error;

      // Update task status to completed
      await updateTaskStatus('task_completed');

      toast({
        title: "Task Submitted Successfully",
        description: "Your task has been submitted for review.",
      });

      // Reset form
      setTaskType('');
      setCustomTaskType('');
      setTaskDescription('');
      setPreWorkPhoto(null);
      setPostWorkPhoto(null);
      setComments('');
      setTaskStatus('not_started');
      setStartTime(null);
      setActiveTaskSubmissionId(null);

      // Clear persisted state
      localStorage.removeItem('state_backup_task-form');

    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit task. Please try again.",
        variant: "destructive",
      });
      
      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem(`debug_submit_${Date.now()}`, JSON.stringify({
          message: 'Task submission failed',
          error: error?.toString(),
          taskType,
          user: user?.employeeId
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAttendance) {
    return <LoadingState type="card" message="Checking attendance status..." />;
  }

  if (!isCheckedIn) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Check-in Required
            </CardTitle>
            <CardDescription>
              You must check in first before you can submit any tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not Checked In</h3>
              <p className="text-gray-600 mb-4">
                Please go back to the dashboard and check in before submitting tasks.
              </p>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="Task Submission Form">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Task Submission
            </CardTitle>
            <CardDescription>
              Submit your field work tasks with photos and location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Info */}
            {location && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Location captured: {location.address}
                </span>
              </div>
            )}

            {/* Check-in Status */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                ✓ Checked In - You can submit tasks
              </span>
            </div>

            {/* Task Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type *</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_TASK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Task Type Input */}
            {taskType === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="customTaskType">Custom Task Type *</Label>
                <Input
                  id="customTaskType"
                  value={customTaskType}
                  onChange={(e) => setCustomTaskType(e.target.value)}
                  placeholder="Enter custom task type"
                />
              </div>
            )}

            {/* Task Description */}
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Task Description *</Label>
              <Textarea
                id="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe the task to be performed"
                rows={3}
              />
            </div>

            {/* Pre-Work Photo */}
            <div className="space-y-2">
              <Label htmlFor="preWorkPhoto">Pre-Work Photo *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="preWorkPhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePreWorkPhotoChange}
                  disabled={taskStatus !== 'not_started'}
                />
                {preWorkPhoto && (
                  <span className="text-sm text-green-600">✓ Photo uploaded</span>
                )}
              </div>
            </div>

            {/* Start Task Button */}
            {taskStatus === 'not_started' && (
              <Button onClick={handleStartTask} className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Start Task
              </Button>
            )}

            {/* Task In Progress Status */}
            {taskStatus === 'in_progress' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Task In Progress</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Started at: {startTime?.toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Post-Work Photo */}
            {taskStatus === 'in_progress' && (
              <div className="space-y-2">
                <Label htmlFor="postWorkPhoto">Post-Work Photo *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="postWorkPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePostWorkPhotoChange}
                  />
                  {postWorkPhoto && (
                    <span className="text-sm text-green-600">✓ Photo uploaded</span>
                  )}
                </div>
              </div>
            )}

            {/* Comments */}
            {taskStatus === 'in_progress' && (
              <div className="space-y-2">
                <Label htmlFor="comments">Comments / Notes (Optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional notes or comments"
                  rows={3}
                />
              </div>
            )}

            {/* Submit Task Button */}
            {taskStatus === 'in_progress' && (
              <Button 
                onClick={handleSubmitTask} 
                disabled={isSubmitting || !postWorkPhoto}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Task
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default TaskSubmissionForm;
