
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Save } from 'lucide-react';

interface KYCSubmissionFormProps {
  employeeId: string;
  onSubmissionComplete?: () => void;
}

const KYCSubmissionForm = ({ employeeId, onSubmissionComplete }: KYCSubmissionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    aadhar_number: '',
    pan_number: '',
    bank_account: '',
    ifsc_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submitKYC = async () => {
    if (!formData.full_name || !formData.phone || !formData.aadhar_number) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Phone, Aadhar)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Submitting KYC for employee:', employeeId);

      const kycData = {
        employee_id: employeeId,
        personal_details: {
          full_name: formData.full_name,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          emergency_contact: {
            name: formData.emergency_contact_name,
            phone: formData.emergency_contact_phone,
            relation: formData.emergency_contact_relation
          }
        },
        document_urls: {
          aadhar_number: formData.aadhar_number,
          pan_number: formData.pan_number,
          bank_details: {
            account_number: formData.bank_account,
            ifsc_code: formData.ifsc_code
          }
        },
        verification_status: 'pending'
      };

      const { error } = await supabase
        .from('kyc_details')
        .insert(kycData);

      if (error) {
        console.error('Error submitting KYC:', error);
        toast({
          title: "Error",
          description: `Failed to submit KYC: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "KYC Submitted",
        description: "Your KYC details have been submitted for verification",
      });

      if (onSubmissionComplete) {
        onSubmissionComplete();
      }

      // Reset form
      setFormData({
        full_name: '',
        father_name: '',
        mother_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        aadhar_number: '',
        pan_number: '',
        bank_account: '',
        ifsc_code: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: ''
      });
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: "Error",
        description: "Failed to submit KYC details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Submission</CardTitle>
        <CardDescription>
          Submit your Know Your Customer (KYC) details for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="father_name">Father's Name</Label>
            <Input
              id="father_name"
              value={formData.father_name}
              onChange={(e) => handleInputChange('father_name', e.target.value)}
              placeholder="Enter father's name"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="mother_name">Mother's Name</Label>
            <Input
              id="mother_name"
              value={formData.mother_name}
              onChange={(e) => handleInputChange('mother_name', e.target.value)}
              placeholder="Enter mother's name"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => handleInputChange('gender', value)}
              disabled={isLoading}
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
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="aadhar_number">Aadhar Number *</Label>
            <Input
              id="aadhar_number"
              value={formData.aadhar_number}
              onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
              placeholder="Enter Aadhar number"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="pan_number">PAN Number</Label>
            <Input
              id="pan_number"
              value={formData.pan_number}
              onChange={(e) => handleInputChange('pan_number', e.target.value)}
              placeholder="Enter PAN number"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="bank_account">Bank Account Number</Label>
            <Input
              id="bank_account"
              value={formData.bank_account}
              onChange={(e) => handleInputChange('bank_account', e.target.value)}
              placeholder="Enter bank account number"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="ifsc_code">IFSC Code</Label>
            <Input
              id="ifsc_code"
              value={formData.ifsc_code}
              onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
              placeholder="Enter IFSC code"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter complete address"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emergency_contact_name">Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                placeholder="Enter contact name"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                placeholder="Enter contact phone"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact_relation">Relation</Label>
              <Input
                id="emergency_contact_relation"
                value={formData.emergency_contact_relation}
                onChange={(e) => handleInputChange('emergency_contact_relation', e.target.value)}
                placeholder="Enter relation"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <Button onClick={submitKYC} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Submit KYC Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KYCSubmissionForm;
