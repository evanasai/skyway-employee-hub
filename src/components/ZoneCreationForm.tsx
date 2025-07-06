
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, MapPin } from 'lucide-react';
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

  const isValidZone = newZoneName.trim().length > 0 && selectedPoints.length >= 3;

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">
          {editingZone ? `Editing: ${editingZone.name}` : 'Create New Zone'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zoneName" className="text-gray-700 font-medium">Zone Name</Label>
          <Input
            id="zoneName"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder="Enter a descriptive zone name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label className="text-gray-700 font-medium">Zone Progress</Label>
          <div className="mt-1 p-3 bg-white rounded border">
            <div className="flex items-center justify-between text-sm">
              <span>Points Added:</span>
              <span className={`font-bold ${selectedPoints.length >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                {selectedPoints.length}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  selectedPoints.length >= 3 ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((selectedPoints.length / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedPoints.length < 3 
                ? `${3 - selectedPoints.length} more points needed for a valid zone`
                : 'Zone is ready to save!'
              }
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white rounded border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click on the map to add boundary points (minimum 3 required)</li>
          <li>• Drag existing markers to adjust their position</li>
          <li>• Click on markers to remove them</li>
          <li>• Points will automatically form a polygon when you have 3 or more</li>
        </ul>
      </div>

      {selectedPoints.length > 0 && (
        <div className="p-4 bg-white rounded border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Current Points:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {selectedPoints.map((point, index) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded flex justify-between items-center">
                <span>
                  <strong>Point {index + 1}:</strong> {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-3 pt-2">
        <Button 
          onClick={onSave} 
          disabled={!isValidZone}
          className={`${isValidZone ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
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
