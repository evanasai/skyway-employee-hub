
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Camera, MapPin, Clock, Upload, CheckCircle } from 'lucide-react';

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

  useEffect(() => {
    // Get current location
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
  }, []);

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

  const handleStartTask = () => {
    if (!taskType || (!taskDescription && taskType !== 'Other') || !preWorkPhoto) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload pre-work photo.",
        variant: "destructive",
      });
      return;
    }

    setTaskStatus('in_progress');
    setStartTime(new Date());
    toast({
      title: "Task Started",
      description: "Task has been started. Complete your work and upload post-work photo.",
    });
  };

  const handleSubmitTask = async () => {
    if (!postWorkPhoto) {
      toast({
        title: "Missing Post-Work Photo",
        description: "Please upload a photo after completing the work.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual implementation
      const taskSubmission = {
        id: Date.now().toString(),
        employeeId: user?.id || '',
        employeeName: user?.name || '',
        taskType: taskType === 'Other' ? customTaskType : taskType,
        taskDescription,
        location: location || { latitude: 0, longitude: 0 },
        startTime: startTime || new Date(),
        endTime: new Date(),
        preWorkPhoto: URL.createObjectURL(preWorkPhoto!),
        postWorkPhoto: URL.createObjectURL(postWorkPhoto),
        comments,
        status: 'completed' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Task submitted:', taskSubmission);

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

    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};

export default TaskSubmissionForm;
