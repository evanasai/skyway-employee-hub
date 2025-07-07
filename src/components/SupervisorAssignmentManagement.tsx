
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, Users, Building, Trash2, Plus } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  role: string;
  department: string;
  assigned_supervisor?: string;
}

interface Department {
  id: string;
  name: string;
}

interface SupervisorAssignment {
  id: string;
  supervisor_id: string;
  employee_id?: string;
  department_id?: string;
  assignment_type: string;
  assigned_at: string;
  supervisor_name?: string;
  employee_name?: string;
  department_name?: string;
}

const SupervisorAssignmentManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [supervisors, setSupervisors] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignments, setAssignments] = useState<SupervisorAssignment[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<string>('individual');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchAssignments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, name, role, department, assigned_supervisor')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const allEmployees = data || [];
      setEmployees(allEmployees);
      
      // Filter supervisors (supervisors, sub_admins, admins)
      const supervisorsList = allEmployees.filter(emp => 
        ['supervisor', 'sub_admin', 'admin', 'super_admin'].includes(emp.role)
      );
      setSupervisors(supervisorsList);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisor_assignments')
        .select(`
          *,
          supervisor:employees!supervisor_id(name, employee_id),
          employee:employees!employee_id(name, employee_id),
          department:departments(name)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      const formattedAssignments = (data || []).map(assignment => ({
        ...assignment,
        supervisor_name: assignment.supervisor?.name,
        employee_name: assignment.employee?.name,
        department_name: assignment.department?.name
      }));
      
      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const createAssignment = async () => {
    if (!selectedSupervisor) {
      toast({
        title: "Missing Information",
        description: "Please select a supervisor",
        variant: "destructive"
      });
      return;
    }

    if (assignmentType === 'individual' && !selectedEmployee) {
      toast({
        title: "Missing Information",
        description: "Please select an employee for individual assignment",
        variant: "destructive"
      });
      return;
    }

    if (assignmentType === 'department' && !selectedDepartment) {
      toast({
        title: "Missing Information",
        description: "Please select a department for department assignment",
        variant: "destructive"
      });
      return;
    }

    try {
      const assignmentData = {
        supervisor_id: selectedSupervisor,
        assignment_type: assignmentType,
        employee_id: assignmentType === 'individual' ? selectedEmployee : null,
        department_id: assignmentType === 'department' ? selectedDepartment : null
      };

      const { error } = await supabase
        .from('supervisor_assignments')
        .insert(assignmentData);

      if (error) throw error;

      // If individual assignment, update employee's assigned_supervisor
      if (assignmentType === 'individual' && selectedEmployee) {
        await supabase
          .from('employees')
          .update({ assigned_supervisor: selectedSupervisor })
          .eq('id', selectedEmployee);
      }

      // Reset form
      setSelectedSupervisor('');
      setSelectedEmployee('');
      setSelectedDepartment('');
      setAssignmentType('individual');

      fetchAssignments();
      fetchEmployees();
      
      toast({
        title: "Assignment Created",
        description: "Supervisor assignment has been created successfully",
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      });
    }
  };

  const removeAssignment = async (assignmentId: string, employeeId?: string) => {
    try {
      const { error } = await supabase
        .from('supervisor_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      // If it was an individual assignment, remove from employee record
      if (employeeId) {
        await supabase
          .from('employees')
          .update({ assigned_supervisor: null })
          .eq('id', employeeId);
      }

      fetchAssignments();
      fetchEmployees();
      
      toast({
        title: "Assignment Removed",
        description: "Supervisor assignment has been removed successfully",
      });
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove assignment",
        variant: "destructive"
      });
    }
  };

  const getAssignmentBadge = (type: string) => {
    return type === 'individual' ? (
      <Badge variant="outline">
        <UserCheck className="h-3 w-3 mr-1" />
        Individual
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">
        <Building className="h-3 w-3 mr-1" />
        Department
      </Badge>
    );
  };

  const getUnassignedEmployees = () => {
    return employees.filter(emp => 
      emp.role === 'employee' && !emp.assigned_supervisor
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supervisor Assignment Management</CardTitle>
          <CardDescription>
            Assign supervisors to individual employees or entire departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assign">
            <TabsList>
              <TabsTrigger value="assign">Create Assignment</TabsTrigger>
              <TabsTrigger value="current">Current Assignments</TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned Employees</TabsTrigger>
            </TabsList>

            <TabsContent value="assign" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">New Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Supervisor</label>
                      <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisors.map((supervisor) => (
                            <SelectItem key={supervisor.id} value={supervisor.id}>
                              {supervisor.name} ({supervisor.employee_id}) - {supervisor.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Assignment Type</label>
                      <Select value={assignmentType} onValueChange={setAssignmentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual Employee</SelectItem>
                          <SelectItem value="department">Entire Department</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {assignmentType === 'individual' && (
                      <div>
                        <label className="text-sm font-medium">Employee</label>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.filter(emp => emp.role === 'employee').map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} ({employee.employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {assignmentType === 'department' && (
                      <div>
                        <label className="text-sm font-medium">Department</label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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

                  <Button onClick={createAssignment} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Assignment Type</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="font-medium">{assignment.supervisor_name}</div>
                        </TableCell>
                        <TableCell>{getAssignmentBadge(assignment.assignment_type)}</TableCell>
                        <TableCell>
                          {assignment.assignment_type === 'individual' ? (
                            <div>
                              <div className="font-medium">{assignment.employee_name}</div>
                              <div className="text-sm text-gray-500">Employee</div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">{assignment.department_name}</div>
                              <div className="text-sm text-gray-500">Department</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.assigned_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAssignment(assignment.id, assignment.employee_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="unassigned" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unassigned Employees</CardTitle>
                  <CardDescription>
                    Employees who don't have a supervisor assigned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getUnassignedEmployees().length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">All employees have been assigned to supervisors</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getUnassignedEmployees().map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">
                              {employee.employee_id} • {employee.department}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Unassigned
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorAssignmentManagement;
