
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface AdvanceRequest {
  id: string;
  employee_id: string;
  amount: number;
  reason: string;
  status: string;
  request_date: string;
  approved_by?: string;
  approved_date?: string;
  employees?: {
    name: string;
    employee_id: string;
  };
}

interface AssetRequest {
  id: string;
  employee_id: string;
  asset_id: string;
  quantity: number;
  reason: string;
  total_amount: number;
  monthly_emi: number;
  status: string;
  request_date: string;
  approved_by?: string;
  approved_date?: string;
  employees?: {
    name: string;
    employee_id: string;
  };
  assets?: {
    name: string;
  };
}

const AdvanceExpenseManagement = () => {
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchAdvanceRequests();
    fetchAssetRequests();
  }, []);

  const fetchAdvanceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('advance_requests')
        .select(`
          *,
          employees!advance_requests_employee_id_fkey (
            name,
            employee_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvanceRequests(data || []);
    } catch (error) {
      console.error('Error fetching advance requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch advance requests",
        variant: "destructive"
      });
    }
  };

  const fetchAssetRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_requests')
        .select(`
          *,
          employees!asset_requests_employee_id_fkey (
            name,
            employee_id
          ),
          assets!asset_requests_asset_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssetRequests(data || []);
    } catch (error) {
      console.error('Error fetching asset requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch asset requests",
        variant: "destructive"
      });
    }
  };

  const updateAdvanceStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('advance_requests')
        .update({
          status,
          approved_date: new Date().toISOString(),
          approved_by: 'admin' // In a real app, this would be the current user's ID
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchAdvanceRequests();
      
      toast({
        title: "Request Updated",
        description: `Advance request has been ${status}`,
      });
    } catch (error) {
      console.error('Error updating advance request:', error);
      toast({
        title: "Error",
        description: "Failed to update advance request",
        variant: "destructive"
      });
    }
  };

  const updateAssetStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('asset_requests')
        .update({
          status,
          approved_date: new Date().toISOString(),
          approved_by: 'admin' // In a real app, this would be the current user's ID
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchAssetRequests();
      
      toast({
        title: "Request Updated",
        description: `Asset request has been ${status}`,
      });
    } catch (error) {
      console.error('Error updating asset request:', error);
      toast({
        title: "Error",
        description: "Failed to update asset request",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const filteredAdvanceRequests = advanceRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const filteredAssetRequests = assetRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advance & Expense Management</CardTitle>
          <CardDescription>
            Manage employee advance requests and asset purchases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending ({advanceRequests.filter(r => r.status === 'pending').length + assetRequests.filter(r => r.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              Approved ({advanceRequests.filter(r => r.status === 'approved').length + assetRequests.filter(r => r.status === 'approved').length})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({advanceRequests.filter(r => r.status === 'rejected').length + assetRequests.filter(r => r.status === 'rejected').length})
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({advanceRequests.length + assetRequests.length})
            </Button>
          </div>

          <Tabs defaultValue="advances">
            <TabsList>
              <TabsTrigger value="advances">
                Advance Requests ({filteredAdvanceRequests.length})
              </TabsTrigger>
              <TabsTrigger value="assets">
                Asset Requests ({filteredAssetRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="advances">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdvanceRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No advance requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAdvanceRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.employees?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">{request.employees?.employee_id || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">₹{request.amount}</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{new Date(request.request_date || request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateAdvanceStatus(request.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateAdvanceStatus(request.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="assets">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Monthly EMI</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssetRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No asset requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssetRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.employees?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">{request.employees?.employee_id || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>{request.assets?.name || 'Unknown Asset'}</TableCell>
                          <TableCell>{request.quantity}</TableCell>
                          <TableCell className="font-semibold">₹{request.total_amount}</TableCell>
                          <TableCell>₹{request.monthly_emi}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateAssetStatus(request.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateAssetStatus(request.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvanceExpenseManagement;
