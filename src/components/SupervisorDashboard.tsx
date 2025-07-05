
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  MapPin,
  BarChart3,
  FileText,
  Package,
  LogOut
} from 'lucide-react';

const SupervisorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'assets' | 'zones' | 'stats'>('tasks');
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [assetRequests, setAssetRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    activeEmployees: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'tasks') {
        const { data } = await supabase
          .from('task_submissions')
          .select(`
            *,
            employees:employee_id (name, employee_id)
          `)
          .eq('status', 'pending_review')
          .order('created_at', { ascending: false });
        setTaskSubmissions(data || []);
      }

      if (activeTab === 'assets') {
        const { data } = await supabase
          .from('asset_requests')
          .select(`
            *,
            employees:employee_id (name, employee_id),
            assets:asset_id (name, price)
          `)
          .eq('status', 'pending')
          .order('request_date', { ascending: false });
        setAssetRequests(data || []);
      }

      if (activeTab === 'zones' || activeTab === 'stats') {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('*')
          .eq('is_active', true);
        setEmployees(employeeData || []);

        // Fetch stats
        const { data: taskStats } = await supabase
          .from('task_submissions')
          .select('status');
        
        if (taskStats) {
          setStats({
            totalTasks: taskStats.length,
            pendingTasks: taskStats.filter(t => t.status === 'pending_review').length,
            completedTasks: taskStats.filter(t => t.status === 'completed').length,
            activeEmployees: employeeData?.length || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const approveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ 
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      
      fetchData();
      toast({
        title: "Task Approved",
        description: "Task has been approved successfully",
      });
    } catch (error) {
      console.error('Error approving task:', error);
      toast({
        title: "Error",
        description: "Failed to approve task",
        variant: "destructive",
      });
    }
  };

  const rejectTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      
      fetchData();
      toast({
        title: "Task Rejected",
        description: "Task has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast({
        title: "Error",
        description: "Failed to reject task",
        variant: "destructive",
      });
    }
  };

  const approveAssetRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('asset_requests')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchData();
      toast({
        title: "Asset Request Approved",
        description: "Asset request has been approved",
      });
    } catch (error) {
      console.error('Error approving asset request:', error);
      toast({
        title: "Error",
        description: "Failed to approve asset request",
        variant: "destructive",
      });
    }
  };

  const rejectAssetRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('asset_requests')
        .update({ 
          status: 'rejected',
          approved_by: user?.id,
          approved_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchData();
      toast({
        title: "Asset Request Rejected",
        description: "Asset request has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting asset request:', error);
      toast({
        title: "Error",
        description: "Failed to reject asset request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Supervisor Panel</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 min-w-0 px-3 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'tasks' 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <FileText className="h-4 w-4 mx-auto mb-1" />
            <div className="truncate">Tasks</div>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 min-w-0 px-3 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'assets' 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <Package className="h-4 w-4 mx-auto mb-1" />
            <div className="truncate">Assets</div>
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`flex-1 min-w-0 px-3 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'zones' 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <MapPin className="h-4 w-4 mx-auto mb-1" />
            <div className="truncate">Zones</div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 min-w-0 px-3 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'stats' 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <BarChart3 className="h-4 w-4 mx-auto mb-1" />
            <div className="truncate">Stats</div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {/* Task Approvals */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Task Approvals</h2>
            
            {taskSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No pending tasks to review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {taskSubmissions.map((task: any) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.task_type}</h3>
                            <p className="text-sm text-gray-600">{task.employees?.name}</p>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                        
                        {task.location_address && (
                          <p className="text-sm text-gray-600">📍 {task.location_address}</p>
                        )}
                        
                        {task.task_description && (
                          <p className="text-sm">{task.task_description}</p>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleDateString()} at {new Date(task.created_at).toLocaleTimeString()}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => approveTask(task.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => rejectTask(task.id)}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Asset Request Approvals */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Asset Requests</h2>
            
            {assetRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No pending asset requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {assetRequests.map((request: any) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{request.assets?.name}</h3>
                            <p className="text-sm text-gray-600">{request.employees?.name}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span> {request.quantity}
                          </div>
                          <div>
                            <span className="text-gray-500">Payment:</span> {request.payment_type === 'emi_plan' ? 'EMI' : 'One-time'}
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-gray-500">Amount:</span> ₹{
                            request.payment_type === 'emi_plan' 
                              ? `${request.monthly_emi?.toLocaleString()}/month`
                              : request.total_amount?.toLocaleString()
                          }
                        </div>
                        
                        <p className="text-sm text-gray-600">{request.reason}</p>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => approveAssetRequest(request.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => rejectAssetRequest(request.id)}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Zone Monitoring */}
        {activeTab === 'zones' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Employee Zone Monitoring</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Active Employees
                </CardTitle>
                <CardDescription>Monitor employee locations and zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-gray-600">{employee.employee_id}</p>
                        <p className="text-sm text-gray-500">{employee.department}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Zone A
                        </Badge>
                        <div className="text-xs text-gray-500">Last seen: 2 mins ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistics */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Statistics Overview</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.activeEmployees}</div>
                  <p className="text-sm text-gray-600">Active Employees</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Task Completion Rate</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="font-medium">2.5 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Employees Checked In</span>
                    <span className="font-medium">{stats.activeEmployees}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SupervisorDashboard;
