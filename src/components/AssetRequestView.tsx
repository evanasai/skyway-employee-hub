
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AssetRequestViewProps {
  onBack: () => void;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  price: number;
  available_quantity: number;
}

interface AssetRequest {
  id: string;
  quantity: number;
  reason: string;
  status: string;
  request_date: string;
  total_amount: number;
  payment_type: string;
  asset: Asset;
}

const AssetRequestView = ({ onBack }: AssetRequestViewProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [formData, setFormData] = useState({
    asset_id: '',
    quantity: '1',
    reason: '',
    payment_type: 'one_time_deduction'
  });

  useEffect(() => {
    fetchAssetRequests();
    fetchAssets();
  }, [user]);

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
    }
  };

  const fetchAssetRequests = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { data, error } = await supabase
          .from('asset_requests')
          .select(`
            *,
            asset:assets(name, category, price)
          `)
          .eq('employee_id', employee.id)
          .order('request_date', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching asset requests:', error);
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

      const selectedAsset = assets.find(a => a.id === formData.asset_id);
      if (!selectedAsset) return;

      const totalAmount = selectedAsset.price * parseInt(formData.quantity);

      if (employee) {
        const { error } = await supabase
          .from('asset_requests')
          .insert([{
            employee_id: employee.id,
            asset_id: formData.asset_id,
            quantity: parseInt(formData.quantity),
            reason: formData.reason,
            payment_type: formData.payment_type,
            total_amount: totalAmount
          }]);

        if (error) throw error;

        toast({
          title: "Asset Request Submitted",
          description: "Your asset request has been submitted for approval.",
        });

        setFormData({ asset_id: '', quantity: '1', reason: '', payment_type: 'one_time_deduction' });
        setShowForm(false);
        fetchAssetRequests();
      }
    } catch (error) {
      console.error('Error submitting asset request:', error);
      toast({
        title: "Error",
        description: "Failed to submit asset request.",
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

  const selectedAsset = assets.find(a => a.id === formData.asset_id);
  const totalAmount = selectedAsset ? selectedAsset.price * parseInt(formData.quantity || '1') : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Asset Requests</h2>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="asset_id">Asset</Label>
                <Select value={formData.asset_id} onValueChange={(value) => setFormData({...formData, asset_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} - ₹{asset.price} ({asset.available_quantity} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  min="1"
                  max={selectedAsset?.available_quantity || 1}
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select value={formData.payment_type} onValueChange={(value) => setFormData({...formData, payment_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time_deduction">One Time Deduction</SelectItem>
                    <SelectItem value="emi">EMI (Monthly Installments)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {totalAmount > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Total Amount: ₹{totalAmount}</p>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Please provide reason for asset request"
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
                    <Package className="h-4 w-4" />
                    <h3 className="font-semibold">{request.asset?.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Quantity: {request.quantity} | Total: ₹{request.total_amount}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Payment: {request.payment_type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                  <p className="text-xs text-gray-500">
                    Requested: {new Date(request.request_date).toLocaleDateString()}
                  </p>
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
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No asset requests found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetRequestView;
