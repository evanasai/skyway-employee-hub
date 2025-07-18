import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, IndianRupee } from 'lucide-react';
import { AdvanceRequest } from '@/types/database';

const AdvanceManagement = () => {
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);

  useEffect(() => {
    fetchAdvanceRequests();
  }, []);

  const fetchAdvanceRequests = async () => {
    try {
      console.log('Fetching advance requests...');
      const { data, error } = await supabase
        .from('advance_requests')
        .select(`
          *,
          employees!advance_requests_employee_id_fkey (
            name,
            employee_id
          )
        `)
        .order('request_date', { ascending: false });

      console.log('Advance requests query result:', { data, error });
      if (error) throw error;
      setAdvanceRequests(data as AdvanceRequest[] || []);
    } catch (error) {
      console.error('Error fetching advance requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch advance requests",
        variant: "destructive"
      });
    }
  };

  const approveAdvanceRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('advance_requests')
        .update({
          status: 'approved',
          approved_date: new Date().toISOString(),
          approved_by: 'admin' // This should be the actual admin user ID
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchAdvanceRequests();
      toast({
        title: "Request Approved",
        description: "Advance request has been approved and will be added to payroll deductions",
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const rejectAdvanceRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('advance_requests')
        .update({
          status: 'rejected',
          approved_date: new Date().toISOString(),
          approved_by: 'admin' // This should be the actual admin user ID
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchAdvanceRequests();
      toast({
        title: "Request Rejected",
        description: "Advance request has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
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

  const pendingRequests = advanceRequests.filter(r => r.status === 'pending');
  const processedRequests = advanceRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <IndianRupee className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Advance Management</CardTitle>
              <CardDescription>
                Review and approve employee advance requests. Approved advances are automatically added to payroll deductions.
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
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
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
                        <TableCell className="font-semibold">₹{request.amount.toLocaleString()}</TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveAdvanceRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectAdvanceRequest(request.id)}
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
            <h3 className="text-lg font-semibold mb-4">All Requests ({advanceRequests.length})</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advanceRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employees?.name}</div>
                          <div className="text-sm text-muted-foreground">{request.employees?.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₹{request.amount.toLocaleString()}</TableCell>
                      <TableCell>{request.reason}</TableCell>
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

          {advanceRequests.length === 0 && (
            <div className="text-center py-8">
              <IndianRupee className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No advance requests found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvanceManagement;