import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Building, Package, ClipboardList } from 'lucide-react';

const SuperAdminDataManagement = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [departmentForm, setDepartmentForm] = useState({ name: '' });
  const [assetForm, setAssetForm] = useState({ 
    name: '', 
    category: '', 
    description: '', 
    price: '', 
    quantity: '' 
  });
  const [taskForm, setTaskForm] = useState({ 
    name: '', 
    description: '' 
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchDepartments(),
      fetchAssets(),
      fetchTasks()
    ]);
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('name');
      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('name');
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createDepartment = async () => {
    if (!departmentForm.name.trim()) {
      toast({ title: "Error", description: "Department name is required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('departments')
        .insert({ name: departmentForm.name });
      
      if (error) throw error;
      
      setDepartmentForm({ name: '' });
      fetchDepartments();
      toast({ title: "Success", description: "Department created successfully" });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({ title: "Error", description: "Failed to create department", variant: "destructive" });
    }
  };

  const createAsset = async () => {
    if (!assetForm.name.trim() || !assetForm.category.trim()) {
      toast({ title: "Error", description: "Asset name and category are required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          name: assetForm.name,
          category: assetForm.category,
          description: assetForm.description,
          price: parseFloat(assetForm.price) || 0,
          quantity: parseInt(assetForm.quantity) || 0,
          available_quantity: parseInt(assetForm.quantity) || 0
        });
      
      if (error) throw error;
      
      setAssetForm({ name: '', category: '', description: '', price: '', quantity: '' });
      fetchAssets();
      toast({ title: "Success", description: "Asset created successfully" });
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({ title: "Error", description: "Failed to create asset", variant: "destructive" });
    }
  };

  const createTask = async () => {
    if (!taskForm.name.trim()) {
      toast({ title: "Error", description: "Task name is required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          name: taskForm.name,
          description: taskForm.description
        });
      
      if (error) throw error;
      
      setTaskForm({ name: '', description: '' });
      fetchTasks();
      toast({ title: "Success", description: "Task created successfully" });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchDepartments();
      toast({ title: "Success", description: "Department deleted successfully" });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({ title: "Error", description: "Failed to delete department", variant: "destructive" });
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchAssets();
      toast({ title: "Success", description: "Asset deleted successfully" });
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({ title: "Error", description: "Failed to delete asset", variant: "destructive" });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchTasks();
      toast({ title: "Success", description: "Task deleted successfully" });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Super Admin Data Management</CardTitle>
          <CardDescription>
            Manage core system data: departments, assets, and tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="departments">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="departments">
                <Building className="h-4 w-4 mr-2" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="assets">
                <Package className="h-4 w-4 mr-2" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ClipboardList className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="departments" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dept-name">Department Name</Label>
                  <Input
                    id="dept-name"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm({ name: e.target.value })}
                    placeholder="Enter department name"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createDepartment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Existing Departments ({departments.length})</h4>
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{dept.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDepartment(dept.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="asset-name">Asset Name</Label>
                  <Input
                    id="asset-name"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    placeholder="Enter asset name"
                  />
                </div>
                <div>
                  <Label htmlFor="asset-category">Category</Label>
                  <Input
                    id="asset-category"
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>
                <div>
                  <Label htmlFor="asset-price">Price</Label>
                  <Input
                    id="asset-price"
                    type="number"
                    value={assetForm.price}
                    onChange={(e) => setAssetForm({ ...assetForm, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <Label htmlFor="asset-quantity">Quantity</Label>
                  <Input
                    id="asset-quantity"
                    type="number"
                    value={assetForm.quantity}
                    onChange={(e) => setAssetForm({ ...assetForm, quantity: e.target.value })}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="asset-description">Description</Label>
                  <Input
                    id="asset-description"
                    value={assetForm.description}
                    onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={createAsset}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Existing Assets ({assets.length})</h4>
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{asset.name}</span>
                      <span className="text-sm text-gray-600 ml-2">({asset.category})</span>
                      <Badge variant="outline" className="ml-2">₹{asset.price}</Badge>
                      <Badge variant="secondary" className="ml-2">Qty: {asset.quantity}</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAsset(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input
                    id="task-name"
                    value={taskForm.name}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    placeholder="Enter task name"
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Input
                    id="task-description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={createTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Existing Tasks ({tasks.length})</h4>
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{task.name}</span>
                      {task.description && (
                        <span className="text-sm text-gray-600 ml-2">- {task.description}</span>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDataManagement;