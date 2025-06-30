
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LeaveRequestFormProps {
  onBack: () => void;
}

const LeaveRequestForm = ({ onBack }: LeaveRequestFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Leave request submitted:', {
      ...formData,
      employeeId: user?.id,
      appliedDate: new Date(),
      status: 'pending'
    });
    alert('Leave request submitted successfully!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Request Leave</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Leave Type</Label>
              <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="earned">Earned Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide reason for leave..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Submit Leave Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequestForm;
