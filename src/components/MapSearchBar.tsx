
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface MapSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  mapInstanceRef: React.RefObject<google.maps.Map | null>;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  searchInputRef,
  mapInstanceRef
}) => {
  const handleLocationClick = () => {
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
  };

  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <Input
          ref={searchInputRef}
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button onClick={handleLocationClick}>
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapSearchBar;
