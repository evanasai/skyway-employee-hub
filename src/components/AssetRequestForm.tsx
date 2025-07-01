
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Asset } from '@/types/database';

interface AssetRequestFormProps {
  onBack: () => void;
}

const AssetRequestForm = ({ onBack }: AssetRequestFormProps) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    assetId: '',
    quantity: 1,
    reason: '',
    paymentType: 'one_time_deduction' as 'one_time_deduction' | 'emi_plan',
    emiMonths: 1
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('is_active', true)
        .gt('available_quantity', 0);

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive"
      });
    }
  };

  const handleAssetSelect = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    setSelectedAsset(asset || null);
    setFormData({ ...formData, assetId });
  };

  const calculateTotalAmount = () => {
    if (!selectedAsset) return 0;
    return selectedAsset.price * formData.quantity;
  };

  const calculateMonthlyEMI = () => {
    if (formData.paymentType === 'one_time_deduction') return 0;
    return calculateTotalAmount() / formData.emiMonths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAsset) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (!employee) throw new Error('Employee not found');

      const totalAmount = calculateTotalAmount();
      const monthlyEmi = calculateMonthlyEMI();

      const { error } = await supabase
        .from('asset_requests')
        .insert({
          employee_id: employee.id,
          asset_id: formData.assetId,
          quantity: formData.quantity,
          reason: formData.reason,
          payment_type: formData.paymentType,
          emi_months: formData.emiMonths,
          monthly_emi: monthlyEmi,
          total_amount: totalAmount
        });

      if (error) throw error;

      toast({
        title: "Asset Request Submitted",
        description: "Your request has been submitted for approval",
      });
      onBack();
    } catch (error) {
      console.error('Error submitting asset request:', error);
      toast({
        title: "Error",
        description: "Failed to submit asset request",
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
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Request Asset</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="asset">Select Asset</Label>
              <Select onValueChange={handleAssetSelect} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-sm text-gray-500">
                          ₹{asset.price.toLocaleString()} - {asset.available_quantity} available
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAsset && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold">{selectedAsset.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedAsset.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price: </span>
                      <span>₹{selectedAsset.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Category: </span>
                      <span>{selectedAsset.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Available: </span>
                      <span>{selectedAsset.available_quantity} units</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedAsset?.available_quantity || 1}
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                required
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason for Request</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you need this asset..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select 
                value={formData.paymentType} 
                onValueChange={(value: 'one_time_deduction' | 'emi_plan') => 
                  setFormData({...formData, paymentType: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time_deduction">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>One-time Salary Deduction</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="emi_plan">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>EMI Plan</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.paymentType === 'emi_plan' && (
              <div>
                <Label htmlFor="emiMonths">EMI Duration (Months)</Label>
                <Select 
                  value={formData.emiMonths.toString()} 
                  onValueChange={(value) => setFormData({...formData, emiMonths: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 6, 12].map(months => (
                      <SelectItem key={months} value={months.toString()}>
                        {months} {months === 1 ? 'month' : 'months'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAsset && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">₹{calculateTotalAmount().toLocaleString()}</span>
                    </div>
                    {formData.paymentType === 'emi_plan' && (
                      <div className="flex justify-between">
                        <span>Monthly EMI:</span>
                        <span className="font-medium">₹{calculateMonthlyEMI().toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={!selectedAsset}>
              Submit Asset Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetRequestForm;
