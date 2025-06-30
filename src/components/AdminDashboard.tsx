
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  FileText, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';

// Mock data - replace with actual data fetching
const mockTaskSubmissions = [
  {
    id: '1',
    employeeName: 'John Doe',
    taskType: 'Fiber Splicing',
    location: 'Downtown Area',
    startTime: new Date('2024-01-15T09:00:00'),
    endTime: new Date('2024-01-15T11:30:00'),
    status: 'pending_review',
    createdAt: new Date('2024-01-15T11:30:00')
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    taskType: 'ONT Installation',
    location: 'Residential Complex',
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-15T12:00:00'),
    status: 'approved',
    createdAt: new Date('2024-01-15T12:00:00')
  }
];

const mockTaskTypes = [
  { id: '1', name: 'Fiber Splicing', description: 'Fiber optic cable splicing work', isActive: true },
  { id: '2', name: 'ONT Installation', description: 'Optical Network Terminal installation', isActive: true },
  { id: '3', name: 'Site Survey', description: 'Location survey and assessment', isActive: true }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'task-types' | 'reports'>('tasks');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskTypes, setTaskTypes] = useState(mockTaskTypes);
  const [newTaskType, setNewTaskType] = useState({ name: '', description: '' });
  const [isAddingTaskType, setIsAddingTaskType] = useState(false);

  const handleTaskReview = (taskId: string, status: 'approved' | 'rejected', feedback?: string) => {
    console.log('Reviewing task:', taskId, status, feedback);
    toast({
      title: "Task Reviewed",
      description: `Task has been ${status}`,
    });
  };

  const handleAddTaskType = () => {
    if (!newTaskType.name.trim()) {
      toast({
        title: "Error",
        description: "Task type name is required",
        variant: "destructive",
      });
      return;
    }

    const taskType = {
      id: Date.now().toString(),
      name: newTaskType.name,
      description: newTaskType.description,
      isActive: true
    };

    setTaskTypes([...taskTypes, taskType]);
    setNewTaskType({ name: '', description: '' });
    setIsAddingTaskType(false);
    
    toast({
      title: "Task Type Added",
      description: "New task type has been created",
    });
  };

  const handleDeleteTaskType = (id: string) => {
    setTaskTypes(taskTypes.filter(t => t.id !== id));
    toast({
      title: "Task Type Deleted",
      description: "Task type has been removed",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage tasks, employees, and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('tasks')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Task Management
            </Button>
            <Button
              variant={activeTab === 'task-types' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('task-types')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Task Types
            </Button>
            <Button
              variant={activeTab === 'reports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('reports')}
            >
              <Users className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Task Submissions</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Task Submissions</CardTitle>
                  <CardDescription>Review and manage employee task submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Task Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTaskSubmissions.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.employeeName}</TableCell>
                          <TableCell>{task.taskType}</TableCell>
                          <TableCell>{task.location}</TableCell>
                          <TableCell>
                            {Math.round((task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60))} min
                          </TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{task.createdAt.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Task Details</DialogTitle>
                                    <DialogDescription>Review task submission and provide feedback</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Employee</Label>
                                        <p className="text-sm">{task.employeeName}</p>
                                      </div>
                                      <div>
                                        <Label>Task Type</Label>
                                        <p className="text-sm">{task.taskType}</p>
                                      </div>
                                      <div>
                                        <Label>Start Time</Label>
                                        <p className="text-sm">{task.startTime.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <Label>End Time</Label>
                                        <p className="text-sm">{task.endTime.toLocaleString()}</p>
                                      </div>
                                    </div>
                                    
                                    {task.status === 'pending_review' && (
                                      <div className="flex space-x-2 pt-4">
                                        <Button 
                                          onClick={() => handleTaskReview(task.id, 'approved')}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Approve
                                        </Button>
                                        <Button 
                                          onClick={() => handleTaskReview(task.id, 'rejected')}
                                          variant="destructive"
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'task-types' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Task Types Management</h2>
                <Dialog open={isAddingTaskType} onOpenChange={setIsAddingTaskType}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task Type</DialogTitle>
                      <DialogDescription>Create a new task type for employees to select</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Task Type Name *</Label>
                        <Input
                          id="name"
                          value={newTaskType.name}
                          onChange={(e) => setNewTaskType({...newTaskType, name: e.target.value})}
                          placeholder="Enter task type name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTaskType.description}
                          onChange={(e) => setNewTaskType({...newTaskType, description: e.target.value})}
                          placeholder="Enter task description"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddingTaskType(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTaskType}>
                          Add Task Type
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Manage Task Types</CardTitle>
                  <CardDescription>Configure available task types for employee selection</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskTypes.map((taskType) => (
                        <TableRow key={taskType.id}>
                          <TableCell className="font-medium">{taskType.name}</TableCell>
                          <TableCell>{taskType.description}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              taskType.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {taskType.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteTaskType(taskType.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Reports & Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">24</div>
                    <p className="text-sm text-gray-600">This month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">3</div>
                    <p className="text-sm text-gray-600">Awaiting approval</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">92%</div>
                    <p className="text-sm text-gray-600">Average completion</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
