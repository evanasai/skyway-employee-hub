
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Save, X, Upload, Eye } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  role_level: number;
  assigned_supervisor?: string;
  kyc_status: string;
  is_active: boolean;
  salary?: number;
  joining_date?: string;
}

interface Department {
  id: string;
  name: string;
  is_active: boolean;
}

interface DocumentUrls {
  aadhaar?: string;
  pan?: string;
  application_form?: string;
}

const EnhancedEmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingDocuments, setViewingDocuments] = useState<string | null>(null);
  const [employeeDocuments, setEmployeeDocuments] = useState<DocumentUrls>({});
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    password: '',
    salary: ''
  });

  const roles = [
    { value: 'employee', label: 'Employee', level: 1 },
    { value: 'supervisor', label: 'Supervisor', level: 2 },
    { value: 'sub_admin', label: 'Sub Admin', level: 3 },
    { value: 'admin', label: 'Admin', level: 4 },
    { value: 'super_admin', label: 'Super Admin', level: 5 }
  ];

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
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

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (file: File, documentType: string, employeeId: string) => {
    if (!file) return;

    setUploadingFiles(prev => ({ ...prev, [documentType]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}/${documentType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(fileName);

      // Update KYC details with document URL
      const { error: kycError } = await supabase
        .from('kyc_details')
        .upsert({
          employee_id: employeeId,
          document_urls: {
            ...employeeDocuments,
            [documentType]: publicUrl
          }
        }, {
          onConflict: 'employee_id'
        });

      if (kycError) throw kycError;

      setEmployeeDocuments(prev => ({
        ...prev,
        [documentType]: publicUrl
      }));

      toast({
        title: "Document Uploaded",
        description: `${documentType} document uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const fetchEmployeeDocuments = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('kyc_details')
        .select('document_urls')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error) throw error;
      
      const docs = data?.document_urls as DocumentUrls || {};
      setEmployeeDocuments(docs);
    } catch (error) {
      console.error('Error fetching employee documents:', error);
    }
  };

  const createEmployee = async () => {
    if (!formData.name || !formData.email || !formData.employee_id) {
      toast({
        title: "Missing Information",
        description: "Name, email, and employee ID are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedRole = roles.find(r => r.value === formData.role);
      
      const { error } = await supabase
        .from('employees')
        .insert({
          employee_id: formData.employee_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          role_level: selectedRole?.level || 1,
          password: formData.password ? parseInt(formData.password) : null,
          salary: formData.salary ? parseFloat(formData.salary) : null
        });

      if (error) throw error;
      
      resetForm();
      fetchEmployees();
      
      toast({
        title: "Employee Created",
        description: `New employee has been added successfully`,
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

  const updateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      const selectedRole = roles.find(r => r.value === formData.role);
      
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        role_level: selectedRole?.level || 1,
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

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const startEditing = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      password: '',
      salary: employee.salary?.toString() || ''
    });
    setIsCreating(false);
    fetchEmployeeDocuments(employee.id);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingEmployee(null);
    setViewingDocuments(null);
    setEmployeeDocuments({});
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      password: '',
      salary: ''
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>
            Manage employee accounts by department. Employees are assigned to departments and can be part of multiple teams within those departments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(isCreating || editingEmployee) && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    placeholder="Enter employee ID"
                    disabled={!!editingEmployee}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label} (Level {role.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 ? (
                        <SelectItem value="" disabled>
                          No departments available
                        </SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Login PIN</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter 4-digit PIN"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Monthly Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="Enter salary amount"
                  />
                </div>
              </div>

              {/* Document Upload Section */}
              {editingEmployee && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium">Document Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'aadhaar', label: 'Aadhaar Card' },
                      { key: 'pan', label: 'PAN Card' },
                      { key: 'application_form', label: 'Application Form' }
                    ].map((doc) => (
                      <div key={doc.key} className="space-y-2">
                        <Label>{doc.label}</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && editingEmployee) {
                                handleFileUpload(file, doc.key, editingEmployee.id);
                              }
                            }}
                            disabled={uploadingFiles[doc.key]}
                          />
                          {employeeDocuments[doc.key as keyof DocumentUrls] && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(employeeDocuments[doc.key as keyof DocumentUrls], '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {uploadingFiles[doc.key] && (
                          <p className="text-sm text-blue-600">Uploading...</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={editingEmployee ? updateEmployee : createEmployee}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isCreating && !editingEmployee && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Employees ({employees.length})</h3>
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
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-gray-600">
                            Status: {employee.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {employee.salary && (
                            <span className="text-sm text-gray-600">
                              • Salary: ₹{employee.salary}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">Verification:</span>
                          {getKYCStatusBadge(employee.kyc_status)}
                        </div>
                      </div>
                       <div className="flex space-x-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={async () => {
                             await fetchEmployeeDocuments(employee.id);
                             setViewingDocuments(employee.id);
                           }}
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
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

      {/* Document Viewing Dialog */}
      <Dialog open={!!viewingDocuments} onOpenChange={() => setViewingDocuments(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { key: 'aadhaar', label: 'Aadhaar Card' },
              { key: 'pan', label: 'PAN Card' },
              { key: 'application_form', label: 'Application Form' }
            ].map((doc) => (
              <div key={doc.key} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{doc.label}</span>
                {employeeDocuments[doc.key as keyof DocumentUrls] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(employeeDocuments[doc.key as keyof DocumentUrls], '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                ) : (
                  <span className="text-sm text-gray-500">Not uploaded</span>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedEmployeeManagement;
