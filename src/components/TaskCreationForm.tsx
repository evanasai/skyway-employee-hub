
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
  employee_type: string;
  assigned_to: string[];
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

interface TaskCreationFormProps {
  isCreating: boolean;
  taskForm: TaskFormData;
  setTaskForm: (form: TaskFormData) => void;
  employees: any[];
  employeeTypes: { value: string; label: string }[];
  taskTypes: string[];
  onSave: () => void;
  onCancel: () => void;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  isCreating,
  taskForm,
  setTaskForm,
  employees,
  employeeTypes,
  taskTypes,
  onSave,
  onCancel
}) => {
  if (!isCreating) return null;

  const getEmployeesByType = (type: string) => {
    return employees.filter(emp => emp.department === type || emp.employee_type === type);
  };

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
              {taskTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="employee_type">Target Employee Type</Label>
          <Select value={taskForm.employee_type} onValueChange={(value) => setTaskForm({...taskForm, employee_type: value, assigned_to: []})}>
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
      
      {taskForm.employee_type && (
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
          {getEmployeesByType(taskForm.employee_type).length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No employees found for this type</p>
          )}
        </div>
      )}

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
