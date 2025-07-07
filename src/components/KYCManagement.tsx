
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X, User, FileText, Shield, Eye } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  kyc_status: string;
}

interface KYCDetails {
  id: string;
  employee_id: string;
  personal_details: any;
  biometric_data: any;
  document_urls: any;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

interface PersonalDetails {
  full_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  nationality: string;
  religion: string;
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  permanent_address: string;
  current_address: string;
  aadhar_number: string;
  pan_number: string;
  passport_number: string;
  driving_license: string;
  bank_account_number: string;
  ifsc_code: string;
  bank_name: string;
}

interface BiometricData {
  fingerprint_data: string;
  face_recognition_data: string;
  iris_scan_data: string;
  voice_print_data: string;
}

interface DocumentUrls {
  photo: string;
  aadhar_front: string;
  aadhar_back: string;
  pan_card: string;
  passport: string;
  driving_license: string;
  bank_passbook: string;
  educational_certificates: string;
  experience_certificates: string;
}

const KYCManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [kycDetails, setKycDetails] = useState<KYCDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const defaultPersonalDetails: PersonalDetails = {
    full_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    nationality: '',
    religion: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    permanent_address: '',
    current_address: '',
    aadhar_number: '',
    pan_number: '',
    passport_number: '',
    driving_license: '',
    bank_account_number: '',
    ifsc_code: '',
    bank_name: ''
  };

  const defaultBiometricData: BiometricData = {
    fingerprint_data: '',
    face_recognition_data: '',
    iris_scan_data: '',
    voice_print_data: ''
  };

  const defaultDocumentUrls: DocumentUrls = {
    photo: '',
    aadhar_front: '',
    aadhar_back: '',
    pan_card: '',
    passport: '',
    driving_license: '',
    bank_passbook: '',
    educational_certificates: '',
    experience_certificates: ''
  };

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(defaultPersonalDetails);
  const [biometricData, setBiometricData] = useState<BiometricData>(defaultBiometricData);
  const [documentUrls, setDocumentUrls] = useState<DocumentUrls>(defaultDocumentUrls);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchKYCDetails();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

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

  const safeJsonToObject = <T,>(jsonData: any, defaultValue: T): T => {
    if (!jsonData || typeof jsonData !== 'object') {
      return defaultValue;
    }
    return { ...defaultValue, ...jsonData } as T;
  };

  const fetchKYCDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_details')
        .select('*')
        .eq('employee_id', selectedEmployee)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setKycDetails(data);
        setPersonalDetails(safeJsonToObject(data.personal_details, defaultPersonalDetails));
        setBiometricData(safeJsonToObject(data.biometric_data, defaultBiometricData));
        setDocumentUrls(safeJsonToObject(data.document_urls, defaultDocumentUrls));
      } else {
        setKycDetails(null);
        setPersonalDetails(defaultPersonalDetails);
        setBiometricData(defaultBiometricData);
        setDocumentUrls(defaultDocumentUrls);
      }
    } catch (error) {
      console.error('Error fetching KYC details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch KYC details",
        variant: "destructive"
      });
    }
  };

  const saveKYCDetails = async () => {
    try {
      const kycData = {
        employee_id: selectedEmployee,
        personal_details: personalDetails as any,
        biometric_data: biometricData as any,
        document_urls: documentUrls as any,
        verification_status: 'pending',
        updated_at: new Date().toISOString()
      };

      if (kycDetails) {
        const { error } = await supabase
          .from('kyc_details')
          .update(kycData)
          .eq('id', kycDetails.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kyc_details')
          .insert(kycData);

        if (error) throw error;
      }

      await fetchKYCDetails();
      setIsEditing(false);
      
      toast({
        title: "KYC Details Saved",
        description: "Employee KYC information has been updated successfully",
      });
    } catch (error) {
      console.error('Error saving KYC details:', error);
      toast({
        title: "Error",
        description: "Failed to save KYC details",
        variant: "destructive"
      });
    }
  };

  const updateVerificationStatus = async (status: string) => {
    if (!kycDetails) return;

    try {
      const { error } = await supabase
        .from('kyc_details')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          verified_by: 'current_user' // You can replace this with actual user ID
        })
        .eq('id', kycDetails.id);

      if (error) throw error;

      // Update employee KYC status
      await supabase
        .from('employees')
        .update({ kyc_status: status })
        .eq('id', selectedEmployee);

      await fetchKYCDetails();
      await fetchEmployees();
      
      toast({
        title: "Verification Status Updated",
        description: `KYC status has been updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'verified':
        return <Badge className="bg-blue-100 text-blue-800">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>KYC Management</span>
          </CardTitle>
          <CardDescription>
            Manage employee KYC verification and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id}) - {getStatusBadge(employee.kyc_status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmployeeData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>KYC Details - {selectedEmployeeData.name}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedEmployeeData.kyc_status)}
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        <User className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={saveKYCDetails} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Details Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={personalDetails.full_name}
                        onChange={(e) => setPersonalDetails({...personalDetails, full_name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="father_name">Father's Name</Label>
                      <Input
                        id="father_name"
                        value={personalDetails.father_name}
                        onChange={(e) => setPersonalDetails({...personalDetails, father_name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={personalDetails.date_of_birth}
                        onChange={(e) => setPersonalDetails({...personalDetails, date_of_birth: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={personalDetails.gender} 
                        onValueChange={(value) => setPersonalDetails({...personalDetails, gender: value})}
                        disabled={!isEditing}
                      >
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
                      <Label htmlFor="aadhar_number">Aadhar Number</Label>
                      <Input
                        id="aadhar_number"
                        value={personalDetails.aadhar_number}
                        onChange={(e) => setPersonalDetails({...personalDetails, aadhar_number: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pan_number">PAN Number</Label>
                      <Input
                        id="pan_number"
                        value={personalDetails.pan_number}
                        onChange={(e) => setPersonalDetails({...personalDetails, pan_number: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Actions */}
                {kycDetails && selectedEmployeeData.kyc_status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => updateVerificationStatus('verified')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Approve KYC
                    </Button>
                    <Button 
                      onClick={() => updateVerificationStatus('rejected')}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject KYC
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCManagement;
