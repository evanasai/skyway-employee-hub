
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Save, X, MapPin, Navigation, Search } from 'lucide-react';
import { Zone } from '@/types/database';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsZoneEditorProps {
  onBack?: () => void;
}

interface Coordinate {
  lat: number;
  lng: number;
}

const GoogleMapsZoneEditor: React.FC<GoogleMapsZoneEditorProps> = ({ onBack }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<Coordinate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Using the provided Google Maps API key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBAie22cBjs6pcoxMyYvbT03GGcwJ1O9fw';

  // Helper function to safely parse coordinates from JSON
  const parseCoordinates = (coordinates: any): Coordinate[] => {
    if (!coordinates) return [];
    
    try {
      // If coordinates is already an array
      if (Array.isArray(coordinates)) {
        return coordinates.filter((coord): coord is Coordinate => 
          typeof coord === 'object' && 
          coord !== null && 
          typeof coord.lat === 'number' && 
          typeof coord.lng === 'number'
        );
      }
      
      // If coordinates is a JSON string, parse it
      if (typeof coordinates === 'string') {
        const parsed = JSON.parse(coordinates);
        if (Array.isArray(parsed)) {
          return parsed.filter((coord): coord is Coordinate => 
            typeof coord === 'object' && 
            coord !== null && 
            typeof coord.lat === 'number' && 
            typeof coord.lng === 'number'
          );
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchZones();
    getCurrentLocation();
    initializeMap();
  }, []);

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

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      const defaultLocation = userLocation || { lat: 28.6139, lng: 77.2090 };

      const map = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // Add click listener for adding points
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if ((isCreating || editingZone) && event.latLng) {
          addPointToZone(event.latLng.lat(), event.latLng.lng());
        }
      });

      // Initialize autocomplete for search
      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current);
        autocomplete.bindTo('bounds', map);
        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
          }
        });
      }

      // Add user location marker
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg fill="blue" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8"/>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
          },
        });
      }

      loadExistingZones(map);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Loading Error",
        description: "Please check your internet connection",
        variant: "destructive"
      });
    }
  };

  const addPointToZone = (lat: number, lng: number) => {
    if (selectedPoints.length >= 10) {
      toast({
        title: "Maximum Points Reached",
        description: "You can only select 10 points to form a zone",
        variant: "destructive"
      });
      return;
    }

    const newPoint: Coordinate = { lat, lng };
    const newPoints = [...selectedPoints, newPoint];
    setSelectedPoints(newPoints);

    // Add visual marker
    if (mapInstanceRef.current) {
      const marker = new google.maps.Marker({
        position: newPoint,
        map: mapInstanceRef.current,
        title: `Point ${newPoints.length}`,
        draggable: true,
      });

      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          updatePoint(newPoints.length - 1, event.latLng.lat(), event.latLng.lng());
        }
      });

      marker.addListener('click', () => {
        removePoint(newPoints.length - 1);
      });

      markersRef.current.push(marker);
      updatePolygon(newPoints);
    }
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

  const updatePolygon = (points: Coordinate[]) => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    if (points.length >= 3 && mapInstanceRef.current) {
      polygonRef.current = new google.maps.Polygon({
        paths: points,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#FF0000',
        fillOpacity: 0.2,
      });
      polygonRef.current.setMap(mapInstanceRef.current);
    }
  };

  const clearMapElements = () => {
    // Clear markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Clear polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
  };

  const loadExistingZones = (map: google.maps.Map) => {
    zones.forEach(zone => {
      const coordinates = parseCoordinates(zone.coordinates);

      if (coordinates.length >= 3) {
        const polygon = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: zone.is_active ? '#00FF00' : '#CCCCCC',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: zone.is_active ? '#00FF00' : '#CCCCCC',
          fillOpacity: 0.1,
        });
        polygon.setMap(map);

        const infoWindow = new google.maps.InfoWindow({
          content: `<div><strong>${zone.name}</strong><br/>Status: ${zone.is_active ? 'Active' : 'Inactive'}</div>`
        });

        polygon.addListener('click', (event: google.maps.PolyMouseEvent) => {
          if (event.latLng) {
            infoWindow.setPosition(event.latLng);
            infoWindow.open(map);
          }
        });
      }
    });
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const validZones: Zone[] = (data || []).map(zone => ({
        ...zone,
        coordinates: zone.coordinates || []
      }));
      
      setZones(validZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast({
        title: "Error",
        description: "Failed to fetch zones",
        variant: "destructive"
      });
    }
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
    const coordinates = parseCoordinates(zone.coordinates);
    setSelectedPoints(coordinates);
    setIsCreating(false);
    clearMapElements();
    
    // Add editing markers
    if (mapInstanceRef.current && coordinates.length > 0) {
      coordinates.forEach((point, index) => {
        const marker = new google.maps.Marker({
          position: point,
          map: mapInstanceRef.current!,
          title: `Point ${index + 1}`,
          draggable: true,
        });

        marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            updatePoint(index, event.latLng.lat(), event.latLng.lng());
          }
        });

        marker.addListener('click', () => {
          removePoint(index);
        });

        markersRef.current.push(marker);
      });
      updatePolygon(coordinates);
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

      cancelEditing();
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

      cancelEditing();
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
          {/* Search Bar */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                ref={searchInputRef}
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    const userPos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    };
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setCenter(userPos);
                      mapInstanceRef.current.setZoom(17);
                    }
                  });
                }
              }}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>

          {/* Zone Creation Form */}
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
              
              <div className="text-sm text-gray-600">
                <p>Click on the map to add points to create a zone boundary (3-10 points required)</p>
                <p>Selected points: {selectedPoints.length}/10</p>
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

          {/* Existing Zones List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Zones</h3>
            {zones.length === 0 ? (
              <p className="text-gray-500">No zones created yet</p>
            ) : (
              zones.map((zone) => {
                const coordinates = parseCoordinates(zone.coordinates);
                return (
                  <Card key={zone.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{zone.name}</h4>
                          <p className="text-sm text-gray-600">
                            {coordinates.length} coordinates • 
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
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapsZoneEditor;
