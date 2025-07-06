
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

  // Using the provided Google Maps API key
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
          // Default to Delhi coordinates
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
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Loading Error",
        description: "Please check your internet connection",
        variant: "destructive"
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if ((isCreating || editingZone) && selectedPoints.length < 10) {
      addPointToZone(lat, lng);
    } else if (selectedPoints.length >= 10) {
      toast({
        title: "Maximum Points Reached",
        description: "You can only select 10 points to form a zone",
        variant: "destructive"
      });
    }
  };

  const addPointToZone = (lat: number, lng: number) => {
    const newPoint: Coordinate = { lat, lng };
    const newPoints = [...selectedPoints, newPoint];
    setSelectedPoints(newPoints);

    // Add visual marker
    const marker = addMarker(newPoint, newPoints.length - 1, updatePoint, removePoint);
    updatePolygon(newPoints);
  };

  const updatePoint = (index: number, lat: number, lng: number) => {
    const newPoints = [...selectedPoints];
    newPoints[index] = { lat, lng };
    setSelectedPoints(newPoints);
    updatePolygon(newPoints);
  };

  const removePoint = (index: number) => {
    const newPoints = selectedPoints.filter((_, i) => i !== index);
    setSelectedPoints(newPoints);
    
    // Remove marker
    if (markersRef.current[index]) {
      markersRef.current[index].setMap(null);
      markersRef.current.splice(index, 1);
    }
    
    updatePolygon(newPoints);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingZone(null);
    setNewZoneName('');
    setSelectedPoints([]);
    clearMapElements();
  };

  const startEditing = (zone: Zone) => {
    setEditingZone(zone);
    setNewZoneName(zone.name);
    setSelectedPoints(zone.coordinates);
    setIsCreating(false);
    clearMapElements();
    
    // Add editing markers
    zone.coordinates.forEach((point, index) => {
      addMarker(point, index, updatePoint, removePoint);
    });
    updatePolygon(zone.coordinates);
  };

  const handleSave = async () => {
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
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Maps Zone Editor</CardTitle>
          <CardDescription>
            Create and manage geofenced zones with interactive Google Maps
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
          <div className="w-full h-96 border rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Controls */}
          {!isCreating && !editingZone && (
            <Button onClick={startCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Zone
            </Button>
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
