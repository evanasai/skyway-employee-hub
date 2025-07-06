
import { useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Coordinate, Zone } from '@/types/zone';

export const useGoogleMaps = (apiKey: string) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const existingPolygonsRef = useRef<google.maps.Polygon[]>([]);

  const initializeMap = useCallback(async (
    center: Coordinate | null,
    onMapClick: (lat: number, lng: number) => void,
    searchInputRef: React.RefObject<HTMLInputElement>
  ) => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      const defaultCenter = center || { lat: 17.3850, lng: 78.4867 }; // Hyderabad center

      const map = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
        gestureHandling: 'cooperative'
      });

      mapInstanceRef.current = map;

      // Add click listener for adding points
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          onMapClick(event.latLng.lat(), event.latLng.lng());
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
            map.setZoom(15);
          }
        });
      }

      // Add user location marker if available
      if (center) {
        new google.maps.Marker({
          position: center,
          map: map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
      }

      return map;
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }, [apiKey]);

  const clearMapElements = useCallback(() => {
    // Clear editing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Clear editing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
  }, []);

  const clearAllElements = useCallback(() => {
    clearMapElements();
    
    // Clear existing zone polygons
    existingPolygonsRef.current.forEach(polygon => polygon.setMap(null));
    existingPolygonsRef.current = [];
  }, [clearMapElements]);

  const updatePolygon = useCallback((points: Coordinate[]) => {
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
        fillOpacity: 0.35,
        editable: false,
        draggable: false
      });
      polygonRef.current.setMap(mapInstanceRef.current);
    }
  }, []);

  const addMarker = useCallback((
    point: Coordinate, 
    index: number, 
    onDragEnd: (index: number, lat: number, lng: number) => void, 
    onRemove: (index: number) => void
  ) => {
    if (!mapInstanceRef.current) return;

    const marker = new google.maps.Marker({
      position: point,
      map: mapInstanceRef.current,
      title: `Point ${index + 1} - Click to remove, drag to move`,
      draggable: true,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    // Handle drag end
    marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        onDragEnd(index, event.latLng.lat(), event.latLng.lng());
      }
    });

    // Handle click to remove
    marker.addListener('click', () => {
      onRemove(index);
    });

    markersRef.current.push(marker);
    return marker;
  }, []);

  const loadExistingZones = useCallback((zones: Zone[]) => {
    if (!mapInstanceRef.current) return;

    // Clear existing zone polygons first
    existingPolygonsRef.current.forEach(polygon => polygon.setMap(null));
    existingPolygonsRef.current = [];

    zones.forEach((zone, zoneIndex) => {
      const coordinates = zone.coordinates;

      if (coordinates.length >= 3) {
        const colors = [
          '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
          '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080'
        ];
        const color = colors[zoneIndex % colors.length];

        const polygon = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: zone.is_active ? 0.2 : 0.1,
          editable: false,
          draggable: false
        });
        
        polygon.setMap(mapInstanceRef.current);
        existingPolygonsRef.current.push(polygon);

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${zone.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                Status: ${zone.is_active ? 'Active' : 'Inactive'}<br/>
                Points: ${zone.coordinates.length}<br/>
                Created: ${new Date(zone.created_at).toLocaleDateString()}
              </p>
            </div>
          `
        });

        polygon.addListener('click', (event: google.maps.PolyMouseEvent) => {
          if (event.latLng) {
            infoWindow.setPosition(event.latLng);
            infoWindow.open(mapInstanceRef.current);
          }
        });
      }
    });
  }, []);

  return {
    mapRef,
    mapInstanceRef,
    markersRef,
    polygonRef,
    autocompleteRef,
    initializeMap,
    clearMapElements,
    clearAllElements,
    updatePolygon,
    addMarker,
    loadExistingZones
  };
};
