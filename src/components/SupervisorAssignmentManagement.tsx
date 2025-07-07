
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload } from 'lucide-react';
import { useSupervisorAssignments } from '@/hooks/useSupervisorAssignments';
import { SupervisorAssignmentForm } from './SupervisorAssignmentForm';
import { SupervisorAssignmentList } from './SupervisorAssignmentList';

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

const SupervisorAllocationManagement = () => {
  const {
    allocations,
    employees,
    teams,
    departments,
    supervisors,
    loading,
    fetchAllocations
  } = useSupervisorAssignments();

  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<SupervisorAllocation | null>(null);

  const handleFormSubmitSuccess = () => {
    setShowForm(false);
    setEditingAllocation(null);
    fetchAllocations();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAllocation(null);
  };

  const startEditing = (allocation: SupervisorAllocation) => {
    setEditingAllocation(allocation);
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
        <SupervisorAssignmentForm
          employees={employees}
          teams={teams}
          departments={departments}
          supervisors={supervisors}
          editingAllocation={editingAllocation}
          onSubmitSuccess={handleFormSubmitSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <SupervisorAssignmentList
        allocations={allocations}
        onEdit={startEditing}
        onToggleStatus={toggleAllocationStatus}
        onCreateNew={() => setShowForm(true)}
      />
    </div>
  );
};

export default SupervisorAllocationManagement;
