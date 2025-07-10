
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdvanceRequestFormProps {
  onBack: () => void;
}

const AdvanceRequestForm = ({ onBack }: AdvanceRequestFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (!employee) {
        throw new Error('Employee record not found');
      }

      const { error } = await supabase
        .from('advance_requests')
        .insert({
          employee_id: employee.id,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          status: 'pending',
          supervisor_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your advance request has been submitted successfully",
      });
      
      onBack();
    } catch (error) {
      console.error('Error submitting advance request:', error);
      toast({
        title: "Error",
        description: "Failed to submit advance request",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Request Salary Advance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide reason for advance..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Submit Advance Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvanceRequestForm;
