
import { supabase } from '@/integrations/supabase/client';

export const createActualCredentials = async () => {
  try {
    // Create actual employee credentials
    const employees = [
      {
        employee_id: 'EMP001',
        name: 'John Smith',
        email: 'john.smith@skywaynetworks.in',
        phone: '+91 9876543210',
        role: 'employee',
        department: 'field_worker',
        password: 1234,
        salary: 25000,
        role_level: 1
      },
      {
        employee_id: 'SUP001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@skywaynetworks.in',
        phone: '+91 9876543211',
        role: 'supervisor',
        department: 'operations',
        password: 5678,
        salary: 45000,
        role_level: 2
      },
      {
        employee_id: 'ADM001',
        name: 'Michael Davis',
        email: 'michael.davis@skywaynetworks.in',
        phone: '+91 9876543212',
        role: 'admin',
        department: 'management',
        password: 9012,
        salary: 75000,
        role_level: 4
      },
      {
        employee_id: 'SUP002',
        name: 'Emma Wilson',
        email: 'emma.wilson@skywaynetworks.in',
        phone: '+91 9876543213',
        role: 'super_admin',
        department: 'management',
        password: 3456,
        salary: 100000,
        role_level: 5
      }
    ];

    for (const employee of employees) {
      const { error } = await supabase
        .from('employees')
        .upsert(employee, { onConflict: 'employee_id' });
      
      if (error) {
        console.error('Error creating employee:', error);
      } else {
        console.log('Created employee:', employee.employee_id);
      }
    }

    console.log('All credentials created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating credentials:', error);
    return false;
  }
};
