
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, CreditCard, User, Shield, Phone } from 'lucide-react';

interface MyDocumentsProps {
  onBack: () => void;
}

interface BankDetails {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  esi_number: string;
  pf_number: string;
  insurance_number: string;
}

interface Document {
  id: string;
  document_type: string;
  document_url: string;
  document_name: string;
  uploaded_at: string;
}

const MyDocuments = ({ onBack }: MyDocumentsProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchBankDetails();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { data: docs } = await supabase
          .from('employee_documents')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('is_active', true);

        setDocuments(docs || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive"
      });
    }
  };

  const fetchBankDetails = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { data: bankData } = await supabase
          .from('employee_bank_details')
          .select('*')
          .eq('employee_id', employee.id)
          .single();

        setBankDetails(bankData);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'driving_license':
        return <CreditCard className="h-8 w-8 text-blue-600" />;
      case 'rc_book':
        return <FileText className="h-8 w-8 text-green-600" />;
      case 'bike_photo':
        return <FileText className="h-8 w-8 text-purple-600" />;
      case 'bank_passbook':
        return <CreditCard className="h-8 w-8 text-orange-600" />;
      case 'insurance_card':
        return <Shield className="h-8 w-8 text-red-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'driving_license':
        return 'Driving License';
      case 'rc_book':
        return 'RC Book';
      case 'bike_photo':
        return 'Bike Photo';
      case 'bank_passbook':
        return 'Bank Passbook';
      case 'insurance_card':
        return 'Insurance Card';
      default:
        return 'Document';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">My Documents</h1>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">My Documents</h1>
      </div>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Bank & Statutory Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bankDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Bank Name</label>
                <div className="text-lg">{bankDetails.bank_name || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Number</label>
                <div className="text-lg">{bankDetails.account_number || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                <div className="text-lg">{bankDetails.ifsc_code || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Holder Name</label>
                <div className="text-lg">{bankDetails.account_holder_name || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ESI Number</label>
                <div className="text-lg">{bankDetails.esi_number || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">PF Number</label>
                <div className="text-lg">{bankDetails.pf_number || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Insurance Number</label>
                <div className="text-lg">{bankDetails.insurance_number || 'Not provided'}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bank details found. Please contact admin to update your information.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      {getDocumentIcon(doc.document_type)}
                      <div className="flex-1">
                        <h3 className="font-medium">{getDocumentTitle(doc.document_type)}</h3>
                        <p className="text-sm text-gray-600">{doc.document_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      View Document
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found. Please contact admin to upload your documents.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Need to Update Information?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            To update your bank details or upload new documents, please contact the admin.
          </p>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => window.open('tel:+917842288660')}
              className="flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Call Admin</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://wa.me/917842288660')}
              className="flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>WhatsApp</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDocuments;
