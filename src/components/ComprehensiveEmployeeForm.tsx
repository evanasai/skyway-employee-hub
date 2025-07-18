import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeFormData {
  // Basic Info
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  password: string;
  salary: string;
  
  // Personal Details
  date_of_birth: string;
  gender: string;
  father_name: string;
  mother_name: string;
  address: string;
  pin_code: string;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  
  // Aadhar Details
  aadhar_number: string;
  aadhar_photo_front: string;
  aadhar_photo_back: string;
  
  // PAN Details
  pan_number: string;
  pan_photo: string;
  
  // Bank Details
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  bank_document_photo: string;
  
  // Profile Photo
  profile_photo: string;
}

interface ComprehensiveEmployeeFormProps {
  isCreating: boolean;
  editingEmployee: any | null;
  onSave: (formData: EmployeeFormData) => void;
  onCancel: () => void;
}

const ComprehensiveEmployeeForm: React.FC<ComprehensiveEmployeeFormProps> = ({
  isCreating,
  editingEmployee,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    // Basic Info
    employee_id: editingEmployee?.employee_id || '',
    name: editingEmployee?.name || '',
    email: editingEmployee?.email || '',
    phone: editingEmployee?.phone || '',
    role: editingEmployee?.role || 'employee',
    department: editingEmployee?.department || '',
    password: '',
    salary: editingEmployee?.salary?.toString() || '',
    
    // Personal Details - Initialize with empty values for new employees
    date_of_birth: '',
    gender: '',
    father_name: '',
    mother_name: '',
    address: '',
    pin_code: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    
    // Aadhar Details
    aadhar_number: '',
    aadhar_photo_front: '',
    aadhar_photo_back: '',
    
    // PAN Details
    pan_number: '',
    pan_photo: '',
    
    // Bank Details
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    bank_document_photo: '',
    
    // Profile Photo
    profile_photo: ''
  });

  // Fetch existing profile data for editing
  useEffect(() => {
    if (editingEmployee && editingEmployee.id) {
      fetchEmployeeProfile(editingEmployee.id);
    }
  }, [editingEmployee]);

  const fetchEmployeeProfile = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (data && !error) {
        setFormData(prev => ({
          ...prev,
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          father_name: data.father_name || '',
          mother_name: data.mother_name || '',
          address: data.address || '',
          pin_code: data.pin_code || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relation: data.emergency_contact_relation || '',
          aadhar_number: data.aadhar_number || '',
          aadhar_photo_front: data.aadhar_photo_front || '',
          aadhar_photo_back: data.aadhar_photo_back || '',
          pan_number: data.pan_number || '',
          pan_photo: data.pan_photo || '',
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          ifsc_code: data.ifsc_code || '',
          bank_document_photo: data.bank_document_photo || '',
          profile_photo: data.profile_photo || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching employee profile:', error);
    }
  };

  if (!isCreating && !editingEmployee) return null;

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof EmployeeFormData, file: File) => {
    // In a real application, you would upload to Supabase Storage
    // For now, we'll just store the file name
    setFormData(prev => ({ ...prev, [field]: file.name }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_id">Employee ID *</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="Enter employee ID"
                  disabled={!!editingEmployee}
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter numeric password"
                />
              </div>
              <div>
                <Label htmlFor="salary">Monthly Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="Enter salary amount"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
              <div>
                <Label htmlFor="father_name">Father's Name</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => handleInputChange('father_name', e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>
              <div>
                <Label htmlFor="mother_name">Mother's Name</Label>
                <Input
                  id="mother_name"
                  value={formData.mother_name}
                  onChange={(e) => handleInputChange('mother_name', e.target.value)}
                  placeholder="Enter mother's name"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="pin_code">PIN Code</Label>
                <Input
                  id="pin_code"
                  value={formData.pin_code}
                  onChange={(e) => handleInputChange('pin_code', e.target.value)}
                  placeholder="Enter PIN code"
                />
              </div>
              <div>
                <Label htmlFor="profile_photo">Profile Photo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="profile_photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('profile_photo', file);
                    }}
                  />
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Aadhar Card Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="aadhar_number">Aadhar Number</Label>
                  <Input
                    id="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength={12}
                  />
                </div>
                <div>
                  <Label htmlFor="aadhar_photo_front">Aadhar Front Photo</Label>
                  <Input
                    id="aadhar_photo_front"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('aadhar_photo_front', file);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="aadhar_photo_back">Aadhar Back Photo</Label>
                  <Input
                    id="aadhar_photo_back"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('aadhar_photo_back', file);
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">PAN Card Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input
                    id="pan_number"
                    value={formData.pan_number}
                    onChange={(e) => handleInputChange('pan_number', e.target.value)}
                    placeholder="Enter PAN number"
                    maxLength={10}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <Label htmlFor="pan_photo">PAN Card Photo</Label>
                  <Input
                    id="pan_photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('pan_photo', file);
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <Label htmlFor="ifsc_code">IFSC Code</Label>
                <Input
                  id="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
                  placeholder="Enter IFSC code"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bank_document_photo">Bank Document/Passbook Photo</Label>
                <Input
                  id="bank_document_photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('bank_document_photo', file);
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  placeholder="Enter emergency contact phone"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_relation">Relationship</Label>
                <Select value={formData.emergency_contact_relation} onValueChange={(value) => handleInputChange('emergency_contact_relation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex space-x-2 pt-6 border-t mt-6">
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            {editingEmployee ? 'Update Employee' : 'Create Employee'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveEmployeeForm;