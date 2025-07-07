
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Save, X, Upload, Check, AlertCircle } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  kyc_status: string;
  created_at: string;
}

interface KYCDetails {
  id: string;
  employee_id: string;
  personal_details: any;
  biometric_data: any;
  document_urls: any;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

const KYCManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [kycDetails, setKycDetails] = useState<KYCDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [personalDetails, setPersonalDetails] = useState({
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
  });
  
  const [biometricData, setBiometricData] = useState({
    fingerprint_data: '',
    face_recognition_data: '',
    iris_scan_data: '',
    voice_print_data: ''
  });

  const [documentUrls, setDocumentUrls] = useState({
    photo: '',
    aadhar_front: '',
    aadhar_back: '',
    pan_card: '',
    passport: '',
    driving_license: '',
    bank_passbook: '',
    educational_certificates: '',
    experience_certificates: ''
  });

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
        .select('id, employee_id, name, email, kyc_status, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
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
        setPersonalDetails(data.personal_details || {});
        setBiometricData(data.biometric_data || {});
        setDocumentUrls(data.document_urls || {});
      } else {
        setKycDetails(null);
        setPersonalDetails({
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
        });
        setBiometricData({
          fingerprint_data: '',
          face_recognition_data: '',
          iris_scan_data: '',
          voice_print_data: ''
        });
        setDocumentUrls({
          photo: '',
          aadhar_front: '',
          aadhar_back: '',
          pan_card: '',
          passport: '',
          driving_license: '',
          bank_passbook: '',
          educational_certificates: '',
          experience_certificates: ''
        });
      }
    } catch (error) {
      console.error('Error fetching KYC details:', error);
    }
  };

  const saveKYCDetails = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee first",
        variant: "destructive"
      });
      return;
    }

    try {
      const kycData = {
        employee_id: selectedEmployee,
        personal_details: personalDetails,
        biometric_data: biometricData,
        document_urls: documentUrls,
        verification_status: 'pending',
        updated_at: new Date().toISOString()
      };

      let error;
      if (kycDetails) {
        // Update existing record
        ({ error } = await supabase
          .from('kyc_details')
          .update(kycData)
          .eq('id', kycDetails.id));
      } else {
        // Insert new record
        ({ error } = await supabase
          .from('kyc_details')
          .insert(kycData));
      }

      if (error) throw error;

      // Update employee KYC status
      await supabase
        .from('employees')
        .update({ 
          kyc_status: personalDetails.full_name ? 'in_progress' : 'pending'
        })
        .eq('id', selectedEmployee);

      setIsEditing(false);
      fetchKYCDetails();
      fetchEmployees();
      
      toast({
        title: "KYC Details Saved",
        description: "KYC information has been saved successfully",
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

  const verifyKYC = async (status: 'verified' | 'rejected') => {
    if (!kycDetails) return;

    try {
      const { error } = await supabase
        .from('kyc_details')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          // verified_by: currentUser.id // You'd need to get current user
        })
        .eq('id', kycDetails.id);

      if (error) throw error;

      // Update employee KYC status
      await supabase
        .from('employees')
        .update({ 
          kyc_status: status === 'verified' ? 'completed' : 'rejected'
        })
        .eq('id', selectedEmployee);

      fetchKYCDetails();
      fetchEmployees();
      
      toast({
        title: `KYC ${status === 'verified' ? 'Verified' : 'Rejected'}`,
        description: `Employee KYC has been ${status}`,
      });
    } catch (error) {
      console.error('Error verifying KYC:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      });
    }
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Management</CardTitle>
          <CardDescription>
            Manage employee KYC details and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">KYC Overview</TabsTrigger>
              <TabsTrigger value="details">KYC Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.employee_id}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{getKYCStatusBadge(employee.kyc_status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee.id);
                              // Switch to details tab
                              const tabsContent = document.querySelector('[value="details"]') as HTMLElement;
                              if (tabsContent) tabsContent.click();
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="select_employee">Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee to manage KYC" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEmployee && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        KYC Details for {employees.find(e => e.id === selectedEmployee)?.name}
                      </h3>
                      {kycDetails && (
                        <div className="mt-2">
                          {getVerificationStatusBadge(kycDetails.verification_status)}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          {kycDetails && kycDetails.verification_status === 'pending' && (
                            <>
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => verifyKYC('verified')}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Verify
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => verifyKYC('rejected')}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Button onClick={saveKYCDetails}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              fetchKYCDetails();
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <Tabs defaultValue="personal">
                    <TabsList>
                      <TabsTrigger value="personal">Personal Details</TabsTrigger>
                      <TabsTrigger value="biometric">Biometric Data</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                              <Label htmlFor="mother_name">Mother's Name</Label>
                              <Input
                                id="mother_name"
                                value={personalDetails.mother_name}
                                onChange={(e) => setPersonalDetails({...personalDetails, mother_name: e.target.value})}
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
                              <Label htmlFor="blood_group">Blood Group</Label>
                              <Select 
                                value={personalDetails.blood_group} 
                                onValueChange={(value) => setPersonalDetails({...personalDetails, blood_group: value})}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A-">A-</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B-">B-</SelectItem>
                                  <SelectItem value="AB+">AB+</SelectItem>
                                  <SelectItem value="AB-">AB-</SelectItem>
                                  <SelectItem value="O+">O+</SelectItem>
                                  <SelectItem value="O-">O-</SelectItem>
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
                            <div className="md:col-span-2">
                              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                              <Input
                                id="emergency_contact_name"
                                value={personalDetails.emergency_contact_name}
                                onChange={(e) => setPersonalDetails({...personalDetails, emergency_contact_name: e.target.value})}
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                              <Input
                                id="emergency_contact_phone"
                                value={personalDetails.emergency_contact_phone}
                                onChange={(e) => setPersonalDetails({...personalDetails, emergency_contact_phone: e.target.value})}
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor="emergency_contact_relation">Relation</Label>
                              <Input
                                id="emergency_contact_relation"
                                value={personalDetails.emergency_contact_relation}
                                onChange={(e) => setPersonalDetails({...personalDetails, emergency_contact_relation: e.target.value})}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="permanent_address">Permanent Address</Label>
                              <Textarea
                                id="permanent_address"
                                value={personalDetails.permanent_address}
                                onChange={(e) => setPersonalDetails({...personalDetails, permanent_address: e.target.value})}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="current_address">Current Address</Label>
                              <Textarea
                                id="current_address"
                                value={personalDetails.current_address}
                                onChange={(e) => setPersonalDetails({...personalDetails, current_address: e.target.value})}
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="biometric" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Biometric Information</CardTitle>
                          <CardDescription>
                            Biometric data for employee identification and security
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fingerprint">Fingerprint Data</Label>
                              <Textarea
                                id="fingerprint"
                                value={biometricData.fingerprint_data}
                                onChange={(e) => setBiometricData({...biometricData, fingerprint_data: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Fingerprint scan data"
                              />
                            </div>
                            <div>
                              <Label htmlFor="face_recognition">Face Recognition Data</Label>
                              <Textarea
                                id="face_recognition"
                                value={biometricData.face_recognition_data}
                                onChange={(e) => setBiometricData({...biometricData, face_recognition_data: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Face recognition data"
                              />
                            </div>
                            <div>
                              <Label htmlFor="iris_scan">Iris Scan Data</Label>
                              <Textarea
                                id="iris_scan"
                                value={biometricData.iris_scan_data}
                                onChange={(e) => setBiometricData({...biometricData, iris_scan_data: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Iris scan data"
                              />
                            </div>
                            <div>
                              <Label htmlFor="voice_print">Voice Print Data</Label>
                              <Textarea
                                id="voice_print"
                                value={biometricData.voice_print_data}
                                onChange={(e) => setBiometricData({...biometricData, voice_print_data: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Voice print data"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Document URLs</CardTitle>
                          <CardDescription>
                            Links to uploaded document files
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="photo">Photo</Label>
                              <Input
                                id="photo"
                                value={documentUrls.photo}
                                onChange={(e) => setDocumentUrls({...documentUrls, photo: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Photo URL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="aadhar_front">Aadhar Card Front</Label>
                              <Input
                                id="aadhar_front"
                                value={documentUrls.aadhar_front}
                                onChange={(e) => setDocumentUrls({...documentUrls, aadhar_front: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Aadhar front URL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="aadhar_back">Aadhar Card Back</Label>
                              <Input
                                id="aadhar_back"
                                value={documentUrls.aadhar_back}
                                onChange={(e) => setDocumentUrls({...documentUrls, aadhar_back: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Aadhar back URL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="pan_card">PAN Card</Label>
                              <Input
                                id="pan_card"
                                value={documentUrls.pan_card}
                                onChange={(e) => setDocumentUrls({...documentUrls, pan_card: e.target.value})}
                                disabled={!isEditing}
                                placeholder="PAN card URL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="bank_passbook">Bank Passbook</Label>
                              <Input
                                id="bank_passbook"
                                value={documentUrls.bank_passbook}
                                onChange={(e) => setDocumentUrls({...documentUrls, bank_passbook: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Bank passbook URL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="educational_certificates">Educational Certificates</Label>
                              <Input
                                id="educational_certificates"
                                value={documentUrls.educational_certificates}
                                onChange={(e) => setDocumentUrls({...documentUrls, educational_certificates: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Educational certificates URL"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCManagement;
