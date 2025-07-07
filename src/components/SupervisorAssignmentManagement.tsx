
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, UserCog, Users, Building, Save, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  employee_id: string;
  email: string;
  role: string;
  department: string;
}

interface Department {
  id: string;
  name: string;
}

interface SupervisorAllocation {
  id: string;
  assignment_type: string;
  assigned_at: string;
  is_active: boolean;
  supervisor: {
    name: string;
    employee_id: string;
    email: string;
  } | null;
  employee: {
    name: string;
    employee_id: string;
    email: string;
  } | null;
  department: {
    name: string;
  } | null;
}

const SupervisorAllocationManagement = () => {
  const [allocations, setAllocations] = useState<SupervisorAllocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<SupervisorAllocation | null>(null);
  
  const [formData, setFormData] = useState({
    supervisor_id: '',
    assignment_type: 'individual',
    employee_id: '',
    department_id: ''
  });

  useEffect(() => {
    fetchAllocations();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      setEmployees(data || []);
      // Filter supervisors (assuming they have supervisor role or higher role_level)
      setSupervisors((data || []).filter(emp => 
        emp.role.toLowerCase().includes('supervisor') || 
        emp.role.toLowerCase().includes('admin') ||
        emp.role_level >= 2
      ));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive"
      });
    }
  };

  const fetchAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisor_assignments')
        .select(`
          *,
          supervisor:employees!supervisor_assignments_supervisor_id_fkey(name, employee_id, email),
          employee:employees!supervisor_assignments_employee_id_fkey(name, employee_id, email),
          department:departments(name)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setAllocations(data || []);
    } catch (error) {
      console.error('Error fetching supervisor allocations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch supervisor allocations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.supervisor_id) {
      toast({
        title: "Missing Information",
        description: "Please select a supervisor",
        variant: "destructive"
      });
      return;
    }

    if (formData.assignment_type === 'individual' && !formData.employee_id) {
      toast({
        title: "Missing Information",
        description: "Please select an employee for individual assignment",
        variant: "destructive"
      });
      return;
    }

    if (formData.assignment_type === 'department' && !formData.department_id) {
      toast({
        title: "Missing Information",
        description: "Please select a department for department assignment",
        variant: "destructive"
      });
      return;
    }

    try {
      const allocationData = {
        supervisor_id: formData.supervisor_id,
        assignment_type: formData.assignment_type,
        employee_id: formData.assignment_type === 'individual' ? formData.employee_id : null,
        department_id: formData.assignment_type === 'department' ? formData.department_id : null,
        is_active: true
      };

      if (editingAllocation) {
        const { error } = await supabase
          .from('supervisor_assignments')
          .update(allocationData)
          .eq('id', editingAllocation.id);

        if (error) throw error;
        
        toast({
          title: "Allocation Updated",
          description: "Supervisor allocation has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('supervisor_assignments')
          .insert(allocationData);

        if (error) throw error;
        
        toast({
          title: "Allocation Created",
          description: "New supervisor allocation has been created successfully",
        });
      }

      resetForm();
      fetchAllocations();
    } catch (error) {
      console.error('Error saving supervisor allocation:', error);
      toast({
        title: "Error",
        description: "Failed to save supervisor allocation",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      supervisor_id: '',
      assignment_type: 'individual',
      employee_id: '',
      department_id: ''
    });
    setShowForm(false);
    setEditingAllocation(null);
  };

  const startEditing = (allocation: SupervisorAllocation) => {
    setEditingAllocation(allocation);
    setFormData({
      supervisor_id: allocation.supervisor?.employee_id || '',
      assignment_type: allocation.assignment_type,
      employee_id: allocation.employee?.employee_id || '',
      department_id: allocation.department?.name || ''
    });
    setShowForm(true);
  };

  const toggleAllocationStatus = async (allocation: SupervisorAllocation) => {
    try {
      const { error } = await supabase
        .from('supervisor_assignments')
        .update({ is_active: !allocation.is_active })
        .eq('id', allocation.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Allocation has been ${!allocation.is_active ? 'activated' : 'deactivated'}`,
      });

      fetchAllocations();
    } catch (error) {
      console.error('Error updating allocation status:', error);
      toast({
        title: "Error",
        description: "Failed to update allocation status",
        variant: "destructive"
      });
    }
  };

  const getAllocationTypeBadge = (type: string) => {
    switch (type) {
      case 'individual':
        return <Badge variant="default"><Users className="w-3 h-3 mr-1" />Individual</Badge>;
      case 'department':
        return <Badge variant="secondary"><Building className="w-3 h-3 mr-1" />Department</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading supervisor allocations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Supervisor Allocation</h2>
          <p className="text-gray-600">Manage supervisor-employee relationships</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Allocation
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAllocation ? 'Edit' : 'Create'} Supervisor Allocation</CardTitle>
            <CardDescription>
              Assign supervisors to employees or departments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select 
                  value={formData.supervisor_id} 
                  onValueChange={(value) => setFormData({...formData, supervisor_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name} ({supervisor.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignment_type">Assignment Type</Label>
                <Select 
                  value={formData.assignment_type} 
                  onValueChange={(value) => setFormData({...formData, assignment_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Employee</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.assignment_type === 'individual' && (
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select 
                    value={formData.employee_id} 
                    onValueChange={(value) => setFormData({...formData, employee_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(emp => !supervisors.some(sup => sup.id === emp.id)).map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.assignment_type === 'department' && (
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.department_id} 
                    onValueChange={(value) => setFormData({...formData, department_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                {editingAllocation ? 'Update' : 'Create'} Allocation
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {allocations.map((allocation) => (
          <Card key={allocation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {allocation.supervisor?.name || 'Unknown Supervisor'}
                  </CardTitle>
                  <CardDescription>
                    Supervisor ID: {allocation.supervisor?.employee_id} | 
                    Allocated: {new Date(allocation.assigned_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {getAllocationTypeBadge(allocation.assignment_type)}
                  {getStatusBadge(allocation.is_active)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Supervisor</p>
                    <p className="text-sm text-gray-600">
                      {allocation.supervisor?.name} ({allocation.supervisor?.employee_id})
                    </p>
                    <p className="text-xs text-gray-500">{allocation.supervisor?.email}</p>
                  </div>
                  
                  {allocation.assignment_type === 'individual' && allocation.employee && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Allocated Employee</p>
                      <p className="text-sm text-gray-600">
                        {allocation.employee.name} ({allocation.employee.employee_id})
                      </p>
                      <p className="text-xs text-gray-500">{allocation.employee.email}</p>
                    </div>
                  )}
                  
                  {allocation.assignment_type === 'department' && allocation.department && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Allocated Department</p>
                      <p className="text-sm text-gray-600">{allocation.department.name}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => startEditing(allocation)}>
                    <UserCog className="w-4 h-4 mr-1" />
                    Edit Allocation
                  </Button>
                  <Button 
                    variant={allocation.is_active ? "destructive" : "default"} 
                    size="sm"
                    onClick={() => toggleAllocationStatus(allocation)}
                  >
                    {allocation.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allocations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No supervisor allocations found</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Allocation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupervisorAllocationManagement;
