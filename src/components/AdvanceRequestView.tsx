
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdvanceRequestViewProps {
  onBack: () => void;
}

interface AdvanceRequest {
  id: string;
  amount: number;
  reason: string;
  status: string;
  request_date: string;
  approved_date: string | null;
}

const AdvanceRequestView = ({ onBack }: AdvanceRequestViewProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    reason: ''
  });

  useEffect(() => {
    fetchAdvanceRequests();
  }, [user]);

  const fetchAdvanceRequests = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { data, error } = await supabase
          .from('advance_requests')
          .select('*')
          .eq('employee_id', employee.id)
          .order('request_date', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching advance requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { error } = await supabase
          .from('advance_requests')
          .insert([{
            employee_id: employee.id,
            amount: parseFloat(formData.amount),
            reason: formData.reason
          }]);

        if (error) throw error;

        toast({
          title: "Advance Request Submitted",
          description: "Your advance request has been submitted for approval.",
        });

        setFormData({ amount: '', reason: '' });
        setShowForm(false);
        fetchAdvanceRequests();
      }
    } catch (error) {
      console.error('Error submitting advance request:', error);
      toast({
        title: "Error",
        description: "Failed to submit advance request.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Advance Requests</h2>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Advance</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter advance amount"
                  required
                  min="1"
                  step="1"
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Please provide reason for advance request"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Submit Request</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <h3 className="font-semibold">₹{request.amount}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                  <p className="text-xs text-gray-500">
                    Requested: {new Date(request.request_date).toLocaleDateString()}
                  </p>
                  {request.approved_date && (
                    <p className="text-xs text-gray-500">
                      Approved: {new Date(request.approved_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-medium capitalize ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No advance requests found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvanceRequestView;
