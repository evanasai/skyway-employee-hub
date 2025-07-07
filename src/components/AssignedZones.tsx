
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
}

interface AssignedZonesProps {
  zones: Zone[];
}

const AssignedZones: React.FC<AssignedZonesProps> = ({ zones }) => {
  const openDirections = (zone: Zone) => {
    if (zone.coordinates.length === 0) return;

    // Calculate center of the zone
    const centerLat = zone.coordinates.reduce((sum, coord) => sum + coord.lat, 0) / zone.coordinates.length;
    const centerLng = zone.coordinates.reduce((sum, coord) => sum + coord.lng, 0) / zone.coordinates.length;

    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${centerLat},${centerLng}`;
    window.open(url, '_blank');
  };

  if (zones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>Assigned Zones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No zones assigned yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>Your Assigned Zones ({zones.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {zones.map((zone) => (
          <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: `hsl(${zone.name.length * 30}, 70%, 50%)` }}
              />
              <span className="font-medium text-sm">{zone.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDirections(zone)}
              className="flex items-center space-x-1"
            >
              <Navigation className="h-3 w-3" />
              <span className="text-xs">Directions</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssignedZones;
