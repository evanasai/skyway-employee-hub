
import { Json } from '@/integrations/supabase/types';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string;
  coordinates: Coordinate[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZoneFromDB {
  id: string;
  name: string;
  coordinates: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to safely parse coordinates from JSON
export const parseCoordinates = (coordinates: Json): Coordinate[] => {
  if (!coordinates) return [];
  
  try {
    // If coordinates is already an array
    if (Array.isArray(coordinates)) {
      return coordinates.filter((coord): coord is Coordinate => 
        typeof coord === 'object' && 
        coord !== null && 
        'lat' in coord &&
        'lng' in coord &&
        typeof (coord as any).lat === 'number' && 
        typeof (coord as any).lng === 'number'
      ).map(coord => coord as Coordinate);
    }
    
    // If coordinates is a JSON string, parse it
    if (typeof coordinates === 'string') {
      const parsed = JSON.parse(coordinates);
      if (Array.isArray(parsed)) {
        return parsed.filter((coord): coord is Coordinate => 
          typeof coord === 'object' && 
          coord !== null && 
          'lat' in coord &&
          'lng' in coord &&
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

// Helper function to convert coordinates to JSON for database storage
export const coordinatesToJson = (coordinates: Coordinate[]): Json => {
  return coordinates as unknown as Json;
};
