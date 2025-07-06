
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { Zone, Coordinate } from '@/types/zone';

interface ZoneCreationFormProps {
  isCreating: boolean;
  editingZone: Zone | null;
  newZoneName: string;
  setNewZoneName: (name: string) => void;
  selectedPoints: Coordinate[];
  onSave: () => void;
  onCancel: () => void;
}

const ZoneCreationForm: React.FC<ZoneCreationFormProps> = ({
  isCreating,
  editingZone,
  newZoneName,
  setNewZoneName,
  selectedPoints,
  onSave,
  onCancel
}) => {
  if (!isCreating && !editingZone) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <Label htmlFor="zoneName">Zone Name</Label>
        <Input
          id="zoneName"
          value={newZoneName}
          onChange={(e) => setNewZoneName(e.target.value)}
          placeholder="Enter zone name"
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Click on the map to add points to create a zone boundary (3-10 points required)</p>
        <p>Selected points: {selectedPoints.length}/10</p>
      </div>

      <div className="flex space-x-2">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          {editingZone ? 'Update Zone' : 'Create Zone'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ZoneCreationForm;
