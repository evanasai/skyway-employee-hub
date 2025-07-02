
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Eye, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MyDocumentsProps {
  onBack: () => void;
}

interface Document {
  id: string;
  document_type: string;
  document_url: string;
  document_name: string;
  uploaded_at: string;
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

const MyDocuments = ({ onBack }: MyDocumentsProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
    fetchBankDetails();
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
        // For now, we'll use mock data since the tables don't exist in types yet
        const mockDocuments: Document[] = [
          {
            id: '1',
            document_type: 'driving_license',
            document_url: '/placeholder.svg',
            document_name: 'Driving License',
            uploaded_at: new Date().toISOString()
          },
          {
            id: '2',
            document_type: 'rc_book',
            document_url: '/placeholder.svg',
            document_name: 'RC Book',
            uploaded_at: new Date().toISOString()
          }
        ];
        setDocuments(mockDocuments);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
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
        // Mock bank details for now
        const mockBankDetails: BankDetails = {
          bank_name: 'State Bank of India',
          account_number: '1234567890',
          ifsc_code: 'SBIN0001234',
          account_holder_name: user.name,
          esi_number: 'ESI123456789',
          pf_number: 'PF987654321',
          insurance_number: 'INS555666777'
        };
        setBankDetails(mockBankDetails);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = {
    'driving_license': 'Driving License',
    'rc_book': 'RC Book',
    'bike_photo': 'Bike Photo',
    'bank_passbook': 'Bank Passbook',
    'insurance_card': 'Insurance Card'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div>Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>My Documents</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Documents Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Document Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{doc.document_name}</h4>
                          <p className="text-sm text-gray-600">
                            {documentTypes[doc.document_type as keyof typeof documentTypes]}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.document_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bank Details Section */}
            {bankDetails && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Bank & Official Details</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Bank Name</label>
                        <p className="text-base">{bankDetails.bank_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Account Number</label>
                        <p className="text-base">****{bankDetails.account_number.slice(-4)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                        <p className="text-base">{bankDetails.ifsc_code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Account Holder Name</label>
                        <p className="text-base">{bankDetails.account_holder_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">ESI Number</label>
                        <p className="text-base">{bankDetails.esi_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">PF Number</label>
                        <p className="text-base">{bankDetails.pf_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Insurance Number</label>
                        <p className="text-base">{bankDetails.insurance_number}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyDocuments;
