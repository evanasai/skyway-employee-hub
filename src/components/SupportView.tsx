
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Phone, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SupportViewProps {
  onBack: () => void;
}

const SupportView = ({ onBack }: SupportViewProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request submitted:', {
      ...formData,
      employeeId: user?.id,
      submittedAt: new Date(),
      status: 'open'
    });
    alert('Support request submitted successfully! We will get back to you soon.');
    setFormData({ category: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Help & Support</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <Phone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Call Support</h3>
              <p className="text-sm text-muted-foreground">+91 9876543210</p>
            </Card>
            <Card className="text-center p-4">
              <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@skyway.com</p>
            </Card>
            <Card className="text-center p-4">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">+91 9876543210</p>
            </Card>
          </div>

          {/* Support Request Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Support Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="account">Account Related</SelectItem>
                      <SelectItem value="attendance">Attendance Issue</SelectItem>
                      <SelectItem value="payroll">Payroll Query</SelectItem>
                      <SelectItem value="equipment">Equipment Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Detailed Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide detailed information about your issue..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={5}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Submit Support Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportView;
