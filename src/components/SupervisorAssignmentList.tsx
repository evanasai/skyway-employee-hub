
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SupervisorAssignmentCard } from './SupervisorAssignmentCard';

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

interface SupervisorAssignmentListProps {
  allocations: SupervisorAllocation[];
  onEdit: (allocation: SupervisorAllocation) => void;
  onToggleStatus: (allocation: SupervisorAllocation) => void;
  onCreateNew: () => void;
}

export const SupervisorAssignmentList = ({
  allocations,
  onEdit,
  onToggleStatus,
  onCreateNew
}: SupervisorAssignmentListProps) => {
  if (allocations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No supervisor allocations found</p>
          <Button className="mt-4" onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Allocation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {allocations.map((allocation) => (
        <SupervisorAssignmentCard
          key={allocation.id}
          allocation={allocation}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};
