import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Download, Upload, FileText, Save, X, Users, UserCheck } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  kyc_status: string;
  is_active: boolean;
  salary?: number;
  joining_date?: string;
  date_of_birth?: string;
  age?: number;
  father_name?: string;
  mother_name?: string;
  gender?: string;
  aadhar_number?: string;
  pan_number?: string;
  driving_license?: string;
  bank_account?: string;
  ifsc_code?: string;
  bank_name?: string;
  permanent_address?: string;
  current_address?: string;
  supervisor_id?: string;
  team_id?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  department_id: string;
}

interface Supervisor {
  id: string;
  name: string;
  employee_id: string;
}

const ComprehensiveEmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    father_name: '',
    mother_name: '',
    gender: '',
    
    // Identity Documents
    aadhar_number: '',
    pan_number: '',
    driving_license: '',
    
    // Bank Details
    bank_account: '',
    ifsc_code: '',
    bank_name: '',
    
    // Address
    permanent_address: '',
    current_address: '',
    
    // Work Details
    role: 'employee',
    department: '',
    salary: '',
    supervisor_id: '',
    team_id: '',
    
    // Login
    password: ''
  });

  const departments_list = [
    { value: 'field_operations', label: 'Field Operations' },
    { value: 'technical_support', label: 'Technical Support' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'security', label: 'Security' },
    { value: 'management', label: 'Management' }
  ];

  // Get user role from auth context to determine available roles
  const { user } = useAuth();
  
  const getRolesForUser = () => {
    if (user?.role === 'super_admin') {
      return [
        { value: 'employee', label: 'Employee', level: 1 },
        { value: 'supervisor', label: 'Supervisor', level: 2 },
        { value: 'admin', label: 'Admin', level: 3 },
        { value: 'super_admin', label: 'Super Admin', level: 4 }
      ];
    } else if (user?.role === 'admin') {
      return [
        { value: 'employee', label: 'Employee', level: 1 }
      ];
    }
    return [];
  };

  const roles = getRolesForUser();

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchTeams();
    fetchSupervisors();
  }, []);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const generateEmployeeId = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id')
        .like('employee_id', 'SKY%')
        .order('employee_id', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastId = data[0].employee_id;
        const lastNumber = parseInt(lastId.replace('SKY', ''));
        const nextNumber = lastNumber + 1;
        return `SKY${nextNumber.toString().padStart(4, '0')}`;
      } else {
        return 'SKY0001';
      }
    } catch (error) {
      console.error('Error generating employee ID:', error);
      return 'SKY0001';
    }
  };

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
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, employee_id')
        .in('role', ['supervisor', 'admin', 'super_admin'])
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.date_of_birth) {
      toast({
        title: "Missing Information",
        description: "Name, email, phone, and date of birth are required",
        variant: "destructive"
      });
      return false;
    }

    // Age validation
    const age = calculateAge(formData.date_of_birth);
    if (age < 18) {
      toast({
        title: "Age Restriction",
        description: "Employee must be at least 18 years old",
        variant: "destructive"
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return false;
    }

    // Aadhar validation
    if (formData.aadhar_number && !/^[0-9]{12}$/.test(formData.aadhar_number)) {
      toast({
        title: "Invalid Aadhar",
        description: "Aadhar number must be 12 digits",
        variant: "destructive"
      });
      return false;
    }

    // PAN validation
    if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
      toast({
        title: "Invalid PAN",
        description: "PAN number format is invalid",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const createEmployee = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const employeeId = await generateEmployeeId();
      const age = calculateAge(formData.date_of_birth);
      const selectedRole = roles.find(r => r.value === formData.role);
      
      // Create employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          employee_id: employeeId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          role_level: selectedRole?.level || 1,
          password: formData.password ? parseInt(formData.password) : null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          joining_date: new Date().toISOString().split('T')[0],
          assigned_supervisor: formData.supervisor_id || null,
          kyc_status: 'pending'
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Create KYC details
      const { error: kycError } = await supabase
        .from('kyc_details')
        .insert({
          employee_id: employeeData.id,
          personal_details: {
            full_name: formData.name,
            father_name: formData.father_name,
            mother_name: formData.mother_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            aadhar_number: formData.aadhar_number,
            pan_number: formData.pan_number,
            driving_license: formData.driving_license,
            bank_account_number: formData.bank_account,
            ifsc_code: formData.ifsc_code,
            bank_name: formData.bank_name,
            permanent_address: formData.permanent_address,
            current_address: formData.current_address,
            age: age
          },
          verification_status: 'pending'
        });

      if (kycError) throw kycError;

      // Add to team if selected
      if (formData.team_id) {
        await supabase
          .from('team_members')
          .insert({
            team_id: formData.team_id,
            employee_id: employeeData.id
          });
      }

      resetForm();
      fetchEmployees();
      
      toast({
        title: "Employee Created",
        description: `Employee ${employeeId} has been created successfully`,
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = employees.map(emp => ({
      'Employee ID': emp.employee_id,
      'Name': emp.name,
      'Email': emp.email,
      'Phone': emp.phone,
      'Role': emp.role,
      'Department': emp.department,
      'Salary': emp.salary,
      'Joining Date': emp.joining_date,
      'KYC Status': emp.kyc_status,
      'Status': emp.is_active ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees_export.xlsx');
    
    toast({
      title: "Export Successful",
      description: "Employee data has been exported to Excel",
    });
  };

  const downloadTemplate = () => {
    const templateData = [{
      'Name': 'John Doe',
      'Email': 'john.doe@example.com',
      'Phone': '9876543210',
      'Date of Birth': '1990-01-01',
      'Father Name': 'Father Name',
      'Mother Name': 'Mother Name',
      'Gender': 'male',
      'Aadhar Number': '123456789012',
      'PAN Number': 'ABCDE1234F',
      'Driving License': 'DL1234567890',
      'Bank Account': '1234567890',
      'IFSC Code': 'ABCD0123456',
      'Bank Name': 'State Bank of India',
      'Permanent Address': 'Permanent Address',
      'Current Address': 'Current Address',
      'Role': 'employee',
      'Department': 'field_operations',
      'Salary': '25000',
      'Password': '1234'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');
    XLSX.writeFile(wb, 'employee_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Employee template has been downloaded",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData as any[]) {
        try {
          const age = calculateAge(row['Date of Birth']);
          if (age < 18) {
            errorCount++;
            continue;
          }

          const employeeId = await generateEmployeeId();
          const selectedRole = roles.find(r => r.value === row['Role']) || roles[0];
          
          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .insert({
              employee_id: employeeId,
              name: row['Name'],
              email: row['Email'],
              phone: row['Phone'],
              role: row['Role'] || 'employee',
              department: row['Department'] || 'field_operations',
              role_level: selectedRole.level,
              password: row['Password'] ? parseInt(row['Password']) : null,
              salary: row['Salary'] ? parseFloat(row['Salary']) : null,
              joining_date: new Date().toISOString().split('T')[0],
              kyc_status: 'pending'
            })
            .select()
            .single();

          if (employeeError) throw employeeError;

          // Create KYC details
          await supabase
            .from('kyc_details')
            .insert({
              employee_id: employeeData.id,
              personal_details: {
                full_name: row['Name'],
                father_name: row['Father Name'],
                mother_name: row['Mother Name'],
                date_of_birth: row['Date of Birth'],
                gender: row['Gender'],
                aadhar_number: row['Aadhar Number'],
                pan_number: row['PAN Number'],
                driving_license: row['Driving License'],
                bank_account_number: row['Bank Account'],
                ifsc_code: row['IFSC Code'],
                bank_name: row['Bank Name'],
                permanent_address: row['Permanent Address'],
                current_address: row['Current Address'],
                age: age
              },
              verification_status: 'pending'
            });

          successCount++;
        } catch (error) {
          console.error('Error processing row:', error);
          errorCount++;
        }
      }

      await fetchEmployees();
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} employees. ${errorCount} records failed.`,
      });
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import employee data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      father_name: '',
      mother_name: '',
      gender: '',
      aadhar_number: '',
      pan_number: '',
      driving_license: '',
      bank_account: '',
      ifsc_code: '',
      bank_name: '',
      permanent_address: '',
      current_address: '',
      role: 'employee',
      department: '',
      salary: '',
      supervisor_id: '',
      team_id: '',
      password: ''
    });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Employee Management & Verification</span>
              </CardTitle>
              <CardDescription>
                Comprehensive employee management with KYC verification, team assignment, and supervisor allocation
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={downloadTemplate}>
                <FileText className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Excel
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employees">
            <TabsList>
              <TabsTrigger value="employees">All Employees</TabsTrigger>
              <TabsTrigger value="create">Add Employee</TabsTrigger>
            </TabsList>
            
            <TabsContent value="employees" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Employees ({employees.length})</h3>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Employee
                </Button>
              </div>
              
              <div className="space-y-4">
                {employees.map((employee) => (
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
                            <span className="text-sm text-gray-600">Verification:</span>
                            {getKYCStatusBadge(employee.kyc_status)}
                            {employee.salary && (
                              <span className="text-sm text-gray-600">• Salary: ₹{employee.salary}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Employee</CardTitle>
                  <CardDescription>
                    Fill in all required information including personal details, documents, and work assignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Enter 10-digit phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth *</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        />
                        {formData.date_of_birth && (
                          <p className="text-sm text-gray-600 mt-1">
                            Age: {calculateAge(formData.date_of_birth)} years
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="father_name">Father's Name</Label>
                        <Input
                          id="father_name"
                          value={formData.father_name}
                          onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                          placeholder="Enter father's name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mother_name">Mother's Name</Label>
                        <Input
                          id="mother_name"
                          value={formData.mother_name}
                          onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                          placeholder="Enter mother's name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Identity Documents */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Identity Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="aadhar_number">Aadhar Number</Label>
                        <Input
                          id="aadhar_number"
                          value={formData.aadhar_number}
                          onChange={(e) => setFormData({...formData, aadhar_number: e.target.value})}
                          placeholder="12-digit Aadhar number"
                          maxLength={12}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pan_number">PAN Number</Label>
                        <Input
                          id="pan_number"
                          value={formData.pan_number}
                          onChange={(e) => setFormData({...formData, pan_number: e.target.value.toUpperCase()})}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <Label htmlFor="driving_license">Driving License</Label>
                        <Input
                          id="driving_license"
                          value={formData.driving_license}
                          onChange={(e) => setFormData({...formData, driving_license: e.target.value})}
                          placeholder="Driving license number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bank_account">Bank Account Number</Label>
                        <Input
                          id="bank_account"
                          value={formData.bank_account}
                          onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                          placeholder="Bank account number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifsc_code">IFSC Code</Label>
                        <Input
                          id="ifsc_code"
                          value={formData.ifsc_code}
                          onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})}
                          placeholder="IFSC code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bank_name">Bank Name</Label>
                        <Input
                          id="bank_name"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                          placeholder="Bank name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="permanent_address">Permanent Address</Label>
                        <Textarea
                          id="permanent_address"
                          value={formData.permanent_address}
                          onChange={(e) => setFormData({...formData, permanent_address: e.target.value})}
                          placeholder="Enter permanent address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="current_address">Current Address</Label>
                        <Textarea
                          id="current_address"
                          value={formData.current_address}
                          onChange={(e) => setFormData({...formData, current_address: e.target.value})}
                          placeholder="Enter current address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Work Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {departments_list.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supervisor_id">Supervisor</Label>
                        <Select value={formData.supervisor_id} onValueChange={(value) => setFormData({...formData, supervisor_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supervisor (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisors.map((supervisor) => (
                              <SelectItem key={supervisor.id} value={supervisor.id}>
                                {supervisor.name} ({supervisor.employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="team_id">Team</Label>
                        <Select value={formData.team_id} onValueChange={(value) => setFormData({...formData, team_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <div>
                        <Label htmlFor="password">Login PIN</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="4-digit PIN"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={createEmployee} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Creating...' : 'Create Employee'}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveEmployeeManagement;