
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

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
}

interface DepartmentTaskFormProps {
  departments: Department[];
  editingTask: DepartmentTask | null;
  isLoading: boolean;
  onSubmit: (formData: any) => Promise<boolean>;
  onCancel: () => void;
}

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
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const DepartmentTaskForm = ({ 
  departments, 
  editingTask, 
  isLoading, 
  onSubmit, 
  onCancel 
}: DepartmentTaskFormProps) => {
  const [formData, setFormData] = useState({
    department_id: '',
    task_name: '',
    task_description: '',
    task_type: '',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        department_id: editingTask.department_id,
        task_name: editingTask.task_name,
        task_description: editingTask.task_description || '',
        task_type: editingTask.task_type,
        priority: editingTask.priority,
        due_date: editingTask.due_date ? new Date(editingTask.due_date).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        department_id: '',
        task_name: '',
        task_description: '',
        task_type: '',
        priority: 'medium',
        due_date: ''
      });
    }
  }, [editingTask]);

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      onCancel(); // This will also reset the form
    }
  };

  return (
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
          onClick={handleSubmit}
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
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DepartmentTaskForm;
