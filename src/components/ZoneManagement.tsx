
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  coordinates: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ZoneManagement = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    coordinates: '[]'
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast({
        title: "Error",
        description: "Failed to fetch zones",
        variant: "destructive"
      });
    }
  };

  const createZone = async () => {
    if (!formData.name) {
      toast({
        title: "Missing Information",
        description: "Zone name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('zones')
        .insert({
          name: formData.name,
          coordinates: JSON.parse(formData.coordinates || '[]'),
          is_active: true
        });

      if (error) throw error;
      
      resetForm();
      fetchZones();
      
      toast({
        title: "Zone Created",
        description: "New zone has been created successfully",
      });
    } catch (error) {
      console.error('Error creating zone:', error);
      toast({
        title: "Error",
        description: "Failed to create zone",
        variant: "destructive"
      });
    }
  };

  const updateZone = async () => {
    if (!editingZone) return;

    try {
      const { error } = await supabase
        .from('zones')
        .update({
          name: formData.name,
          coordinates: JSON.parse(formData.coordinates || '[]'),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingZone.id);

      if (error) throw error;

      resetForm();
      fetchZones();
      
      toast({
        title: "Zone Updated",
        description: "Zone has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating zone:', error);
      toast({
        title: "Error",
        description: "Failed to update zone",
        variant: "destructive"
      });
    }
  };

  const deleteZone = async (zoneId: string) => {
    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      fetchZones();
      toast({
        title: "Zone Deleted",
        description: "Zone has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast({
        title: "Error",
        description: "Failed to delete zone",
        variant: "destructive"
      });
    }
  };

  const startEditing = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      coordinates: JSON.stringify(zone.coordinates)
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingZone(null);
    setFormData({
      name: '',
      coordinates: '[]'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Zone Management</span>
          </CardTitle>
          <CardDescription>
            Create and manage geographical zones for employee assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(isCreating || editingZone) && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Zone Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter zone name"
                  />
                </div>
                <div>
                  <Label htmlFor="coordinates">Coordinates (JSON)</Label>
                  <Input
                    id="coordinates"
                    value={formData.coordinates}
                    onChange={(e) => setFormData({...formData, coordinates: e.target.value})}
                    placeholder="[{&quot;lat&quot;: 0, &quot;lng&quot;: 0}]"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={editingZone ? updateZone : createZone}>
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isCreating && !editingZone && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Zone
            </Button>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Zones ({zones.length})</h3>
            {zones.length === 0 ? (
              <p className="text-gray-500">No zones found</p>
            ) : (
              zones.map((zone) => (
                <Card key={zone.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{zone.name}</h4>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(zone.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={zone.is_active ? "default" : "secondary"}>
                            {zone.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(zone)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteZone(zone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZoneManagement;
