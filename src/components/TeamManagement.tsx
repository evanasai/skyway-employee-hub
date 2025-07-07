
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Edit, Plus, Save, X, Users, UserPlus } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  category: string;
  department_id: string;
  team_leader_id?: string;
  supervisor_id?: string;
  is_active: boolean;
  team_leader?: { name: string; employee_id: string };
  supervisor?: { name: string; employee_id: string };
  department?: { name: string };
  member_count?: number;
}

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  role: string;
  department: string;
}

interface Department {
  id: string;
  name: string;
}

const TeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department_id: '',
    team_leader_id: '',
    supervisor_id: ''
  });

  const teamCategories = [
    'Installation Team',
    'Maintenance Team',
    'Field Operations',
    'Security Team',
    'Technical Support',
    'Quality Assurance'
  ];

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers();
      fetchAvailableEmployees();
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching teams...');
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_leader:employees!teams_team_leader_id_fkey(name, employee_id),
          supervisor:employees!teams_supervisor_id_fkey(name, employee_id),
          department:departments!teams_department_id_fkey(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: "Error",
          description: "Failed to fetch teams: " + error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Teams fetched successfully:', data);

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (data || []).map(async (team) => {
          try {
            const { count } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id);
            
            return { ...team, member_count: count || 0 };
          } catch (error) {
            console.error('Error counting team members:', error);
            return { ...team, member_count: 0 };
          }
        })
      );

      setTeams(teamsWithCounts);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, name, role, department')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }
      
      console.log('Employees fetched:', data);
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        return;
      }
      
      console.log('Departments fetched:', data);
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const createTeam = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Team name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Missing Information",
        description: "Team category is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.department_id) {
      toast({
        title: "Missing Information",
        description: "Department is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating team with data:', formData);
      
      const teamData = {
        name: formData.name.trim(),
        category: formData.category,
        department_id: formData.department_id,
        team_leader_id: formData.team_leader_id || null,
        supervisor_id: formData.supervisor_id || null,
        is_active: true
      };

      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single();

      if (error) {
        console.error('Error creating team:', error);
        toast({
          title: "Error",
          description: `Failed to create team: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Team created successfully:', data);

      resetForm();
      await fetchTeams();
      
      toast({
        title: "Team Created",
        description: `Team "${formData.name}" has been created successfully`,
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeam = async () => {
    if (!editingTeam) return;

    if (!formData.name.trim() || !formData.category || !formData.department_id) {
      toast({
        title: "Missing Information",
        description: "Name, category, and department are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('teams')
        .update({
          name: formData.name.trim(),
          category: formData.category,
          department_id: formData.department_id,
          team_leader_id: formData.team_leader_id || null,
          supervisor_id: formData.supervisor_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTeam.id);

      if (error) {
        console.error('Error updating team:', error);
        toast({
          title: "Error",
          description: `Failed to update team: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      resetForm();
      await fetchTeams();
      
      toast({
        title: "Team Updated",
        description: "Team has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('teams')
        .update({ is_active: false })
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        toast({
          title: "Error",
          description: `Failed to delete team: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      await fetchTeams();
      toast({
        title: "Team Deleted",
        description: "Team has been deactivated successfully",
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          employee_id,
          employees!inner(id, employee_id, name, role, department)
        `)
        .eq('team_id', selectedTeam);

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }
      
      const members = (data || []).map(item => item.employees).filter(Boolean);
      setTeamMembers(members as Employee[]);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchAvailableEmployees = async () => {
    try {
      const { data: teamMemberData } = await supabase
        .from('team_members')
        .select('employee_id')
        .eq('team_id', selectedTeam);

      const memberIds = (teamMemberData || []).map(m => m.employee_id);
      const available = employees.filter(emp => !memberIds.includes(emp.id));
      setAvailableEmployees(available);
    } catch (error) {
      console.error('Error fetching available employees:', error);
    }
  };

  const addTeamMember = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: selectedTeam,
          employee_id: employeeId
        });

      if (error) {
        console.error('Error adding team member:', error);
        toast({
          title: "Error",
          description: `Failed to add team member: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      await fetchTeamMembers();
      await fetchAvailableEmployees();
      await fetchTeams();
      
      toast({
        title: "Member Added",
        description: "Employee has been added to the team",
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      });
    }
  };

  const removeTeamMember = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', selectedTeam)
        .eq('employee_id', employeeId);

      if (error) {
        console.error('Error removing team member:', error);
        toast({
          title: "Error",
          description: `Failed to remove team member: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      await fetchTeamMembers();
      await fetchAvailableEmployees();
      await fetchTeams();
      
      toast({
        title: "Member Removed",
        description: "Employee has been removed from the team",
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingTeam(null);
    setFormData({
      name: '',
      category: '',
      department_id: '',
      team_leader_id: '',
      supervisor_id: ''
    });
  };

  const startEditing = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      category: team.category,
      department_id: team.department_id,
      team_leader_id: team.team_leader_id || '',
      supervisor_id: team.supervisor_id || ''
    });
    setIsCreating(false);
  };

  if (isLoading && teams.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading teams...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Create and manage teams, assign team leaders, and organize team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teams">
            <TabsList>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="members">Team Members</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="space-y-4">
              {(isCreating || editingTeam) && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="team_name">Team Name *</Label>
                      <Input
                        id="team_name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter team name"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({...formData, category: value})}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select 
                        value={formData.department_id} 
                        onValueChange={(value) => setFormData({...formData, department_id: value})}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="team_leader">Team Leader</Label>
                      <Select 
                        value={formData.team_leader_id} 
                        onValueChange={(value) => setFormData({...formData, team_leader_id: value})}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team leader" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {employees.filter(emp => emp.role === 'supervisor' || emp.role === 'employee').map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} ({emp.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="supervisor">Supervisor</Label>
                      <Select 
                        value={formData.supervisor_id} 
                        onValueChange={(value) => setFormData({...formData, supervisor_id: value})}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {employees.filter(emp => emp.role === 'supervisor' || emp.role === 'sub_admin' || emp.role === 'admin').map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} ({emp.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={editingTeam ? updateTeam : createTeam}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingTeam ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingTeam ? 'Update Team' : 'Create Team'}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!isCreating && !editingTeam && (
                <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Team
                </Button>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Team Leader</TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-gray-500">
                            <p>No teams created yet</p>
                            <p className="text-sm">Click "Create New Team" to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      teams.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell className="font-medium">{team.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{team.category}</Badge>
                          </TableCell>
                          <TableCell>{team.department?.name}</TableCell>
                          <TableCell>
                            {team.team_leader ? (
                              <div className="text-sm">
                                <div>{team.team_leader.name}</div>
                                <div className="text-gray-500">({team.team_leader.employee_id})</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {team.supervisor ? (
                              <div className="text-sm">
                                <div>{team.supervisor.name}</div>
                                <div className="text-gray-500">({team.supervisor.employee_id})</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {team.member_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(team)}
                                disabled={isLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteTeam(team.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div>
                <Label htmlFor="select_team">Select Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team to manage members" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTeam && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {teamMembers.length === 0 ? (
                          <p className="text-gray-500">No members assigned</p>
                        ) : (
                          teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-gray-500">
                                  {member.employee_id} • {member.role}
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeTeamMember(member.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {availableEmployees.length === 0 ? (
                          <p className="text-gray-500">All employees are assigned</p>
                        ) : (
                          availableEmployees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-gray-500">
                                  {employee.employee_id} • {employee.role}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addTeamMember(employee.id)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
