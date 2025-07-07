
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployeeDepartmentTasks } from '@/hooks/useEmployeeDepartmentTasks';
import DepartmentTaskCard from './DepartmentTaskCard';
import DepartmentTasksEmptyState from './DepartmentTasksEmptyState';

interface EmployeeDepartmentTasksProps {
  employeeId: string;
  employeeDepartment: string;
}

const EmployeeDepartmentTasks = ({ employeeId, employeeDepartment }: EmployeeDepartmentTasksProps) => {
  const { departmentTasks, isLoading } = useEmployeeDepartmentTasks(employeeId, employeeDepartment);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading your department tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Department Tasks</CardTitle>
          <CardDescription>
            Tasks assigned to your department: {employeeDepartment}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departmentTasks.length === 0 ? (
            <DepartmentTasksEmptyState />
          ) : (
            <div className="space-y-4">
              {departmentTasks.map((task) => (
                <DepartmentTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDepartmentTasks;
