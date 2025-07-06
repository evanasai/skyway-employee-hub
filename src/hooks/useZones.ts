
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Zone, ZoneFromDB, parseCoordinates, coordinatesToJson, Coordinate } from '@/types/zone';

export const useZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);

  const fetchZones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const validZones: Zone[] = (data || []).map((zone: ZoneFromDB) => ({
        ...zone,
        coordinates: parseCoordinates(zone.coordinates)
      }));
      
      setZones(validZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast({
        title: "Error",
        description: "Failed to fetch zones",
        variant: "destructive"
      });
    }
  }, []);

  const createZone = useCallback(async (name: string, coordinates: Coordinate[]) => {
    if (!name.trim() || coordinates.length < 3) {
      toast({
        title: "Invalid Zone",
        description: "Zone name is required and at least 3 points must be selected",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('zones')
        .insert({
          name: name,
          coordinates: coordinatesToJson(coordinates)
        });

      if (error) throw error;

      await fetchZones();
      
      toast({
        title: "Zone Created",
        description: "New zone has been created successfully",
      });
      return true;
    } catch (error) {
      console.error('Error creating zone:', error);
      toast({
        title: "Error",
        description: "Failed to create zone",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchZones]);

  const updateZone = useCallback(async (zoneId: string, name: string, coordinates: Coordinate[]) => {
    if (!name.trim() || coordinates.length < 3) {
      toast({
        title: "Invalid Zone",
        description: "Zone name is required and at least 3 points must be selected",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('zones')
        .update({
          name: name,
          coordinates: coordinatesToJson(coordinates),
          updated_at: new Date().toISOString()
        })
        .eq('id', zoneId);

      if (error) throw error;

      await fetchZones();
      
      toast({
        title: "Zone Updated",
        description: "Zone has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating zone:', error);
      toast({
        title: "Error",
        description: "Failed to update zone",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchZones]);

  const deleteZone = useCallback(async (zoneId: string) => {
    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      await fetchZones();
      toast({
        title: "Zone Deleted",
        description: "Zone has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast({
        title: "Error",
        description: "Failed to delete zone",
        variant: "destructive"
      });
    }
  }, [fetchZones]);

  return {
    zones,
    fetchZones,
    createZone,
    updateZone,
    deleteZone
  };
};
