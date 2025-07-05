import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import MapZoneEditor from './MapZoneEditor';
import InventoryManagement from './InventoryManagement';
import ReportDownloader from './ReportDownloader';
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
  Trash2,
  LogOut,
  DollarSign,
  Package,
  Download,
  BarChart3,
  Phone,
  Mail,
  Key,
  MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'salary' | 'inventory' | 'reports' | 'asset-requests' | 'zones' | 'custom-reports'>('tasks');
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetRequests, setAssetRequests] = useState([]);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'employee',
    salary: '',
    password: ''
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
          .order('created_at', { ascending: false });
        setTaskSubmissions(data || []);
      }

      if (activeTab === 'employees') {
        const { data } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });
        setEmployees(data || []);
      }

      if (activeTab === 'inventory') {
        const { data } = await supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false });
        setAssets(data || []);
      }

      if (activeTab === 'asset-requests') {
        const { data } = await supabase
          .from('asset_requests')
          .select(`
            *,
            employees:employee_id (name, employee_id),
            assets:asset_id (name, price)
          `)
          .order('request_date', { ascending: false });
        setAssetRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name.trim() || !newEmployee.employee_id.trim() || !newEmployee.password.trim()) {
      toast({
        title: "Error",
        description: "Employee name, ID, and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          employee_id: newEmployee.employee_id,
          name: newEmployee.name,
          email: newEmployee.email,
          phone: newEmployee.phone,
          department: newEmployee.department,
          role: newEmployee.role,
          salary: parseFloat(newEmployee.salary) || 0,
          password: parseInt(newEmployee.password)
        });

      if (error) throw error;

      setNewEmployee({ employee_id: '', name: '', email: '', phone: '', department: '', role: 'employee', salary: '', password: '' });
      setIsAddingEmployee(false);
      fetchData();
      
      toast({
        title: "Employee Added",
        description: "New employee has been created with login credentials",
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .update({ password: parseInt(newPassword) })
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      setIsSettingPassword(false);
      setSelectedEmployee(null);
      setNewPassword('');
      fetchData();
      
      toast({
        title: "Password Updated",
        description: "Employee login password has been updated",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
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
          approved_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Add deduction to employee
      const request = assetRequests.find(r => r.id === requestId);
      if (request) {
        await supabase
          .from('employee_deductions')
          .insert({
            employee_id: request.employee_id,
            deduction_type: request.payment_type === 'emi_plan' ? 'asset_emi' : 'asset_purchase',
            amount: request.payment_type === 'emi_plan' ? request.monthly_emi : request.total_amount,
            description: `${request.assets.name} - ${request.payment_type}`,
            reference_id: requestId
          });
      }

      fetchData();
      toast({
        title: "Request Approved",
        description: "Asset request has been approved and deduction added",
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
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
              <p className="text-gray-600">Manage employees, tasks, and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
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
              variant={activeTab === 'employees' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('employees')}
            >
              <Users className="mr-2 h-4 w-4" />
              Employee Management
            </Button>
            <Button
              variant={activeTab === 'salary' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('salary')}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Salary Management
            </Button>
            <Button
              variant={activeTab === 'asset-requests' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('asset-requests')}
            >
              <Package className="mr-2 h-4 w-4" />
              Asset Requests
            </Button>
            <Button
              variant={activeTab === 'inventory' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('inventory')}
            >
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </Button>
            <Button
              variant={activeTab === 'zones' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('zones')}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Zone Management
            </Button>
            <Button
              variant={activeTab === 'custom-reports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('custom-reports')}
            >
              <Download className="mr-2 h-4 w-4" />
              Custom Reports
            </Button>
            <Button
              variant={activeTab === 'reports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports & Analytics
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Contact Information */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('tel:+917842288660')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +91 7842288660
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://wa.me/917842288660')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('mailto:info@skywaynetworks.in')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  info@skywaynetworks.in
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Zone Management Tab */}
          {activeTab === 'zones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Enhanced Zone Management</h2>
              </div>
              <MapZoneEditor />
            </div>
          )}

          {/* Enhanced Inventory Management Tab */}
          {activeTab === 'inventory' && (
            <InventoryManagement />
          )}

          {/* Custom Reports Tab */}
          {activeTab === 'custom-reports' && (
            <ReportDownloader />
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Task Submissions</h2>
                <Button onClick={() => toast({ title: "Download Started", description: "Tasks report is being downloaded" })}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskSubmissions.map((task: any) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.employees?.name}</TableCell>
                          <TableCell>{task.task_type}</TableCell>
                          <TableCell>{task.location_address || 'Not specified'}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{new Date(task.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Employee Management</h2>
                <div className="flex space-x-2">
                  <Button onClick={() => toast({ title: "Download Started", description: "Employee report is being downloaded" })}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>Create a new employee record with login credentials</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="employeeId">Employee ID *</Label>
                            <Input
                              id="employeeId"
                              value={newEmployee.employee_id}
                              onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                              placeholder="EMP001"
                            />
                          </div>
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={newEmployee.name}
                              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newEmployee.email}
                              onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                              placeholder="john@skywaynetworks.in"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={newEmployee.phone}
                              onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                              placeholder="+91 9876543210"
                            />
                          </div>
                          <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                              id="department"
                              value={newEmployee.department}
                              onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                              placeholder="Field Operations"
                            />
                          </div>
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="salary">Base Salary</Label>
                            <Input
                              id="salary"
                              type="number"
                              value={newEmployee.salary}
                              onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                              placeholder="25000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Login Password *</Label>
                            <Input
                              id="password"
                              type="number"
                              value={newEmployee.password}
                              onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                              placeholder="123456"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddEmployee}>
                            Add Employee
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Password Update Dialog */}
              <Dialog open={isSettingPassword} onOpenChange={setIsSettingPassword}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Login Password</DialogTitle>
                    <DialogDescription>
                      Set new login password for {selectedEmployee?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="number"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setIsSettingPassword(false);
                        setSelectedEmployee(null);
                        setNewPassword('');
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleSetPassword}>
                        Update Password
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Card>
                <CardHeader>
                  <CardTitle>Employee Database</CardTitle>
                  <CardDescription>Manage employee records and login credentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee: any) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.employee_id}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() => window.open(`mailto:${employee.email}`)}
                            >
                              {employee.email}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() => window.open(`tel:${employee.phone}`)}
                            >
                              {employee.phone}
                            </Button>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.role}</TableCell>
                          <TableCell>₹{employee.salary?.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsSettingPassword(true);
                                }}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
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

          {activeTab === 'asset-requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Asset Requests</h2>
                <Button onClick={() => toast({ title: "Download Started", description: "Asset requests report is being downloaded" })}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Asset Requests</CardTitle>
                  <CardDescription>Review and approve employee asset requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Payment Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assetRequests.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.employees?.name}</TableCell>
                          <TableCell>{request.assets?.name}</TableCell>
                          <TableCell>{request.quantity}</TableCell>
                          <TableCell>
                            {request.payment_type === 'emi_plan' ? `EMI (${request.emi_months}m)` : 'One-time'}
                          </TableCell>
                          <TableCell>
                            ₹{request.payment_type === 'emi_plan' 
                              ? request.monthly_emi.toLocaleString() + '/month'
                              : request.total_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm"
                                  onClick={() => approveAssetRequest(request.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Salary Management</h2>
                <Button onClick={() => toast({ title: "Download Started", description: "Salary report is being downloaded" })}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Payroll
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Employee Salary Overview</CardTitle>
                  <CardDescription>Manage salaries, advances, ESI, PF, and EMI</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>Advances</TableHead>
                        <TableHead>ESI</TableHead>
                        <TableHead>PF</TableHead>
                        <TableHead>EMI</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee: any) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>₹{employee.salary?.toLocaleString()}</TableCell>
                          <TableCell>₹{employee.advances?.toLocaleString()}</TableCell>
                          <TableCell>₹{employee.esi?.toLocaleString()}</TableCell>
                          <TableCell>₹{employee.pf?.toLocaleString()}</TableCell>
                          <TableCell>₹{employee.emi?.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">₹{employee.salary - employee.advances - employee.esi - employee.pf - employee.emi}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <DollarSign className="h-4 w-4" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">24</div>
                    <p className="text-sm text-gray-600">Today</p>
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
                    <CardTitle className="text-lg">Active Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">18</div>
                    <p className="text-sm text-gray-600">Currently working</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">92%</div>
                    <p className="text-sm text-gray-600">This month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Summary by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Fiber Splicing</span>
                        <span className="font-medium">8 tasks</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ONT Installation</span>
                        <span className="font-medium">12 tasks</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Site Survey</span>
                        <span className="font-medium">4 tasks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Employee Status Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Checked In</span>
                        <span className="font-medium text-green-600">12 employees</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On Break</span>
                        <span className="font-medium text-yellow-600">3 employees</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Checked Out</span>
                        <span className="font-medium text-gray-600">3 employees</span>
                      </div>
                    </div>
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
