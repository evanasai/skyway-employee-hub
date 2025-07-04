import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { Zone } from '@/types/database';

interface ZoneEditorProps {
  onBack?: () => void;
}

const ZoneEditor: React.FC<ZoneEditorProps> = ({ onBack }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<{ lat: number; lng: number }[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

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

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isCreating && !editingZone) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng (mock implementation)
    // In a real app, you'd use a proper mapping library like Google Maps or Leaflet
    const lat = 28.6139 + (y / rect.height) * 0.002;
    const lng = 77.2090 + (x / rect.width) * 0.002;
    
    const newPoint = { lat, lng };
    
    if (selectedPoints.length < 4) {
      setSelectedPoints([...selectedPoints, newPoint]);
    } else {
      toast({
        title: "Maximum Points Reached",
        description: "You can only select 4 points to form a zone",
        variant: "destructive"
      });
    }
  };

  const createZone = async () => {
    if (!newZoneName.trim() || selectedPoints.length < 3) {
      toast({
        title: "Invalid Zone",
        description: "Zone name is required and at least 3 points must be selected",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('zones')
        .insert({
          name: newZoneName,
          coordinates: selectedPoints
        });

      if (error) throw error;

      setIsCreating(false);
      setNewZoneName('');
      setSelectedPoints([]);
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
    if (!editingZone || !newZoneName.trim() || selectedPoints.length < 3) {
      toast({
        title: "Invalid Zone",
        description: "Zone name is required and at least 3 points must be selected",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('zones')
        .update({
          name: newZoneName,
          coordinates: selectedPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingZone.id);

      if (error) throw error;

      setEditingZone(null);
      setNewZoneName('');
      setSelectedPoints([]);
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
    setNewZoneName(zone.name);
    setSelectedPoints(zone.coordinates);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setIsCreating(false);
    setEditingZone(null);
    setNewZoneName('');
    setSelectedPoints([]);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingZone(null);
    setNewZoneName('');
    setSelectedPoints([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zone Management</CardTitle>
          <CardDescription>
            Create and manage geofenced zones for employee check-ins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zone Creation/Editing Form */}
          {(isCreating || editingZone) && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="zoneName">Zone Name</Label>
                <Input
                  id="zoneName"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Enter zone name"
                />
              </div>
              
              <div>
                <Label>Zone Area (Click to add points - max 4)</Label>
                <div
                  ref={mapRef}
                  className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair relative bg-green-50"
                  onClick={handleMapClick}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Click to add zone points ({selectedPoints.length}/4)
                  </div>
                  {selectedPoints.map((point, index) => (
                    <div
                      key={index}
                      className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${((point.lng - 77.2090) / 0.002) * 100}%`,
                        top: `${((point.lat - 28.6139) / 0.002) * 100}%`
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Selected points: {selectedPoints.length}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={editingZone ? updateZone : createZone}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Create New Zone Button */}
          {!isCreating && !editingZone && (
            <Button onClick={startCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Zone
            </Button>
          )}

          {/* Existing Zones List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Zones</h3>
            {zones.length === 0 ? (
              <p className="text-gray-500">No zones created yet</p>
            ) : (
              zones.map((zone) => (
                <Card key={zone.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{zone.name}</h4>
                        <p className="text-sm text-gray-600">
                          {zone.coordinates.length} points • 
                          {zone.is_active ? ' Active' : ' Inactive'}
                        </p>
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

export default ZoneEditor;
