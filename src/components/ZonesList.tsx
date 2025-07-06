
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Zone } from '@/types/zone';

interface ZonesListProps {
  zones: Zone[];
  onEdit: (zone: Zone) => void;
  onDelete: (zoneId: string) => void;
}

const ZonesList: React.FC<ZonesListProps> = ({ zones, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Existing Zones</h3>
      {zones.length === 0 ? (
        <p className="text-gray-500">No zones created yet</p>
      ) : (
        zones.map((zone) => (
          <Card key={zone.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{zone.name}</h4>
                  <p className="text-sm text-gray-600">
                    {zone.coordinates.length} coordinates • 
                    {zone.is_active ? ' Active' : ' Inactive'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(zone)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(zone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ZonesList;
