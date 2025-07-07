import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Zone, parseCoordinates } from '@/types/zone';

const SimpleZoneEditor = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100'
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
      
      // Parse coordinates from Json to Coordinate[] format
      const parsedZones: Zone[] = (data || []).map(zone => ({
        ...zone,
        coordinates: parseCoordinates(zone.coordinates)
      }));
      
      setZones(parsedZones);
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
    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast({
        title: "Missing Information",
        description: "Name, latitude, and longitude are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      const radius = parseFloat(formData.radius);

      // Create a circular zone with center point and radius
      const coordinates = [];
      const numPoints = 20;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints;
        const latOffset = (radius / 111000) * Math.cos(angle); // ~111km per degree
        const lngOffset = (radius / (111000 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
        coordinates.push({
          lat: lat + latOffset,
          lng: lng + lngOffset
        });
      }

      const { error } = await supabase
        .from('zones')
        .insert({
          name: formData.name,
          coordinates: coordinates,
          is_active: true
        });

      if (error) throw error;

      resetForm();
      fetchZones();
      
      toast({
        title: "Zone Created",
        description: "New zone has been added successfully",
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
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      const radius = parseFloat(formData.radius);

      // Create a circular zone with center point and radius
      const coordinates = [];
      const numPoints = 20;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints;
        const latOffset = (radius / 111000) * Math.cos(angle);
        const lngOffset = (radius / (111000 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
        coordinates.push({
          lat: lat + latOffset,
          lng: lng + lngOffset
        });
      }

      const { error } = await supabase
        .from('zones')
        .update({
          name: formData.name,
          coordinates: coordinates,
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
        description: "Zone has been removed successfully",
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
    // Calculate center point from coordinates
    if (zone.coordinates && zone.coordinates.length > 0) {
      const centerLat = zone.coordinates.reduce((sum, coord) => sum + coord.lat, 0) / zone.coordinates.length;
      const centerLng = zone.coordinates.reduce((sum, coord) => sum + coord.lng, 0) / zone.coordinates.length;
      setFormData({
        name: zone.name,
        latitude: centerLat.toFixed(6),
        longitude: centerLng.toFixed(6),
        radius: '100'
      });
    } else {
      setFormData({
        name: zone.name,
        latitude: '',
        longitude: '',
        radius: '100'
      });
    }
    setIsCreating(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingZone(null);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '100'
    });
  };

  const openInGoogleMaps = (zone: Zone) => {
    if (zone.coordinates && zone.coordinates.length > 0) {
      const centerLat = zone.coordinates.reduce((sum, coord) => sum + coord.lat, 0) / zone.coordinates.length;
      const centerLng = zone.coordinates.reduce((sum, coord) => sum + coord.lng, 0) / zone.coordinates.length;
      const url = `https://www.google.com/maps?q=${centerLat},${centerLng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zone Management</CardTitle>
          <CardDescription>
            Create and manage work zones with coordinates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(isCreating || editingZone) && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="radius">Radius (meters)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.radius}
                    onChange={(e) => setFormData({...formData, radius: e.target.value})}
                    placeholder="Enter radius in meters"
                  />
                </div>
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    placeholder="Enter latitude (e.g., 17.4065)"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    placeholder="Enter longitude (e.g., 78.4772)"
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
                          Points: {zone.coordinates?.length || 0} • 
                          Status: {zone.is_active ? 'Active' : 'Inactive'}
                        </p>
                        {zone.coordinates && zone.coordinates.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Center: {(zone.coordinates.reduce((sum, coord) => sum + coord.lat, 0) / zone.coordinates.length).toFixed(4)}, {(zone.coordinates.reduce((sum, coord) => sum + coord.lng, 0) / zone.coordinates.length).toFixed(4)}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openInGoogleMaps(zone)}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
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

export default SimpleZoneEditor;
