
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Package, Minus } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  available_quantity: number;
  description?: string;
  is_active: boolean;
}

const InventoryManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isEditingAsset, setIsEditingAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAdjustingQuantity, setIsAdjustingQuantity] = useState(false);
  const [quantityAdjustment, setQuantityAdjustment] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: ''
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive"
      });
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.name.trim() || !newAsset.category.trim()) {
      toast({
        title: "Error",
        description: "Asset name and category are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const quantity = parseInt(newAsset.quantity) || 0;
      const { error } = await supabase
        .from('assets')
        .insert({
          name: newAsset.name,
          category: newAsset.category,
          price: parseFloat(newAsset.price) || 0,
          quantity: quantity,
          available_quantity: quantity,
          description: newAsset.description
        });

      if (error) throw error;

      setNewAsset({ name: '', category: '', price: '', quantity: '', description: '' });
      setIsAddingAsset(false);
      fetchAssets();
      
      toast({
        title: "Asset Added",
        description: "New asset has been added to inventory",
      });
    } catch (error) {
      console.error('Error adding asset:', error);
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive"
      });
    }
  };

  const handleEditAsset = async () => {
    if (!selectedAsset) return;

    try {
      const { error } = await supabase
        .from('assets')
        .update({
          name: newAsset.name,
          category: newAsset.category,
          price: parseFloat(newAsset.price) || 0,
          description: newAsset.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAsset.id);

      if (error) throw error;

      setIsEditingAsset(false);
      setSelectedAsset(null);
      setNewAsset({ name: '', category: '', price: '', quantity: '', description: '' });
      fetchAssets();
      
      toast({
        title: "Asset Updated",
        description: "Asset has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive"
      });
    }
  };

  const handleQuantityAdjustment = async () => {
    if (!selectedAsset || !quantityAdjustment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    const adjustment = parseInt(quantityAdjustment);
    if (isNaN(adjustment) || adjustment <= 0) {
      toast({
        title: "Error",
        description: "Please enter a positive number",
        variant: "destructive"
      });
      return;
    }

    try {
      let newQuantity, newAvailableQuantity;
      
      if (adjustmentType === 'add') {
        newQuantity = selectedAsset.quantity + adjustment;
        newAvailableQuantity = selectedAsset.available_quantity + adjustment;
      } else {
        if (adjustment > selectedAsset.available_quantity) {
          toast({
            title: "Error",
            description: "Cannot remove more items than available",
            variant: "destructive"
          });
          return;
        }
        newQuantity = selectedAsset.quantity - adjustment;
        newAvailableQuantity = selectedAsset.available_quantity - adjustment;
      }

      const { error } = await supabase
        .from('assets')
        .update({
          quantity: newQuantity,
          available_quantity: newAvailableQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAsset.id);

      if (error) throw error;

      setIsAdjustingQuantity(false);
      setSelectedAsset(null);
      setQuantityAdjustment('');
      fetchAssets();
      
      toast({
        title: "Quantity Updated",
        description: `Successfully ${adjustmentType === 'add' ? 'added' : 'removed'} ${adjustment} items`,
      });
    } catch (error) {
      console.error('Error adjusting quantity:', error);
      toast({
        title: "Error",
        description: "Failed to adjust quantity",
        variant: "destructive"
      });
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      fetchAssets();
      toast({
        title: "Asset Deleted",
        description: "Asset has been removed from inventory",
      });
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive"
      });
    }
  };

  const startEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setNewAsset({
      name: asset.name,
      category: asset.category,
      price: asset.price.toString(),
      quantity: asset.quantity.toString(),
      description: asset.description || ''
    });
    setIsEditingAsset(true);
  };

  const startQuantityAdjustment = (asset: Asset, type: 'add' | 'remove') => {
    setSelectedAsset(asset);
    setAdjustmentType(type);
    setQuantityAdjustment('');
    setIsAdjustingQuantity(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Enhanced Inventory Management</h2>
        <Dialog open={isAddingAsset} onOpenChange={setIsAddingAsset}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>Add a new item to the inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assetName">Asset Name *</Label>
                <Input
                  id="assetName"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="Laptop, Phone, etc."
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                  placeholder="Electronics, Tools, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newAsset.price}
                    onChange={(e) => setNewAsset({...newAsset, price: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Initial Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingAsset(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAsset}>
                  Add Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditingAsset} onOpenChange={setIsEditingAsset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update asset information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editAssetName">Asset Name *</Label>
              <Input
                id="editAssetName"
                value={newAsset.name}
                onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editCategory">Category *</Label>
              <Input
                id="editCategory"
                value={newAsset.category}
                onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editPrice">Price (₹)</Label>
              <Input
                id="editPrice"
                type="number"
                value={newAsset.price}
                onChange={(e) => setNewAsset({...newAsset, price: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Input
                id="editDescription"
                value={newAsset.description}
                onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingAsset(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAsset}>
                Update Asset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quantity Adjustment Dialog */}
      <Dialog open={isAdjustingQuantity} onOpenChange={setIsAdjustingQuantity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'add' ? 'Add' : 'Remove'} Inventory
            </DialogTitle>
            <DialogDescription>
              {adjustmentType === 'add' ? 'Add items to' : 'Remove items from'} {selectedAsset?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantityAdjustment">
                Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'}
              </Label>
              <Input
                id="quantityAdjustment"
                type="number"
                value={quantityAdjustment}
                onChange={(e) => setQuantityAdjustment(e.target.value)}
                placeholder="Enter quantity"
                min="1"
              />
              {selectedAsset && adjustmentType === 'remove' && (
                <p className="text-sm text-gray-600 mt-1">
                  Available: {selectedAsset.available_quantity}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdjustingQuantity(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuantityAdjustment}>
                {adjustmentType === 'add' ? 'Add' : 'Remove'} Items
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>Manage asset quantities and information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Total Qty</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>₹{asset.price.toLocaleString()}</TableCell>
                  <TableCell>{asset.quantity}</TableCell>
                  <TableCell>{asset.available_quantity}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      asset.available_quantity === 0 
                        ? 'bg-red-100 text-red-800' 
                        : asset.available_quantity < 5 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {asset.available_quantity === 0 
                        ? 'Out of Stock' 
                        : asset.available_quantity < 5 
                          ? 'Low Stock'
                          : 'In Stock'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startQuantityAdjustment(asset, 'add')}
                        title="Add inventory"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startQuantityAdjustment(asset, 'remove')}
                        disabled={asset.available_quantity === 0}
                        title="Remove inventory"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditAsset(asset)}
                        title="Edit asset"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAsset(asset.id)}
                        title="Delete asset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {assets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assets found. Add your first asset to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
