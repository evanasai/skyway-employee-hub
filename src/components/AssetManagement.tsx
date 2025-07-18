import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { AssetRequest } from '@/types/database';

const AssetManagement = () => {
  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);

  useEffect(() => {
    fetchAssetRequests();
  }, []);

  const fetchAssetRequests = async () => {
    try {
      console.log('Fetching asset requests...');
      const { data, error } = await supabase
        .from('asset_requests')
        .select(`
          *,
          employees!asset_requests_employee_id_fkey (
            name,
            employee_id
          ),
          assets!asset_requests_asset_id_fkey (
            name,
            category
          )
        `)
        .order('request_date', { ascending: false });

      console.log('Asset requests query result:', { data, error });
      if (error) throw error;
      setAssetRequests(data as AssetRequest[] || []);
    } catch (error) {
      console.error('Error fetching asset requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch asset requests",
        variant: "destructive"
      });
    }
  };

  const approveAssetRequest = async (request: AssetRequest) => {
    try {
      const { error } = await supabase
        .from('asset_requests')
        .update({
          status: 'approved',
          approved_date: new Date().toISOString(),
          approved_by: 'admin' // This should be the actual admin user ID
        })
        .eq('id', request.id);

      if (error) throw error;

      // Create deduction record for one-time payment or EMI
      if (request.payment_type === 'one_time_deduction') {
        await supabase
          .from('employee_deductions')
          .insert({
            employee_id: request.employee_id,
            deduction_type: 'asset_purchase',
            amount: request.total_amount,
            description: `Asset purchase: ${request.assets?.name}`,
            reference_id: request.id,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0]
          });
      } else if (request.payment_type === 'emi') {
        // Calculate EMI amount and create monthly deduction
        const monthlyEMI = request.total_amount / (request.emi_months || 1);
        await supabase
          .from('employee_deductions')
          .insert({
            employee_id: request.employee_id,
            deduction_type: 'asset_emi',
            amount: monthlyEMI,
            description: `Monthly EMI for ${request.assets?.name}`,
            reference_id: request.id,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + (request.emi_months || 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });

        // Update asset request with EMI details
        await supabase
          .from('asset_requests')
          .update({
            monthly_emi: monthlyEMI,
            emi_remaining_months: request.emi_months,
            next_emi_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
          .eq('id', request.id);
      }

      fetchAssetRequests();
      toast({
        title: "Request Approved",
        description: `Asset request approved. ${request.payment_type === 'one_time_deduction' ? 'One-time deduction' : 'Monthly EMI'} added to employee payroll.`,
      });
    } catch (error) {
      console.error('Error approving asset request:', error);
      toast({
        title: "Error",
        description: "Failed to approve asset request",
        variant: "destructive"
      });
    }
  };

  const rejectAssetRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('asset_requests')
        .update({
          status: 'rejected',
          approved_date: new Date().toISOString(),
          approved_by: 'admin' // This should be the actual admin user ID
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchAssetRequests();
      toast({
        title: "Request Rejected",
        description: "Asset request has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting asset request:', error);
      toast({
        title: "Error",
        description: "Failed to reject asset request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = assetRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Asset Management</CardTitle>
              <CardDescription>
                Review and approve employee asset requests. Approved assets are automatically added to payroll deductions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-amber-700">Pending Requests ({pendingRequests.length})</h3>
              <div className="rounded-md border border-amber-200 bg-amber-50">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Payment Type</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.employees?.name}</div>
                            <div className="text-sm text-muted-foreground">{request.employees?.employee_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.assets?.name}</div>
                            <div className="text-sm text-muted-foreground">{request.assets?.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell className="font-semibold">₹{request.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="capitalize">{request.payment_type.replace('_', ' ')}</span>
                          {request.payment_type === 'emi' && (
                            <div className="text-sm text-muted-foreground">
                              {request.emi_months} months
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveAssetRequest(request)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectAssetRequest(request.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">All Requests ({assetRequests.length})</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employees?.name}</div>
                          <div className="text-sm text-muted-foreground">{request.employees?.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.assets?.name}</div>
                          <div className="text-sm text-muted-foreground">{request.assets?.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell className="font-semibold">₹{request.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="capitalize">{request.payment_type.replace('_', ' ')}</span>
                        {request.payment_type === 'emi' && request.monthly_emi && (
                          <div className="text-sm text-muted-foreground">
                            ₹{request.monthly_emi.toLocaleString()}/month
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.approved_date ? new Date(request.approved_date).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {assetRequests.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No asset requests found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetManagement;