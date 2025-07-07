
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, UserCog, Settings } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  created_at: string;
  supervisor_id: string | null;
  team_leader_id: string | null;
  department_id: string | null;
  supervisor: {
    name: string;
    employee_id: string;
  } | null;
  team_leader: {
    name: string;
    employee_id: string;
  } | null;
  team_members: {
    employee: {
      name: string;
      employee_id: string;
    };
  }[];
}

const TeamManagementView = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          supervisor:employees!teams_supervisor_id_fkey(name, employee_id),
          team_leader:employees!teams_team_leader_id_fkey(name, employee_id),
          team_members(
            employee:employees(name, employee_id)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading teams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-gray-600">Manage teams and their members</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>
                    Category: {team.category} | Created: {new Date(team.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getStatusBadge(team.is_active)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Supervisor</p>
                    <p className="text-sm text-gray-600">
                      {team.supervisor ? `${team.supervisor.name} (${team.supervisor.employee_id})` : 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Team Leader</p>
                    <p className="text-sm text-gray-600">
                      {team.team_leader ? `${team.team_leader.name} (${team.team_leader.employee_id})` : 'Not assigned'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Team Members ({team.team_members?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                    {team.team_members?.map((member, index) => (
                      <Badge key={index} variant="outline">
                        {member.employee.name} ({member.employee.employee_id})
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No members assigned</span>}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-1" />
                    Manage Members
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserCog className="w-4 h-4 mr-1" />
                    Assign Leader
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No teams found</p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamManagementView;
