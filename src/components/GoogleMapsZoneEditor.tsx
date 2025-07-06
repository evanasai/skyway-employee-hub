
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
    if (mapInstanceRef.current && zones.length > 0) {
      loadExistingZones(zones);
    }
  }, [zones, loadExistingZones]);

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
          console.log('Location access denied:', error);
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  };

  const initializeGoogleMaps = async () => {
    try {
      await initializeMap(userLocation, handleMapClick, searchInputRef);
      
      // Show instruction toast when in creation mode
      if (isCreating || editingZone) {
        toast({
          title: "Zone Creation Mode Active",
          description: "Click on the map to add points for your zone boundary. You need at least 3 points to create a zone.",
        });
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Loading Error",
        description: "Please check your internet connection and Google Maps API key",
        variant: "destructive"
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked at:', lat, lng);
    
    if (!isCreating && !editingZone) {
      toast({
        title: "Zone Creation Mode Required",
        description: "Click 'Create New Zone' button first to start adding points",
        variant: "destructive"
      });
      return;
    }

    if (selectedPoints.length >= 10) {
      toast({
        title: "Maximum Points Reached",
        description: "You can only select up to 10 points to form a zone",
        variant: "destructive"
      });
      return;
    }

    addPointToZone(lat, lng);
  };

  const addPointToZone = (lat: number, lng: number) => {
    const newPoint: Coordinate = { lat, lng };
    const newPoints = [...selectedPoints, newPoint];
    setSelectedPoints(newPoints);

    console.log('Adding point:', newPoint);
    console.log('Total points:', newPoints.length);

    // Add visual marker with click handler for removal
    addMarker(newPoint, newPoints.length - 1, updatePoint, removePoint);
    
    // Update polygon if we have at least 3 points
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    }

    toast({
      title: `Point ${newPoints.length} Added`,
      description: `Click ${Math.max(0, 3 - newPoints.length)} more point${3 - newPoints.length !== 1 ? 's' : ''} to create a valid zone`,
    });
  };

  const updatePoint = (index: number, lat: number, lng: number) => {
    const newPoints = [...selectedPoints];
    newPoints[index] = { lat, lng };
    setSelectedPoints(newPoints);
    
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    }
  };

  const removePoint = (index: number) => {
    const newPoints = selectedPoints.filter((_, i) => i !== index);
    setSelectedPoints(newPoints);
    
    // Clear all markers and re-add them with correct indices
    clearMapElements();
    
    newPoints.forEach((point, i) => {
      addMarker(point, i, updatePoint, removePoint);
    });
    
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    } else {
      // Clear polygon if less than 3 points
      updatePolygon([]);
    }

    toast({
      title: "Point Removed",
      description: `Point ${index + 1} has been removed from the zone`,
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
      description: "Click on the map to add points for your zone boundary",
    });
  };

  const startEditing = (zone: Zone) => {
    setEditingZone(zone);
    setNewZoneName(zone.name);
    setSelectedPoints(zone.coordinates);
    setIsCreating(false);
    clearMapElements();
    
    zone.coordinates.forEach((point, index) => {
      addMarker(point, index, updatePoint, removePoint);
    });
    
    if (zone.coordinates.length >= 3) {
      updatePolygon(zone.coordinates);
    }

    toast({
      title: "Zone Editing Started",
      description: "Click on markers to remove points or click on map to add new points",
    });
  };

  const handleSave = async () => {
    if (!newZoneName.trim()) {
      toast({
        title: "Missing Zone Name",
        description: "Please enter a name for your zone",
        variant: "destructive"
      });
      return;
    }

    if (selectedPoints.length < 3) {
      toast({
        title: "Insufficient Points",
        description: "You need at least 3 points to create a zone",
        variant: "destructive"
      });
      return;
    }

    let success = false;
    if (editingZone) {
      success = await updateZone(editingZone.id, newZoneName, selectedPoints);
    } else {
      success = await createZone(newZoneName, selectedPoints);
    }

    if (success) {
      cancelEditing();
    }
  };

  const cancelEditing = () => {
    setIsCreating(false);
    setEditingZone(null);
    setNewZoneName('');
    setSelectedPoints([]);
    clearMapElements();
    
    // Reload existing zones display
    if (zones.length > 0) {
      loadExistingZones(zones);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zone Management</CardTitle>
          <CardDescription>
            Create and manage geofenced zones using Google Maps. Click on the map to add boundary points.
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

          {/* Map Container */}
          <div className="w-full h-96 border-2 border-gray-300 rounded-lg overflow-hidden relative">
            <div ref={mapRef} className="w-full h-full" />
            {(isCreating || editingZone) && (
              <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded shadow-md text-sm">
                <p className="font-medium text-green-600">Zone Creation Mode Active</p>
                <p className="text-gray-600">Click on map to add points ({selectedPoints.length}/10)</p>
                <p className="text-xs text-gray-500">Click markers to remove points</p>
              </div>
            )}
          </div>

          {/* Controls */}
          {!isCreating && !editingZone && (
            <div className="flex justify-center">
              <Button onClick={startCreating} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Create New Zone
              </Button>
            </div>
          )}

          <ZonesList
            zones={zones}
            onEdit={startEditing}
            onDelete={deleteZone}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapsZoneEditor;
