
import { supabase } from '@/integrations/supabase/client';

// Type guard to check if coordinates are valid
const isValidCoordinates = (coordinates: any): coordinates is { lat: number; lng: number }[] => {
  return Array.isArray(coordinates) && 
    coordinates.every(coord => 
      typeof coord === 'object' && 
      coord !== null && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number'
    );
};

const isPointInPolygon = (point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean => {
  const x = point.lat;
  const y = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
};

export const useZoneValidation = () => {
  const checkZoneValidation = async (location: GeolocationPosition): Promise<{ isValid: boolean; zoneName?: string }> => {
    try {
      const { data: zones, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching zones:', error);
        return { isValid: false };
      }

      if (!zones || zones.length === 0) {
        return { isValid: false };
      }

      const currentPoint = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };

      for (const zone of zones) {
        const coordinates = isValidCoordinates(zone.coordinates) ? zone.coordinates : [];
        if (coordinates.length > 0 && isPointInPolygon(currentPoint, coordinates)) {
          return { isValid: true, zoneName: zone.name };
        }
      }

      return { isValid: false };
    } catch (error) {
      console.error('Error checking zone validation:', error);
      return { isValid: false };
    }
  };

  return { checkZoneValidation };
};
