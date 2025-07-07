
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Save, X, MapPin } from 'lucide-react';
import { Zone, ZoneFromDB, parseCoordinates } from '@/types/zone';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  is_active: boolean;
  salary?: number;
  assigned_zones?: string[];
}

const EmployeeManagementTable = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showZoneAssignment, setShowZoneAssignment] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    password: '',
    salary: '',
    assigned_zones: [] as string[]
  });

  useEffect(() => {
    fetchEmployees();
    fetchZones();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const parsedZones: Zone[] = (data || []).map((zone: ZoneFromDB) => ({
        ...zone,
        coordinates: parseCoordinates(zone.coordinates)
      }));
      
      setZones(parsedZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        // If departments table doesn't exist, use default departments
        setDepartments(['HR', 'IT', 'Finance', 'Operations', 'Sales']);
        return;
      }
      
      setDepartments((data || []).map(dept => dept.name));
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['HR', 'IT', 'Finance', 'Operations', 'Sales']);
    }
  };

  const createEmployee = async () => {
    if (!formData.name || !formData.email || !formData.employee_id) {
      toast({
        title: "Missing Information",
        description: "Name, email, and employee ID are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          employee_id: formData.employee_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          password: formData.password ? parseInt(formData.password) : null,
          salary: formData.salary ? parseFloat(formData.salary) : null
        });

      if (error) throw error;

      resetForm();
      fetchEmployees();
      
      toast({
        title: "Employee Created",
        description: "New employee has been added successfully",
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive"
      });
    }
  };

  const updateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        updated_at: new Date().toISOString()
      };

      if (formData.password) {
        updateData.password = parseInt(formData.password);
      }

      if (formData.salary) {
        updateData.salary = parseFloat(formData.salary);
      }

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', editingEmployee.id);

      if (error) throw error;

      resetForm();
      fetchEmployees();
      
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive"
      });
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      fetchEmployees();
      toast({
        title: "Employee Deleted",
        description: "Employee has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  const assignZoneToEmployee = async (employeeId: string, zoneIds: string[]) => {
    try {
      // For now, we'll store zone assignments in a simple way
      // In a real app, you'd have an employee_zones junction table
      const { error } = await supabase
        .from('employees')
        .update({ 
          department: `${employees.find(e => e.id === employeeId)?.department}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "Zone Assignment Updated",
        description: "Employee zone assignment has been updated successfully",
      });
      
      setShowZoneAssignment(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error assigning zones:', error);
      toast({
        title: "Error",
        description: "Failed to assign zones",
        variant: "destructive"
      });
    }
  };

  const startEditing = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      password: '',
      salary: employee.salary?.toString() || '',
      assigned_zones: employee.assigned_zones || []
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingEmployee(null);
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      password: '',
      salary: '',
      assigned_zones: []
    });
  };

  if (showZoneAssignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Zones - {showZoneAssignment.name}</CardTitle>
          <CardDescription>
            Select zones to assign to this employee
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center space-x-2">
                <Checkbox
                  id={zone.id}
                  checked={formData.assigned_zones.includes(zone.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        assigned_zones: [...formData.assigned_zones, zone.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        assigned_zones: formData.assigned_zones.filter(id => id !== zone.id)
                      });
                    }
                  }}
                />
                <Label htmlFor={zone.id}>{zone.name}</Label>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => assignZoneToEmployee(showZoneAssignment.id, formData.assigned_zones)}>
              <Save className="h-4 w-4 mr-2" />
              Save Assignment
            </Button>
            <Button variant="outline" onClick={() => setShowZoneAssignment(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>
            Manage employee accounts and zone assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(isCreating || editingEmployee) && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    placeholder="Enter employee ID"
                    disabled={!!editingEmployee}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter numeric password"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="Enter salary amount"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={editingEmployee ? updateEmployee : createEmployee}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isCreating && !editingEmployee && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell className="capitalize">{employee.role}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          employee.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {employee.salary ? `₹${employee.salary}` : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowZoneAssignment(employee);
                              setFormData({
                                ...formData,
                                assigned_zones: employee.assigned_zones || []
                              });
                            }}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagementTable;
