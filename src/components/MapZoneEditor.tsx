
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Save, X, ZoomIn, ZoomOut, MapPin } from 'lucide-react';
import { Zone } from '@/types/database';

interface MapZoneEditorProps {
  onBack?: () => void;
}

const isValidCoordinates = (coordinates: any): coordinates is { lat: number; lng: number }[] => {
  return Array.isArray(coordinates) && 
    coordinates.every(coord => 
      typeof coord === 'object' && 
      coord !== null && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number'
    );
};

const MapZoneEditor: React.FC<MapZoneEditorProps> = ({ onBack }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
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
      
      const zonesWithValidCoordinates: Zone[] = (data || []).map(zone => ({
        ...zone,
        coordinates: isValidCoordinates(zone.coordinates) ? zone.coordinates : []
      }));
      
      setZones(zonesWithValidCoordinates);
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
    
    const lat = mapCenter.lat + ((y - rect.height/2) / rect.height) * (0.01 / mapZoom);
    const lng = mapCenter.lng + ((x - rect.width/2) / rect.width) * (0.01 / mapZoom);
    
    const newPoint = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
    
    if (selectedPoints.length < 10) {
      setSelectedPoints([...selectedPoints, newPoint]);
    } else {
      toast({
        title: "Maximum Points Reached",
        description: "You can only select 10 points to form a zone",
        variant: "destructive"
      });
    }
  };

  const addManualCoordinate = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid latitude and longitude values",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedPoints.length < 10) {
      setSelectedPoints([...selectedPoints, { lat, lng }]);
      setManualLat('');
      setManualLng('');
    }
  };

  const removePoint = (index: number) => {
    setSelectedPoints(selectedPoints.filter((_, i) => i !== index));
  };

  const zoomIn = () => {
    setMapZoom(Math.min(mapZoom * 1.5, 10));
  };

  const zoomOut = () => {
    setMapZoom(Math.max(mapZoom / 1.5, 0.5));
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
          <CardTitle>Enhanced Zone Management</CardTitle>
          <CardDescription>
            Create and manage geofenced zones with interactive map and coordinate input
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Interactive Map</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={zoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={zoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600 flex items-center">
                        Zoom: {mapZoom.toFixed(1)}x
                      </span>
                    </div>
                    <div
                      ref={mapRef}
                      className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair relative bg-green-50 overflow-hidden"
                      onClick={handleMapClick}
                      style={{
                        backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
                        backgroundSize: `${20 * mapZoom}px ${20 * mapZoom}px`,
                        backgroundPosition: '50% 50%'
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <div>Click to add zone points ({selectedPoints.length}/10)</div>
                          <div className="text-xs">Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</div>
                        </div>
                      </div>
                      {selectedPoints.map((point, index) => {
                        const rect = mapRef.current?.getBoundingClientRect();
                        if (!rect) return null;
                        
                        const x = ((point.lng - mapCenter.lng) / (0.01 / mapZoom)) * rect.width + rect.width/2;
                        const y = ((point.lat - mapCenter.lat) / (0.01 / mapZoom)) * rect.height + rect.height/2;
                        
                        return (
                          <div
                            key={index}
                            className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-600"
                            style={{
                              left: `${Math.max(0, Math.min(100, (x / rect.width) * 100))}%`,
                              top: `${Math.max(0, Math.min(100, (y / rect.height) * 100))}%`
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removePoint(index);
                            }}
                            title={`Point ${index + 1}: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)} (Click to remove)`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Manual Coordinate Entry</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Latitude"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        type="number"
                        step="0.000001"
                      />
                      <Input
                        placeholder="Longitude"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        type="number"
                        step="0.000001"
                      />
                    </div>
                    <Button size="sm" onClick={addManualCoordinate} className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Coordinate
                    </Button>
                  </div>

                  <div>
                    <Label>Selected Coordinates ({selectedPoints.length})</Label>
                    <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2 bg-white">
                      {selectedPoints.length === 0 ? (
                        <p className="text-sm text-gray-500">No coordinates selected</p>
                      ) : (
                        selectedPoints.map((point, index) => (
                          <div key={index} className="flex justify-between items-center text-sm p-1 bg-gray-50 rounded">
                            <span>{index + 1}. {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removePoint(index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
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

          {!isCreating && !editingZone && (
            <Button onClick={startCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Zone
            </Button>
          )}

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
                          {zone.coordinates.length} coordinates • 
                          {zone.is_active ? ' Active' : ' Inactive'}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          Area: {zone.coordinates.map((coord, i) => 
                            `${i + 1}:(${coord.lat.toFixed(4)},${coord.lng.toFixed(4)})`
                          ).join(' ')}
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

export default MapZoneEditor;
