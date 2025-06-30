
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AssetRequestFormProps {
  onBack: () => void;
}

const AssetRequestForm = ({ onBack }: AssetRequestFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assetType: '',
    quantity: '',
    reason: ''
  });

  const assets = [
    'Fiber Splicing Kit',
    'ONT Device',
    'Ethernet Cable',
    'Power Drill',
    'Safety Equipment',
    'Testing Equipment',
    'Other Tools'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Asset request submitted:', {
      ...formData,
      quantity: Number(formData.quantity),
      employeeId: user?.id,
      requestDate: new Date(),
      status: 'pending'
    });
    alert('Asset request submitted successfully!');
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
            <CardTitle>Request Assets</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="assetType">Asset Type</Label>
              <Select onValueChange={(value) => setFormData({...formData, assetType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide reason for asset request..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Submit Asset Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetRequestForm;
