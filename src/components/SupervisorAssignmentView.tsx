
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, UserCog, Users, Building } from 'lucide-react';

interface SupervisorAssignment {
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

const SupervisorAssignmentView = () => {
  const [assignments, setAssignments] = useState<SupervisorAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
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
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching supervisor assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentTypeBadge = (type: string) => {
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
    return <div className="flex justify-center items-center h-64">Loading supervisor assignments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Supervisor Assignment</h2>
          <p className="text-gray-600">Manage supervisor-employee relationships</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {assignment.supervisor?.name || 'Unknown Supervisor'}
                  </CardTitle>
                  <CardDescription>
                    Supervisor ID: {assignment.supervisor?.employee_id} | 
                    Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {getAssignmentTypeBadge(assignment.assignment_type)}
                  {getStatusBadge(assignment.is_active)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Supervisor</p>
                    <p className="text-sm text-gray-600">
                      {assignment.supervisor?.name} ({assignment.supervisor?.employee_id})
                    </p>
                    <p className="text-xs text-gray-500">{assignment.supervisor?.email}</p>
                  </div>
                  
                  {assignment.assignment_type === 'individual' && assignment.employee && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Assigned Employee</p>
                      <p className="text-sm text-gray-600">
                        {assignment.employee.name} ({assignment.employee.employee_id})
                      </p>
                      <p className="text-xs text-gray-500">{assignment.employee.email}</p>
                    </div>
                  )}
                  
                  {assignment.assignment_type === 'department' && assignment.department && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Assigned Department</p>
                      <p className="text-sm text-gray-600">{assignment.department.name}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    <UserCog className="w-4 h-4 mr-1" />
                    Edit Assignment
                  </Button>
                  <Button 
                    variant={assignment.is_active ? "destructive" : "default"} 
                    size="sm"
                  >
                    {assignment.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No supervisor assignments found</p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First Assignment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupervisorAssignmentView;
