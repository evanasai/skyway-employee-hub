import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Save, X, MapPin, Users } from 'lucide-react';
import { Zone, ZoneFromDB, parseCoordinates } from '@/types/zone';
import EmployeeZoneAssignment from './EmployeeZoneAssignment';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employee_type: string;
  assigned_zones: string[];
  is_active: boolean;
  salary?: number;
}

const EnhancedEmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showZoneAssignment, setShowZoneAssignment] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    employee_type: 'field_worker',
    assigned_zones: [] as string[],
    password: '',
    salary: ''
  });

  const employeeTypes = [
    { value: 'field_worker', label: 'Field Worker' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'manager', label: 'Manager' },
    { value: 'technician', label: 'Technician' },
    { value: 'security', label: 'Security' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  useEffect(() => {
    fetchEmployees();
    fetchZones();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include employee_type and assigned_zones
      const transformedData = (data || []).map(emp => ({
        ...emp,
        employee_type: emp.department || 'field_worker',
        assigned_zones: []
      }));
      
      setEmployees(transformedData);
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
      
      // Transform ZoneFromDB[] to Zone[] by parsing coordinates
      const transformedZones: Zone[] = (data || []).map((zone: ZoneFromDB) => ({
        ...zone,
        coordinates: parseCoordinates(zone.coordinates)
      }));
      
      setZones(transformedZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
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
          department: formData.employee_type,
          password: formData.password ? parseInt(formData.password) : null,
          salary: formData.salary ? parseFloat(formData.salary) : null
        });

      if (error) throw error;
      
      resetForm();
      fetchEmployees();
      
      toast({
        title: "Employee Created",
        description: `New ${formData.employee_type} has been added successfully`,
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
        department: formData.employee_type,
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

  const startEditing = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      employee_type: employee.employee_type || employee.department,
      assigned_zones: employee.assigned_zones || [],
      password: '',
      salary: employee.salary?.toString() || ''
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
      employee_type: 'field_worker',
      assigned_zones: [],
      password: '',
      salary: ''
    });
  };

  if (showZoneAssignment) {
    return <EmployeeZoneAssignment onBack={() => setShowZoneAssignment(false)} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>
            Manage employee accounts, assign zones, and set employee types
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
                  <Label htmlFor="employee_type">Employee Type</Label>
                  <Select value={formData.employee_type} onValueChange={(value) => setFormData({...formData, employee_type: value})}>
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
            <div className="flex space-x-2">
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Employee
              </Button>
              <Button variant="outline" onClick={() => setShowZoneAssignment(true)}>
                <MapPin className="h-4 w-4 mr-2" />
                Assign Zones
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Employees ({employees.length})</h3>
            {employees.length === 0 ? (
              <p className="text-gray-500">No employees found</p>
            ) : (
              employees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-gray-600">
                          ID: {employee.employee_id} • {employee.role} • {employeeTypes.find(t => t.value === employee.employee_type)?.label || employee.department}
                        </p>
                        <p className="text-sm text-gray-600">
                          {employee.email} • {employee.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {employee.is_active ? 'Active' : 'Inactive'}
                          {employee.salary && ` • Salary: ₹${employee.salary}`}
                        </p>
                        {employee.assigned_zones && employee.assigned_zones.length > 0 && (
                          <p className="text-sm text-blue-600">
                            Zones: {employee.assigned_zones.length} assigned
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedEmployeeManagement;
