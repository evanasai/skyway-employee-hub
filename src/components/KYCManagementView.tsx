
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface KYCDetail {
  id: string;
  employee_id: string | null;
  verification_status: string | null;
  personal_details: Json | null;
  document_urls: Json | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  employee: {
    name: string;
    employee_id: string;
    email: string;
  } | null;
}

const KYCManagementView = () => {
  const [kycDetails, setKycDetails] = useState<KYCDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKYCDetails();
  }, []);

  const fetchKYCDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_details')
        .select(`
          *,
          employee:employees!kyc_details_employee_id_fkey(name, employee_id, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        employee: Array.isArray(item.employee) ? item.employee[0] : item.employee
      })) || [];
      
      setKycDetails(transformedData);
    } catch (error) {
      console.error('Error fetching KYC details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading KYC details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">KYC Management</h2>
          <p className="text-gray-600">Manage employee KYC verification process</p>
        </div>
      </div>

      <div className="grid gap-4">
        {kycDetails.map((kyc) => (
          <Card key={kyc.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{kyc.employee?.name || 'Unknown Employee'}</CardTitle>
                  <CardDescription>
                    Employee ID: {kyc.employee?.employee_id || 'N/A'} | Email: {kyc.employee?.email || 'N/A'}
                  </CardDescription>
                </div>
                {getStatusBadge(kyc.verification_status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Submitted: {kyc.created_at ? new Date(kyc.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  {kyc.verified_at && (
                    <p className="text-sm text-gray-600">
                      Verified: {new Date(kyc.verified_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  {kyc.verification_status === 'pending' && (
                    <>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {kycDetails.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No KYC submissions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KYCManagementView;
