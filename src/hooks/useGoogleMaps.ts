
import { useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface GoogleMapsHookReturn {
  isLoaded: boolean;
  loadError: string | null;
  loadGoogleMaps: () => Promise<void>;
  maps: typeof google.maps | null;
}

export const useGoogleMaps = (): GoogleMapsHookReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [maps, setMaps] = useState<typeof google.maps | null>(null);

  const loadGoogleMaps = useCallback(async () => {
    if (isLoaded || loadError) return;

    try {
      const loader = new Loader({
        apiKey: "AIzaSyBjsINSWCoxGl1vh2PE0sKgY8UpUy-0S0M",
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
  }, [isLoaded, loadError]);

  return {
    isLoaded,
    loadError,
    loadGoogleMaps,
    maps
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
    mapTypeId: maps.MapTypeId.ROADMAP,
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
    icon?: string | google.maps.Icon | google.maps.Symbol;
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
    map,
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
