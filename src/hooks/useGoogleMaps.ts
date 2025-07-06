import { useState, useCallback, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Zone, Coordinate } from '@/types/zone';

export interface GoogleMapsHookReturn {
  isLoaded: boolean;
  loadError: string | null;
  loadGoogleMaps: () => Promise<void>;
  maps: typeof google.maps | null;
  mapRef: React.RefObject<HTMLDivElement>;
  mapInstanceRef: React.MutableRefObject<google.maps.Map | null>;
  markersRef: React.MutableRefObject<google.maps.Marker[]>;
  initializeMap: (
    center: Coordinate | null,
    onMapClick: (lat: number, lng: number) => void,
    searchInputRef?: React.RefObject<HTMLInputElement>
  ) => Promise<void>;
  clearMapElements: () => void;
  updatePolygon: (coordinates: Coordinate[]) => void;
  addMarker: (
    coordinate: Coordinate,
    index: number,
    onUpdate: (index: number, lat: number, lng: number) => void,
    onRemove: (index: number) => void
  ) => void;
  loadExistingZones: (zones: Zone[]) => void;
}

export const useGoogleMaps = (apiKey: string): GoogleMapsHookReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [maps, setMaps] = useState<typeof google.maps | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const loadGoogleMaps = useCallback(async () => {
    if (isLoaded || loadError) return;

    try {
      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["places", "geometry"]
      });

      await loader.load();
      setMaps(google.maps);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load Google Maps');
    }
  }, [apiKey, isLoaded, loadError]);

  const initializeMap = useCallback(async (
    center: Coordinate | null,
    onMapClick: (lat: number, lng: number) => void,
    searchInputRef?: React.RefObject<HTMLInputElement>
  ) => {
    if (!maps || !mapRef.current) return;

    await loadGoogleMaps();

    const defaultCenter = center || { lat: 17.4065, lng: 78.4772 };
    
    const mapInstance = new maps.Map(mapRef.current, {
      zoom: 12,
      center: defaultCenter,
      mapTypeId: 'roadmap',
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true
    });

    mapInstanceRef.current = mapInstance;

    // Add click listener for adding points
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onMapClick(lat, lng);
      }
    });

    // Initialize Places Autocomplete if search input is provided
    if (searchInputRef?.current) {
      const autocomplete = new maps.places.Autocomplete(searchInputRef.current);
      autocomplete.bindTo('bounds', mapInstance);
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(15);
        }
      });
    }
  }, [maps, loadGoogleMaps]);

  const clearMapElements = useCallback(() => {
    // Clear all markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
  }, []);

  const updatePolygon = useCallback((coordinates: Coordinate[]) => {
    if (!maps || !mapInstanceRef.current) return;

    // Clear existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    if (coordinates.length >= 3) {
      polygonRef.current = new maps.Polygon({
        paths: coordinates,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: false
      });
      
      polygonRef.current.setMap(mapInstanceRef.current);
    }
  }, [maps]);

  const addMarker = useCallback((
    coordinate: Coordinate,
    index: number,
    onUpdate: (index: number, lat: number, lng: number) => void,
    onRemove: (index: number) => void
  ) => {
    if (!maps || !mapInstanceRef.current) return;

    const marker = new maps.Marker({
      position: coordinate,
      map: mapInstanceRef.current,
      draggable: true,
      title: `Point ${index + 1}`,
      icon: {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%23FF0000'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/svg%3E",
        scaledSize: new maps.Size(20, 20)
      }
    });

    // Add drag listener
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        onUpdate(index, position.lat(), position.lng());
      }
    });

    // Add click listener for removal
    marker.addListener('click', () => {
      onRemove(index);
    });

    markersRef.current.push(marker);
  }, [maps]);

  const loadExistingZones = useCallback((zones: Zone[]) => {
    if (!maps || !mapInstanceRef.current) return;

    clearMapElements();

    zones.forEach((zone, zoneIndex) => {
      if (zone.coordinates.length >= 3) {
        // Create polygon for each zone
        const polygon = new maps.Polygon({
          paths: zone.coordinates,
          fillColor: `hsl(${zoneIndex * 60}, 70%, 50%)`,
          fillOpacity: 0.3,
          strokeColor: `hsl(${zoneIndex * 60}, 70%, 40%)`,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          editable: false
        });
        
        polygon.setMap(mapInstanceRef.current);

        // Add info window
        const infoWindow = new maps.InfoWindow({
          content: `<div><strong>${zone.name}</strong><br/>${zone.coordinates.length} points</div>`
        });

        polygon.addListener('click', () => {
          const bounds = new maps.LatLngBounds();
          zone.coordinates.forEach(coord => bounds.extend(coord));
          const center = bounds.getCenter();
          
          infoWindow.setPosition(center);
          infoWindow.open(mapInstanceRef.current);
        });
      }
    });
  }, [maps, clearMapElements]);

  return {
    isLoaded,
    loadError,
    loadGoogleMaps,
    maps,
    mapRef,
    mapInstanceRef,
    markersRef,
    initializeMap,
    clearMapElements,
    updatePolygon,
    addMarker,
    loadExistingZones
  };
};

export const createMapInstance = (
  container: HTMLElement,
  maps: typeof google.maps,
  center: { lat: number; lng: number } = { lat: 17.4065, lng: 78.4772 }
) => {
  return new maps.Map(container, {
    zoom: 12,
    center,
    mapTypeId: 'roadmap',
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true
  });
};

export const createMarker = (
  maps: typeof google.maps,
  map: google.maps.Map,
  position: { lat: number; lng: number },
  options?: {
    draggable?: boolean;
    title?: string;
    icon?: string | google.maps.Icon;
  }
) => {
  const defaultIcon = {
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%23FF0000'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/svg%3E",
    scaledSize: new maps.Size(20, 20)
  };

  return new maps.Marker({
    position,
    map,
    draggable: options?.draggable || false,
    title: options?.title || '',
    icon: options?.icon || defaultIcon
  });
};

export const createPolygon = (
  maps: typeof google.maps,
  map: google.maps.Map,
  paths: { lat: number; lng: number }[],
  options?: {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    editable?: boolean;
  }
) => {
  return new maps.Polygon({
    paths,
    fillColor: options?.fillColor || '#FF0000',
    fillOpacity: options?.fillOpacity || 0.35,
    strokeColor: options?.strokeColor || '#FF0000',
    strokeOpacity: options?.strokeOpacity || 0.8,
    strokeWeight: options?.strokeWeight || 2,
    editable: options?.editable || false
  });
};

export const createInfoWindow = (
  maps: typeof google.maps,
  content: string
) => {
  return new maps.InfoWindow({
    content
  });
};

export const addMarkerClickListener = (
  marker: google.maps.Marker,
  callback: () => void
) => {
  marker.addListener('click', callback);
};

export const addMapClickListener = (
  map: google.maps.Map,
  callback: (event: google.maps.MapMouseEvent) => void
) => {
  map.addListener('click', callback);
};
