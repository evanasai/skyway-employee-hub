
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCog, User, Users } from 'lucide-react';

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

interface SupervisorAssignmentCardProps {
  allocation: SupervisorAllocation;
  onEdit: (allocation: SupervisorAllocation) => void;
  onToggleStatus: (allocation: SupervisorAllocation) => void;
}

export const SupervisorAssignmentCard = ({
  allocation,
  onEdit,
  onToggleStatus
}: SupervisorAssignmentCardProps) => {
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

  return (
    <Card>
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
            <Button variant="outline" size="sm" onClick={() => onEdit(allocation)}>
              <UserCog className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant={allocation.is_active ? "destructive" : "default"} 
              size="sm"
              onClick={() => onToggleStatus(allocation)}
            >
              {allocation.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
