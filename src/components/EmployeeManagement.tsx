
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus } from 'lucide-react';
import ComprehensiveEmployeeForm from './ComprehensiveEmployeeForm';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  is_active: boolean;
  salary?: number;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };

  const createEmployee = async (formData: any) => {
    if (!formData.name || !formData.email || !formData.employee_id) {
      toast({
        title: "Missing Information",
        description: "Name, email, and employee ID are required",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          employee_id: formData.employee_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          password: formData.password ? parseInt(formData.password) : null,
          salary: formData.salary ? parseFloat(formData.salary) : null
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Create employee profile with additional details
      const { error: profileError } = await supabase
        .from('employee_profiles')
        .insert({
          employee_id: employeeData.id,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          father_name: formData.father_name || null,
          mother_name: formData.mother_name || null,
          address: formData.address || null,
          pin_code: formData.pin_code || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          emergency_contact_relation: formData.emergency_contact_relation || null,
          aadhar_number: formData.aadhar_number || null,
          aadhar_photo_front: formData.aadhar_photo_front || null,
          aadhar_photo_back: formData.aadhar_photo_back || null,
          pan_number: formData.pan_number || null,
          pan_photo: formData.pan_photo || null,
          bank_name: formData.bank_name || null,
          account_number: formData.account_number || null,
          ifsc_code: formData.ifsc_code || null,
          bank_document_photo: formData.bank_document_photo || null,
          profile_photo: formData.profile_photo || null
        });

      if (profileError) throw profileError;

      resetForm();
      fetchEmployees();
      
      toast({
        title: "Employee Created",
        description: "New employee has been added successfully with all details",
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive"
      });
    }
  };

  const updateEmployee = async (formData: any) => {
    if (!editingEmployee) return;

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        updated_at: new Date().toISOString()
      };

      if (formData.password) {
        updateData.password = parseInt(formData.password);
      }

      if (formData.salary) {
        updateData.salary = parseFloat(formData.salary);
      }

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', editingEmployee.id);

      if (error) throw error;

      // Update employee profile
      const { error: profileError } = await supabase
        .from('employee_profiles')
        .upsert({
          employee_id: editingEmployee.id,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          father_name: formData.father_name || null,
          mother_name: formData.mother_name || null,
          address: formData.address || null,
          pin_code: formData.pin_code || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          emergency_contact_relation: formData.emergency_contact_relation || null,
          aadhar_number: formData.aadhar_number || null,
          aadhar_photo_front: formData.aadhar_photo_front || null,
          aadhar_photo_back: formData.aadhar_photo_back || null,
          pan_number: formData.pan_number || null,
          pan_photo: formData.pan_photo || null,
          bank_name: formData.bank_name || null,
          account_number: formData.account_number || null,
          ifsc_code: formData.ifsc_code || null,
          bank_document_photo: formData.bank_document_photo || null,
          profile_photo: formData.profile_photo || null,
          updated_at: new Date().toISOString()
        });

      if (profileError) console.error('Profile update error:', profileError);

      resetForm();
      fetchEmployees();
      
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive"
      });
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      fetchEmployees();
      toast({
        title: "Employee Deleted",
        description: "Employee has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  const startEditing = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>
            Manage employee accounts and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCreating && (
            <ComprehensiveEmployeeForm
              isCreating={isCreating}
              editingEmployee={editingEmployee}
              onSave={editingEmployee ? updateEmployee : createEmployee}
              onCancel={resetForm}
            />
          )}

          {!isCreating && !editingEmployee && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Employees ({employees.length})</h3>
            {employees.length === 0 ? (
              <p className="text-gray-500">No employees found</p>
            ) : (
              employees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-gray-600">
                          ID: {employee.employee_id} • {employee.role} • {employee.department}
                        </p>
                        <p className="text-sm text-gray-600">
                          {employee.email} • {employee.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {employee.is_active ? 'Active' : 'Inactive'}
                          {employee.salary && ` • Salary: ₹${employee.salary}`}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
