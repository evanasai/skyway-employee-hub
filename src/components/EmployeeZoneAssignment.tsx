
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, Save, X } from 'lucide-react';
import { Zone, ZoneFromDB, parseCoordinates } from '@/types/zone';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  is_active: boolean;
  assigned_zones?: string[];
}

interface EmployeeZoneAssignmentProps {
  onBack?: () => void;
}

const EmployeeZoneAssignment: React.FC<EmployeeZoneAssignmentProps> = ({ onBack }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchZones();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .eq('role', 'employee') // Only employees need zone assignments
        .order('name');

      if (error) throw error;
      
      // Fetch existing zone assignments for each employee
      const employeesWithZones = await Promise.all((data || []).map(async (emp) => {
        const { data: assignments } = await supabase
          .from('zone_assignments')
          .select('zone_id')
          .eq('employee_id', emp.id)
          .eq('is_active', true);
        
        return {
          ...emp,
          assigned_zones: assignments?.map(a => a.zone_id) || []
        };
      }));
      
      setEmployees(employeesWithZones);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const transformedZones: Zone[] = (data || []).map((zone: ZoneFromDB) => ({
        ...zone,
        coordinates: parseCoordinates(zone.coordinates)
      }));
      
      setZones(transformedZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast({
        title: "Error",
        description: "Failed to fetch zones",
        variant: "destructive"
      });
    }
  };

  const handleEmployeeSelect = async (employee: Employee) => {
    setSelectedEmployee(employee);
    
    // Fetch current zone assignments for this employee
    try {
      const { data: assignments } = await supabase
        .from('zone_assignments')
        .select('zone_id')
        .eq('employee_id', employee.id)
        .eq('is_active', true);
      
      setSelectedZones(assignments?.map(a => a.zone_id) || []);
    } catch (error) {
      console.error('Error fetching employee zones:', error);
      setSelectedZones([]);
    }
  };

  const handleZoneToggle = (zoneId: string, checked: boolean) => {
    if (checked) {
      setSelectedZones(prev => [...prev, zoneId]);
    } else {
      setSelectedZones(prev => prev.filter(id => id !== zoneId));
    }
  };

  const saveZoneAssignments = async () => {
    if (!selectedEmployee) return;

    setIsLoading(true);
    try {
      // First, remove existing assignments for this employee
      await supabase
        .from('zone_assignments')
        .delete()
        .eq('employee_id', selectedEmployee.id);

      // Then, add new assignments
      if (selectedZones.length > 0) {
        const assignments = selectedZones.map(zoneId => ({
          employee_id: selectedEmployee.id,
          zone_id: zoneId,
          assigned_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('zone_assignments')
          .insert(assignments);

        if (error) throw error;
      }

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, assigned_zones: selectedZones }
          : emp
      ));

      toast({
        title: "Zones Assigned",
        description: `Successfully assigned ${selectedZones.length} zones to ${selectedEmployee.name}`,
      });

      setSelectedEmployee(null);
      setSelectedZones([]);
    } catch (error) {
      console.error('Error saving zone assignments:', error);
      toast({
        title: "Error",
        description: "Failed to save zone assignments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAssignment = () => {
    setSelectedEmployee(null);
    setSelectedZones([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Employee Zone Assignment</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Assign geographical zones to employees for better task management
              </p>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <X className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedEmployee ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Assigning zones to: {selectedEmployee.name}
                </h3>
                <div className="text-sm text-blue-700">
                  <p>ID: {selectedEmployee.employee_id} • Role: {selectedEmployee.role}</p>
                  <p>Department: {selectedEmployee.department}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4 flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Available Zones ({zones.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {zones.map((zone) => (
                    <div key={zone.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={selectedZones.includes(zone.id)}
                        onCheckedChange={(checked) => handleZoneToggle(zone.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: `hsl(${zone.name.length * 30}, 70%, 50%)` }}
                          />
                          <span className="font-medium">{zone.name}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {zone.coordinates.length} boundary points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <Button onClick={saveZoneAssignments} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : `Assign ${selectedZones.length} Zones`}
                </Button>
                <Button variant="outline" onClick={cancelAssignment}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Select Employee ({employees.length})</span>
              </h3>
              {employees.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No active employees found
                </p>
              ) : (
                <div className="grid gap-4">
                  {employees.map((employee) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleEmployeeSelect(employee)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{employee.name}</h4>
                            <p className="text-sm text-gray-600">
                              ID: {employee.employee_id} • {employee.role} • {employee.department}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">
                                {employee.assigned_zones?.length || 0} zones assigned
                              </Badge>
                              <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                                {employee.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Assign Zones
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeZoneAssignment;
