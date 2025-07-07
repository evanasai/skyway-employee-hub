
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, UserCog, Users, Building, Save, X, Upload, User } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  employee_id: string;
  email: string;
  role: string;
  department: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
  department: {
    name: string;
  } | null;
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
    department: string;
  } | null;
  team: {
    name: string;
    category: string;
  } | null;
  department: {
    name: string;
  } | null;
}

const SupervisorAllocationManagement = () => {
  const [allocations, setAllocations] = useState<SupervisorAllocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<SupervisorAllocation | null>(null);
  
  const [formData, setFormData] = useState({
    supervisor_id: '',
    assignment_type: 'individual',
    employee_id: '',
    team_id: '',
    department_id: ''
  });

  useEffect(() => {
    fetchAllocations();
    fetchEmployees();
    fetchTeams();
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

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          department:departments(name)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
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
          employee:employees!supervisor_assignments_employee_id_fkey(name, employee_id, email, department),
          team:teams(name, category),
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

  const checkExistingSupervisor = async (employeeId: string, teamId: string = '') => {
    try {
      let query = supabase
        .from('supervisor_assignments')
        .select('*')
        .eq('is_active', true);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      } else if (teamId) {
        // Check if any team member already has a supervisor
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('employee_id')
          .eq('team_id', teamId);

        if (teamMembers && teamMembers.length > 0) {
          const employeeIds = teamMembers.map(member => member.employee_id);
          const { data: existingAssignments } = await supabase
            .from('supervisor_assignments')
            .select('*')
            .in('employee_id', employeeIds)
            .eq('is_active', true);

          return existingAssignments && existingAssignments.length > 0;
        }
      }

      const { data } = await query;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking existing supervisor:', error);
      return false;
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

    if (formData.assignment_type === 'team' && !formData.team_id) {
      toast({
        title: "Missing Information",
        description: "Please select a team for team assignment",
        variant: "destructive"
      });
      return;
    }

    if (!formData.department_id) {
      toast({
        title: "Missing Information",
        description: "Please select a department",
        variant: "destructive"
      });
      return;
    }

    // Check for existing supervisor assignment
    if (!editingAllocation) {
      const hasExistingSupervisor = await checkExistingSupervisor(
        formData.assignment_type === 'individual' ? formData.employee_id : '',
        formData.assignment_type === 'team' ? formData.team_id : ''
      );

      if (hasExistingSupervisor) {
        toast({
          title: "Assignment Conflict",
          description: "This employee/team already has a supervisor assigned",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const allocationData = {
        supervisor_id: formData.supervisor_id,
        assignment_type: formData.assignment_type,
        employee_id: formData.assignment_type === 'individual' ? formData.employee_id : null,
        team_id: formData.assignment_type === 'team' ? formData.team_id : null,
        department_id: formData.department_id,
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
      team_id: '',
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
      team_id: allocation.team?.name || '',
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

  const handleBulkUpload = () => {
    toast({
      title: "Bulk Upload",
      description: "Bulk upload feature will be implemented in the next phase",
    });
  };

  const getAllocationTypeBadge = (type: string) => {
    switch (type) {
      case 'individual':
        return <Badge variant="default"><User className="w-3 h-3 mr-1" />Individual</Badge>;
      case 'team':
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Team</Badge>;
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
          <p className="text-gray-600">Manage supervisor-employee/team relationships by department</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Allocation
          </Button>
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAllocation ? 'Edit' : 'Create'} Supervisor Allocation</CardTitle>
            <CardDescription>
              Assign supervisors to individual employees or teams within departments
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
                    <SelectItem value="team">Team</SelectItem>
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
                      {employees
                        .filter(emp => !supervisors.some(sup => sup.id === emp.id))
                        .filter(emp => !formData.department_id || emp.department === departments.find(d => d.id === formData.department_id)?.name)
                        .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.employee_id}) - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.assignment_type === 'team' && (
                <div>
                  <Label htmlFor="team">Team</Label>
                  <Select 
                    value={formData.team_id} 
                    onValueChange={(value) => setFormData({...formData, team_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .filter(team => !formData.department_id || team.department?.name === departments.find(d => d.id === formData.department_id)?.name)
                        .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} - {team.category}
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
                    Department: {allocation.department?.name} |
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Supervisor</p>
                    <p className="text-sm text-gray-600">
                      {allocation.supervisor?.name} ({allocation.supervisor?.employee_id})
                    </p>
                    <p className="text-xs text-gray-500">{allocation.supervisor?.email}</p>
                  </div>
                  
                  {allocation.assignment_type === 'individual' && allocation.employee && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Employee</p>
                      <p className="text-sm text-gray-600">
                        {allocation.employee.name} ({allocation.employee.employee_id})
                      </p>
                      <p className="text-xs text-gray-500">{allocation.employee.department}</p>
                    </div>
                  )}
                  
                  {allocation.assignment_type === 'team' && allocation.team && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Team</p>
                      <p className="text-sm text-gray-600">{allocation.team.name}</p>
                      <p className="text-xs text-gray-500">{allocation.team.category}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700">Department</p>
                    <p className="text-sm text-gray-600">{allocation.department?.name}</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => startEditing(allocation)}>
                    <UserCog className="w-4 h-4 mr-1" />
                    Edit
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
