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
  radius: number;
  center_lat: number;
  center_lng: number;
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
    center_lat: '',
    center_lng: '',
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

  const generateCircleCoordinates = (centerLat: number, centerLng: number, radiusMeters: number) => {
    const points = [];
    const earthRadius = 6371000; // Earth's radius in meters
    const numberOfPoints = 20;

    for (let i = 0; i < numberOfPoints; i++) {
      const angle = (i * 2 * Math.PI) / numberOfPoints;
      const deltaLat = (radiusMeters * Math.cos(angle)) / earthRadius * (180 / Math.PI);
      const deltaLng = (radiusMeters * Math.sin(angle)) / (earthRadius * Math.cos(centerLat * Math.PI / 180)) * (180 / Math.PI);
      
      points.push({
        lat: centerLat + deltaLat,
        lng: centerLng + deltaLng
      });
    }
    
    return points;
  };

  const createZone = async () => {
    if (!formData.name.trim() || !formData.center_lat || !formData.center_lng) {
      toast({
        title: "Missing Information",
        description: "Zone name, latitude, and longitude are required",
        variant: "destructive"
      });
      return;
    }

    const lat = parseFloat(formData.center_lat);
    const lng = parseFloat(formData.center_lng);
    const radius = parseFloat(formData.radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      toast({
        title: "Invalid Data",
        description: "Please enter valid numbers for coordinates and radius",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate circular coordinates based on center and radius
      const coordinates = generateCircleCoordinates(lat, lng, radius);
      
      const { error } = await supabase
        .from('zones')
        .insert({
          name: formData.name,
          center_lat: lat,
          center_lng: lng,
          radius: radius,
          coordinates: coordinates
        });

      if (error) throw error;

      fetchZones();
      resetForm();
      
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

    const lat = parseFloat(formData.center_lat);
    const lng = parseFloat(formData.center_lng);
    const radius = parseFloat(formData.radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      toast({
        title: "Invalid Data",
        description: "Please enter valid numbers for coordinates and radius",
        variant: "destructive"
      });
      return;
    }

    try {
      const coordinates = generateCircleCoordinates(lat, lng, radius);
      
      const { error } = await supabase
        .from('zones')
        .update({
          name: formData.name,
          center_lat: lat,
          center_lng: lng,
          radius: radius,
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
      center_lat: zone.center_lat?.toString() || '',
      center_lng: zone.center_lng?.toString() || '',
      radius: zone.radius?.toString() || '100'
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingZone(null);
    setFormData({
      name: '',
      center_lat: '',
      center_lng: '',
      radius: '100'
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
            Create and manage geographical zones with geofencing for employee assignments
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
                  <Label htmlFor="center_lat">Center Latitude</Label>
                  <Input
                    id="center_lat"
                    type="number"
                    step="any"
                    value={formData.center_lat}
                    onChange={(e) => setFormData({...formData, center_lat: e.target.value})}
                    placeholder="12.9716"
                  />
                </div>
                <div>
                  <Label htmlFor="center_lng">Center Longitude</Label>
                  <Input
                    id="center_lng"
                    type="number"
                    step="any"
                    value={formData.center_lng}
                    onChange={(e) => setFormData({...formData, center_lng: e.target.value})}
                    placeholder="77.5946"
                  />
                </div>
                <div>
                  <Label htmlFor="radius">Radius (meters)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.radius}
                    onChange={(e) => setFormData({...formData, radius: e.target.value})}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={editingZone ? updateZone : createZone}>
                  <Plus className="h-4 w-4 mr-2" />
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
                          Center: {zone.center_lat?.toFixed(6)}, {zone.center_lng?.toFixed(6)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Radius: {zone.radius}m • Created: {new Date(zone.created_at).toLocaleDateString()}
                        </p>
                        <Badge variant={zone.is_active ? "default" : "secondary"}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </Badge>
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