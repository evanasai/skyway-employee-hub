
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
    let parsed: any;
    
    // If coordinates is a JSON string, parse it
    if (typeof coordinates === 'string') {
      parsed = JSON.parse(coordinates);
    } else {
      parsed = coordinates;
    }
    
    // Check if parsed is an array
    if (!Array.isArray(parsed)) {
      return [];
    }
    
    // Filter and validate coordinates
    return parsed.filter((coord: any) => {
      return coord && 
        typeof coord === 'object' &&
        typeof coord.lat === 'number' && 
        typeof coord.lng === 'number';
    }).map((coord: any) => ({
      lat: coord.lat,
      lng: coord.lng
    }));
    
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return [];
  }
};

// Helper function to convert coordinates to JSON for database storage
export const coordinatesToJson = (coordinates: Coordinate[]): Json => {
  return coordinates as unknown as Json;
};
