
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Zone, Coordinate } from '@/types/zone';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useZones } from '@/hooks/useZones';
import MapSearchBar from './MapSearchBar';
import ZoneCreationForm from './ZoneCreationForm';
import ZonesList from './ZonesList';

interface GoogleMapsZoneEditorProps {
  onBack?: () => void;
}

const GoogleMapsZoneEditor: React.FC<GoogleMapsZoneEditorProps> = ({ onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<Coordinate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyBAie22cBjs6pcoxMyYvbT03GGcwJ1O9fw';

  const {
    mapRef,
    mapInstanceRef,
    markersRef,
    initializeMap,
    clearMapElements,
    updatePolygon,
    addMarker,
    loadExistingZones
  } = useGoogleMaps(GOOGLE_MAPS_API_KEY);

  const { zones, fetchZones, createZone, updateZone, deleteZone } = useZones();

  useEffect(() => {
    fetchZones();
    getCurrentLocation();
  }, [fetchZones]);

  useEffect(() => {
    if (userLocation) {
      initializeGoogleMaps();
    }
  }, [userLocation]);

  useEffect(() => {
    if (mapInstanceRef.current && zones.length > 0 && !isCreating && !editingZone) {
      loadExistingZones(zones);
    }
  }, [zones, loadExistingZones, isCreating, editingZone]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, defaulting to Hyderabad:', error);
          // Default to Hyderabad city center
          setUserLocation({ lat: 17.3850, lng: 78.4867 });
        }
      );
    } else {
      // Default to Hyderabad city center
      setUserLocation({ lat: 17.3850, lng: 78.4867 });
    }
  };

  const initializeGoogleMaps = async () => {
    try {
      await initializeMap(userLocation, handleMapClick, searchInputRef);
      toast({
        title: "Map Loaded",
        description: "Google Maps has been successfully loaded",
      });
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Loading Error",
        description: "Failed to load Google Maps. Please check your internet connection.",
        variant: "destructive"
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked at:', lat, lng);
    
    if (!isCreating && !editingZone) {
      toast({
        title: "Create Zone First",
        description: "Click 'Create New Zone' to start adding points",
        variant: "destructive"
      });
      return;
    }

    if (selectedPoints.length >= 10) {
      toast({
        title: "Maximum Points Reached",
        description: "You can only select up to 10 points per zone",
        variant: "destructive"
      });
      return;
    }

    addPointToZone(lat, lng);
  };

  const addPointToZone = (lat: number, lng: number) => {
    const newPoint: Coordinate = { 
      lat: parseFloat(lat.toFixed(6)), 
      lng: parseFloat(lng.toFixed(6)) 
    };
    
    const newPoints = [...selectedPoints, newPoint];
    setSelectedPoints(newPoints);

    console.log('Adding point:', newPoint);
    console.log('Total points:', newPoints.length);

    // Add visual marker with proper callbacks
    addMarker(newPoint, newPoints.length - 1, updatePoint, removePoint);
    
    // Update polygon visualization if we have at least 3 points
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    }

    toast({
      title: `Point ${newPoints.length} Added`,
      description: `Coordinates: ${newPoint.lat}, ${newPoint.lng}`,
    });
  };

  const updatePoint = (index: number, lat: number, lng: number) => {
    const newPoints = [...selectedPoints];
    newPoints[index] = { 
      lat: parseFloat(lat.toFixed(6)), 
      lng: parseFloat(lng.toFixed(6)) 
    };
    setSelectedPoints(newPoints);
    
    // Update polygon if we have enough points
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    }

    toast({
      title: "Point Updated",
      description: `Point ${index + 1} moved to ${newPoints[index].lat}, ${newPoints[index].lng}`,
    });
  };

  const removePoint = (index: number) => {
    const newPoints = selectedPoints.filter((_, i) => i !== index);
    setSelectedPoints(newPoints);
    
    // Clear all markers and re-add them with correct indices
    clearMapElements();
    
    // Re-add all remaining points with updated indices
    newPoints.forEach((point, i) => {
      addMarker(point, i, updatePoint, removePoint);
    });
    
    // Update polygon
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    } else {
      updatePolygon([]);
    }

    toast({
      title: "Point Removed",
      description: `Point ${index + 1} removed. ${newPoints.length} points remaining.`,
    });
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingZone(null);
    setNewZoneName('');
    setSelectedPoints([]);
    clearMapElements();
    
    toast({
      title: "Zone Creation Started",
      description: "Click on the map to add boundary points (minimum 3 required)",
    });
  };

  const startEditing = (zone: Zone) => {
    console.log('Starting zone editing:', zone);
    setEditingZone(zone);
    setNewZoneName(zone.name);
    setSelectedPoints([...zone.coordinates]);
    setIsCreating(false);
    clearMapElements();
    
    // Add existing points as markers
    zone.coordinates.forEach((point, index) => {
      addMarker(point, index, updatePoint, removePoint);
    });
    
    // Show existing polygon
    if (zone.coordinates.length >= 3) {
      updatePolygon(zone.coordinates);
    }

    toast({
      title: "Zone Editing Mode",
      description: "You can now edit this zone. Drag markers to move, click to remove, or click map to add new points.",
    });
  };

  const handleSave = async () => {
    if (!newZoneName.trim()) {
      toast({
        title: "Zone Name Required",
        description: "Please enter a name for your zone",
        variant: "destructive"
      });
      return;
    }

    if (selectedPoints.length < 3) {
      toast({
        title: "Insufficient Points",
        description: "You need at least 3 points to create a valid zone",
        variant: "destructive"
      });
      return;
    }

    console.log('Saving zone:', { name: newZoneName, points: selectedPoints });

    let success = false;
    if (editingZone) {
      success = await updateZone(editingZone.id, newZoneName, selectedPoints);
    } else {
      success = await createZone(newZoneName, selectedPoints);
    }

    if (success) {
      cancelEditing();
      // Refresh zones display
      setTimeout(() => {
        if (zones.length > 0) {
          loadExistingZones(zones);
        }
      }, 1000);
    }
  };

  const cancelEditing = () => {
    console.log('Canceling zone creation/editing');
    setIsCreating(false);
    setEditingZone(null);
    setNewZoneName('');
    setSelectedPoints([]);
    clearMapElements();
    
    // Reload existing zones display after a short delay
    setTimeout(() => {
      if (zones.length > 0) {
        loadExistingZones(zones);
      }
    }, 500);
  };

  const handleDelete = async (zoneId: string) => {
    await deleteZone(zoneId);
    // Refresh the map display
    setTimeout(() => {
      clearMapElements();
      if (zones.length > 0) {
        loadExistingZones(zones);
      }
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zone Management System</CardTitle>
          <CardDescription>
            Create, edit, and manage geofenced zones for employee assignments. 
            {zones.length > 0 && ` Currently managing ${zones.length} zones.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MapSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchInputRef={searchInputRef}
            mapInstanceRef={mapInstanceRef}
          />

          <ZoneCreationForm
            isCreating={isCreating}
            editingZone={editingZone}
            newZoneName={newZoneName}
            setNewZoneName={setNewZoneName}
            selectedPoints={selectedPoints}
            onSave={handleSave}
            onCancel={cancelEditing}
          />

          {/* Enhanced Map Container */}
          <div className="w-full h-96 border-2 border-gray-300 rounded-lg overflow-hidden relative bg-gray-100">
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Status Overlay */}
            {(isCreating || editingZone) && (
              <div className="absolute top-3 left-3 bg-white px-4 py-3 rounded-lg shadow-lg text-sm z-10 border">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="font-medium text-blue-700">
                    {editingZone ? `Editing: ${editingZone.name}` : 'Creating New Zone'}
                  </p>
                </div>
                <p className="text-gray-600 mt-1">
                  Points: {selectedPoints.length}/10 
                  {selectedPoints.length < 3 && ` (${3 - selectedPoints.length} more needed)`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click map to add • Drag markers to move • Click markers to remove
                </p>
              </div>
            )}

            {/* Instruction Overlay for non-editing mode */}
            {!isCreating && !editingZone && (
              <div className="absolute top-3 left-3 bg-green-50 px-4 py-3 rounded-lg shadow-lg text-sm z-10 border border-green-200">
                <p className="font-medium text-green-700">Zone Display Mode</p>
                <p className="text-green-600 text-xs mt-1">
                  {zones.length} zones loaded • Click "Create New Zone" to add more
                </p>
              </div>
            )}

            {/* Loading Overlay */}
            {!mapInstanceRef.current && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading Google Maps...</p>
                </div>
              </div>
            )}
          </div>

          {/* Create Zone Button */}
          {!isCreating && !editingZone && (
            <div className="flex justify-center">
              <Button onClick={startCreating} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-5 w-5 mr-2" />
                Create New Zone
              </Button>
            </div>
          )}

          {/* Zones List */}
          <ZonesList
            zones={zones}
            onEdit={startEditing}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapsZoneEditor;
