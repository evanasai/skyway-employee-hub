
import React from 'react';
import { Calendar } from 'lucide-react';

const DepartmentTasksEmptyState = () => {
  return (
    <div className="text-center py-8">
      <div className="text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No tasks assigned to your department yet</p>
        <p className="text-sm">Check back later for new assignments</p>
      </div>
    </div>
  );
};

export default DepartmentTasksEmptyState;
