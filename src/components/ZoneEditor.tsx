import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Zone {
  id?: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  is_active: boolean;
  created_at?: string;
}

const ZoneEditor = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentZone, setCurrentZone] = useState<Zone>({
    name: '',
    coordinates: [],
    is_active: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error loading zones:', error);
      toast({
        title: "Error Loading Zones",
        description: "Failed to load zones from database",
        variant: "destructive"
      });
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoordinate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setCurrentZone(prev => ({
          ...prev,
          coordinates: [...prev.coordinates, newCoordinate]
        }));
        
        toast({
          title: "Location Added",
          description: `Added point: ${newCoordinate.lat.toFixed(6)}, ${newCoordinate.lng.toFixed(6)}`,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Location Error",
          description: "Please enable location access to add coordinates",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true }
    );
  };

  const removeCoordinate = (index: number) => {
    setCurrentZone(prev => ({
      ...prev,
      coordinates: prev.coordinates.filter((_, i) => i !== index)
    }));
  };

  const saveZone = async () => {
    if (!currentZone.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a zone name",
        variant: "destructive"
      });
      return;
    }

    if (currentZone.coordinates.length < 3) {
      toast({
        title: "Validation Error",
        description: "Please add at least 3 coordinates to create a zone",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing zone
        const { error } = await supabase
          .from('zones')
          .update({
            name: currentZone.name,
            coordinates: currentZone.coordinates,
            is_active: currentZone.is_active
          })
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Zone Updated",
          description: "Zone has been updated successfully",
        });
      } else {
        // Create new zone
        const { error } = await supabase
          .from('zones')
          .insert({
            name: currentZone.name,
            coordinates: currentZone.coordinates,
            is_active: currentZone.is_active
          });

        if (error) throw error;
        
        toast({
          title: "Zone Created",
          description: "New zone has been created successfully",
        });
      }

      // Reset form
      setCurrentZone({ name: '', coordinates: [], is_active: true });
      setIsEditing(false);
      setEditingId(null);
      loadZones();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast({
        title: "Save Error",
        description: "Failed to save zone",
        variant: "destructive"
      });
    }
  };

  const editZone = (zone: Zone) => {
    setCurrentZone(zone);
    setIsEditing(true);
    setEditingId(zone.id || null);
  };

  const deleteZone = async (id: string) => {
    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Zone Deleted",
        description: "Zone has been deleted successfully",
      });
      
      loadZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete zone",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setCurrentZone({ name: '', coordinates: [], is_active: true });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Zone Management</h2>
      </div>

      {/* Zone Creation/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Zone' : 'Create New Zone'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="zoneName">Zone Name</Label>
            <Input
              id="zoneName"
              value={currentZone.name}
              onChange={(e) => setCurrentZone(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter zone name"
            />
          </div>

          <div>
            <Label>Zone Coordinates ({currentZone.coordinates.length} points)</Label>
            <div className="space-y-2 mt-2">
              {currentZone.coordinates.map((coord, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">
                    Point {index + 1}: {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCoordinate(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Add Current Location
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={saveZone} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Zone' : 'Create Zone'}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No zones created yet</p>
            ) : (
              zones.map((zone) => (
                <div key={zone.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{zone.name}</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editZone(zone)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteZone(zone.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{zone.coordinates.length} coordinates</p>
                    <p>Status: {zone.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZoneEditor;
