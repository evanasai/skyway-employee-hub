
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

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
  team_id: string | null;
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

interface SupervisorAssignmentFormProps {
  employees: Employee[];
  teams: Team[];
  departments: Department[];
  supervisors: Employee[];
  editingAllocation: SupervisorAllocation | null;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export const SupervisorAssignmentForm = ({
  employees,
  teams,
  departments,
  supervisors,
  editingAllocation,
  onSubmitSuccess,
  onCancel
}: SupervisorAssignmentFormProps) => {
  const [formData, setFormData] = useState({
    supervisor_id: editingAllocation?.supervisor?.employee_id || '',
    assignment_type: editingAllocation?.assignment_type || 'individual',
    employee_id: editingAllocation?.employee?.employee_id || '',
    team_id: editingAllocation?.team_id || '',
    department_id: editingAllocation?.department?.name || ''
  });

  const checkExistingSupervisor = async (employeeId: string, teamId: string = '') => {
    try {
      let query = supabase
        .from('supervisor_assignments')
        .select('*')
        .eq('is_active', true);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      } else if (teamId) {
        query = query.eq('team_id', teamId);
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

      onSubmitSuccess();
    } catch (error) {
      console.error('Error saving supervisor allocation:', error);
      toast({
        title: "Error",
        description: "Failed to save supervisor allocation",
        variant: "destructive"
      });
    }
  };

  return (
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
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
