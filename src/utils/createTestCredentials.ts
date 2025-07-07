
import { supabase } from '@/integrations/supabase/client';

export const createTestCredentials = async () => {
  const testUsers = [
    {
      employee_id: 'EMP001',
      name: 'John Doe',
      email: 'employee@test.com',
      phone: '9876543210',
      role: 'employee',
      department: 'field_worker',
      password: 2072,
      salary: 25000
    },
    {
      employee_id: 'SUP001',
      name: 'Jane Smith',
      email: 'supervisor@test.com',
      phone: '9876543211',
      role: 'supervisor',
      department: 'supervisor',
      password: 2072,
      salary: 40000,
      role_level: 2
    },
    {
      employee_id: 'ADM001',
      name: 'Admin User',
      email: 'admin@test.com',
      phone: '9876543212',
      role: 'admin',
      department: 'management',
      password: 2072,
      salary: 60000,
      role_level: 4
    },
    {
      employee_id: 'SUP002',
      name: 'Super Admin',
      email: 'superadmin@test.com',
      phone: '9876543213',
      role: 'super_admin',
      department: 'management',
      password: 2072,
      salary: 80000,
      role_level: 5
    }
  ];

  try {
    // First, delete existing test users
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .in('employee_id', ['EMP001', 'SUP001', 'ADM001', 'SUP002']);

    if (deleteError) {
      console.log('No existing test users to delete or error:', deleteError);
    }

    // Create new test users
    const { data, error } = await supabase
      .from('employees')
      .insert(testUsers)
      .select();

    if (error) {
      throw error;
    }

    console.log('Test credentials created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating test credentials:', error);
    throw error;
  }
};
