
import { useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Coordinate } from '@/types/zone';

export const useGoogleMaps = (apiKey: string) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const initializeMap = useCallback(async (
    userLocation: Coordinate | null,
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

      return map;
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }, [apiKey]);

  const clearMapElements = useCallback(() => {
    // Clear markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Clear polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
  }, []);

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
        fillOpacity: 0.2,
      });
      polygonRef.current.setMap(mapInstanceRef.current);
    }
  }, []);

  const addMarker = useCallback((point: Coordinate, index: number, onDragEnd: (index: number, lat: number, lng: number) => void, onRemove: (index: number) => void) => {
    if (!mapInstanceRef.current) return;

    const marker = new google.maps.Marker({
      position: point,
      map: mapInstanceRef.current,
      title: `Point ${index + 1}`,
      draggable: true,
    });

    marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        onDragEnd(index, event.latLng.lat(), event.latLng.lng());
      }
    });

    marker.addListener('click', () => {
      onRemove(index);
    });

    markersRef.current.push(marker);
    return marker;
  }, []);

  const loadExistingZones = useCallback((zones: Zone[]) => {
    if (!mapInstanceRef.current) return;

    zones.forEach(zone => {
      const coordinates = zone.coordinates;

      if (coordinates.length >= 3) {
        const polygon = new google.maps.Polygon({
          paths: coordinates,
          strokeColor: zone.is_active ? '#00FF00' : '#CCCCCC',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: zone.is_active ? '#00FF00' : '#CCCCCC',
          fillOpacity: 0.1,
        });
        polygon.setMap(mapInstanceRef.current);

        const infoWindow = new google.maps.InfoWindow({
          content: `<div><strong>${zone.name}</strong><br/>Status: ${zone.is_active ? 'Active' : 'Inactive'}</div>`
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
    updatePolygon,
    addMarker,
    loadExistingZones
  };
};
