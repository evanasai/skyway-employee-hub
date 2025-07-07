import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { AdvanceRequest, TaskSubmission, AssetRequest } from '@/types/database';

const AdvanceExpenseManagement = () => {
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('advances');

  useEffect(() => {
    fetchAdvanceRequests();
    fetchTaskSubmissions();
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
        .order('request_date', { ascending: false });

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

  const fetchTaskSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          employees!task_submissions_employee_id_fkey (
            name,
            employee_id
          )
        `)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaskSubmissions(data as TaskSubmission[] || []);
    } catch (error) {
      console.error('Error fetching task submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch task submissions",
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
            name,
            category
          )
        `)
        .order('request_date', { ascending: false });

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
        description: "Advance request has been approved successfully",
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

  const approveTaskSubmission = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin', // This should be the actual admin user ID
          supervisor_feedback: feedback
        })
        .eq('id', taskId);

      if (error) throw error;

      fetchTaskSubmissions();
      setIsDialogOpen(false);
      setFeedback('');
      toast({
        title: "Task Approved",
        description: "Task submission has been approved successfully",
      });
    } catch (error) {
      console.error('Error approving task:', error);
      toast({
        title: "Error",
        description: "Failed to approve task",
        variant: "destructive"
      });
    }
  };

  const rejectTaskSubmission = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin', // This should be the actual admin user ID
          supervisor_feedback: feedback
        })
        .eq('id', taskId);

      if (error) throw error;

      fetchTaskSubmissions();
      setIsDialogOpen(false);
      setFeedback('');
      toast({
        title: "Task Rejected",
        description: "Task submission has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast({
        title: "Error",
        description: "Failed to reject task",
        variant: "destructive"
      });
    }
  };

  const approveAssetRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('asset_requests')
        .update({
          status: 'approved',
          approved_date: new Date().toISOString(),
          approved_by: 'admin' // This should be the actual admin user ID
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchAssetRequests();
      toast({
        title: "Asset Request Approved",
        description: "Asset request has been approved successfully",
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
        title: "Asset Request Rejected",
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

  const openTaskReviewDialog = (task: TaskSubmission) => {
    setSelectedRequest(task);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_review':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advance & Expense Management</CardTitle>
          <CardDescription>
            Review and approve employee requests for advances, tasks, and assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button 
              variant={activeTab === 'advances' ? 'default' : 'outline'}
              onClick={() => setActiveTab('advances')}
            >
              Advance Requests ({advanceRequests.filter(r => r.status === 'pending').length})
            </Button>
            <Button 
              variant={activeTab === 'tasks' ? 'default' : 'outline'}
              onClick={() => setActiveTab('tasks')}
            >
              Task Submissions ({taskSubmissions.length})
            </Button>
            <Button 
              variant={activeTab === 'assets' ? 'default' : 'outline'}
              onClick={() => setActiveTab('assets')}
            >
              Asset Requests ({assetRequests.filter(r => r.status === 'pending').length})
            </Button>
          </div>

          {activeTab === 'advances' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advanceRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employees?.name}</div>
                          <div className="text-sm text-gray-500">{request.employees?.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>₹{request.amount}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
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
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskSubmissions.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.employees?.name}</div>
                          <div className="text-sm text-gray-500">{task.employees?.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{task.task_type}</TableCell>
                      <TableCell>{task.task_description}</TableCell>
                      <TableCell>{new Date(task.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openTaskReviewDialog(task)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'assets' && (
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employees?.name}</div>
                          <div className="text-sm text-gray-500">{request.employees?.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.assets?.name}</div>
                          <div className="text-sm text-gray-500">{request.assets?.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>₹{request.total_amount}</TableCell>
                      <TableCell>
                        <span className="capitalize">{request.payment_type.replace('_', ' ')}</span>
                        {request.payment_type === 'emi_plan' && (
                          <div className="text-sm text-gray-500">
                            ₹{request.monthly_emi}/month for {request.emi_months} months
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveAssetRequest(request.id)}
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
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Task Submission</DialogTitle>
            <DialogDescription>
              Review the task details and provide feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Employee:</strong> {selectedRequest.employees?.name}
                </div>
                <div>
                  <strong>Task Type:</strong> {selectedRequest.task_type}
                </div>
                <div>
                  <strong>Start Time:</strong> {selectedRequest.start_time ? new Date(selectedRequest.start_time).toLocaleString() : 'N/A'}
                </div>
                <div>
                  <strong>End Time:</strong> {selectedRequest.end_time ? new Date(selectedRequest.end_time).toLocaleString() : 'N/A'}
                </div>
              </div>
              
              <div>
                <strong>Description:</strong>
                <p className="mt-1">{selectedRequest.task_description}</p>
              </div>
              
              <div>
                <strong>Comments:</strong>
                <p className="mt-1">{selectedRequest.comments || 'No comments provided'}</p>
              </div>
              
              <div>
                <strong>Location:</strong>
                <p className="mt-1">{selectedRequest.location_address || 'No location provided'}</p>
              </div>
              
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium">
                  Feedback (Optional)
                </label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for the employee..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectTaskSubmission(selectedRequest?.id)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => approveTaskSubmission(selectedRequest?.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvanceExpenseManagement;
