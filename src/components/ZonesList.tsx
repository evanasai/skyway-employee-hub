
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Calendar } from 'lucide-react';
import { Zone } from '@/types/zone';

interface ZonesListProps {
  zones: Zone[];
  onEdit: (zone: Zone) => void;
  onDelete: (zoneId: string) => void;
}

const ZonesList: React.FC<ZonesListProps> = ({ zones, onEdit, onDelete }) => {
  const handleDelete = (zoneId: string, zoneName: string) => {
    if (window.confirm(`Are you sure you want to delete "${zoneName}"? This action cannot be undone.`)) {
      onDelete(zoneId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Existing Zones</h3>
        <Badge variant="outline" className="text-sm">
          {zones.length} {zones.length === 1 ? 'Zone' : 'Zones'}
        </Badge>
      </div>
      
      {zones.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No zones created yet</p>
            <p className="text-gray-400 text-sm">Click "Create New Zone" to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {zones.map((zone, index) => (
            <Card key={zone.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ 
                          backgroundColor: [
                            '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                            '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080'
                          ][index % 10]
                        }}
                      />
                      <h4 className="font-semibold text-lg">{zone.name}</h4>
                      <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{zone.coordinates.length} boundary points</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {new Date(zone.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          ID: {zone.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    
                    {/* Show first few coordinates as preview */}
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Coordinates: </span>
                      {zone.coordinates.slice(0, 2).map((coord, i) => (
                        <span key={i}>
                          ({coord.lat.toFixed(4)}, {coord.lng.toFixed(4)})
                          {i < Math.min(zone.coordinates.length - 1, 1) && ', '}
                        </span>
                      ))}
                      {zone.coordinates.length > 2 && (
                        <span> +{zone.coordinates.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(zone)}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(zone.id, zone.name)}
                      className="hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ZonesList;
