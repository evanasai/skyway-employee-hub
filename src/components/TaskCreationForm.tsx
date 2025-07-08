
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface TaskFormData {
  title: string;
  description: string;
  task_type: string;
  department_id: string;
  required_fields: {
    location: boolean;
    photos: boolean;
    comments: boolean;
    start_end_time: boolean;
    additional_notes: boolean;
  };
}

interface TaskCreationFormProps {
  isCreating: boolean;
  taskForm: TaskFormData;
  setTaskForm: (form: TaskFormData) => void;
  departments: any[];
  availableTasks: any[];
  onSave: () => void;
  onCancel: () => void;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  isCreating,
  taskForm,
  setTaskForm,
  departments,
  availableTasks,
  onSave,
  onCancel
}) => {
  if (!isCreating) return null;

  return (
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
              {availableTasks.map((task) => (
                <SelectItem key={task.id} value={task.name}>
                  {task.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={taskForm.department_id} onValueChange={(value) => setTaskForm({...taskForm, department_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Label>Required Information for Employee Reports</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={taskForm.required_fields.location}
              onChange={(e) => setTaskForm({
                ...taskForm,
                required_fields: { ...taskForm.required_fields, location: e.target.checked }
              })}
              className="rounded"
            />
            <span className="text-sm">Location/Address</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={taskForm.required_fields.photos}
              onChange={(e) => setTaskForm({
                ...taskForm,
                required_fields: { ...taskForm.required_fields, photos: e.target.checked }
              })}
              className="rounded"
            />
            <span className="text-sm">Before/After Photos</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={taskForm.required_fields.comments}
              onChange={(e) => setTaskForm({
                ...taskForm,
                required_fields: { ...taskForm.required_fields, comments: e.target.checked }
              })}
              className="rounded"
            />
            <span className="text-sm">Comments/Notes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={taskForm.required_fields.start_end_time}
              onChange={(e) => setTaskForm({
                ...taskForm,
                required_fields: { ...taskForm.required_fields, start_end_time: e.target.checked }
              })}
              className="rounded"
            />
            <span className="text-sm">Start/End Time</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={taskForm.required_fields.additional_notes}
              onChange={(e) => setTaskForm({
                ...taskForm,
                required_fields: { ...taskForm.required_fields, additional_notes: e.target.checked }
              })}
              className="rounded"
            />
            <span className="text-sm">Additional Notes</span>
          </label>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Create Task
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TaskCreationForm;
