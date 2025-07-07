
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, UserCog, Users, Building } from 'lucide-react';

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

const SupervisorAllocationView = () => {
  const [allocations, setAllocations] = useState<SupervisorAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocations();
  }, []);

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
    } finally {
      setLoading(false);
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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Allocation
        </Button>
      </div>

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
                  <Button variant="outline" size="sm">
                    <UserCog className="w-4 h-4 mr-1" />
                    Edit Allocation
                  </Button>
                  <Button 
                    variant={allocation.is_active ? "destructive" : "default"} 
                    size="sm"
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
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First Allocation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupervisorAllocationView;
