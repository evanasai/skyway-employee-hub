import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, UserCog, Settings, Edit, Trash2, Save, X } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  category: string;
  department_id: string;
  team_leader_id?: string;
  supervisor_id?: string;
  is_active: boolean;
  created_at: string;
  team_leader?: { name: string; employee_id: string };
  supervisor?: { name: string; employee_id: string };
  department?: { name: string };
  team_members?: { employee: { name: string; employee_id: string; id: string } }[];
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

const EnhancedTeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Dialogs state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department_id: '',
    team_leader_id: '',
    supervisor_id: ''
  });

  const [teamCategories, setTeamCategories] = useState([
    'Installation Team',
    'Maintenance Team',
    'Field Operations',
    'Security Team',
    'Technical Support',
    'Quality Assurance'
  ]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_leader:employees!teams_team_leader_id_fkey(name, employee_id),
          supervisor:employees!teams_supervisor_id_fkey(name, employee_id),
          department:departments!teams_department_id_fkey(name),
          team_members(
            employee:employees(id, name, employee_id)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, name, role, department')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const createTeam = async () => {
    if (!formData.name.trim() || !formData.category || !formData.department_id) {
      toast({
        title: "Missing Information",
        description: "Name, category, and department are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('teams')
        .insert({
          name: formData.name.trim(),
          category: formData.category,
          department_id: formData.department_id,
          team_leader_id: formData.team_leader_id || null,
          supervisor_id: formData.supervisor_id || null,
          is_active: true
        });

      if (error) throw error;

      resetForm();
      setIsCreateDialogOpen(false);
      await fetchTeams();
      
      toast({
        title: "Team Created",
        description: "Team has been created successfully",
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTeamLeader = async (teamId: string, leaderId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ team_leader_id: leaderId })
        .eq('id', teamId);

      if (error) throw error;

      await fetchTeams();
      setIsLeaderDialogOpen(false);
      
      toast({
        title: "Team Leader Updated",
        description: "Team leader has been assigned successfully",
      });
    } catch (error) {
      console.error('Error updating team leader:', error);
      toast({
        title: "Error",
        description: "Failed to update team leader",
        variant: "destructive"
      });
    }
  };

  const addTeamMember = async (teamId: string, employeeId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          employee_id: employeeId
        });

      if (error) throw error;

      await fetchTeams();
      await fetchTeamMembersForDialog(teamId);
      
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

  const removeTeamMember = async (teamId: string, employeeId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('employee_id', employeeId);

      if (error) throw error;

      await fetchTeams();
      await fetchTeamMembersForDialog(teamId);
      
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

  const fetchTeamMembersForDialog = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          employee_id,
          employees!inner(id, employee_id, name, role, department)
        `)
        .eq('team_id', teamId);

      if (error) throw error;
      
      const members = (data || []).map(item => item.employees).filter(Boolean);
      setTeamMembers(members as Employee[]);

      // Get available employees (not in this team)
      const memberIds = members.map((m: any) => m.id);
      const available = employees.filter(emp => !memberIds.includes(emp.id));
      setAvailableEmployees(available);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ is_active: false })
        .eq('id', teamId);

      if (error) throw error;

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
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      department_id: '',
      team_leader_id: '',
      supervisor_id: ''
    });
  };

  const openMembersDialog = async (team: Team) => {
    setSelectedTeam(team);
    await fetchTeamMembersForDialog(team.id);
    setIsMembersDialogOpen(true);
  };

  const openLeaderDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsLeaderDialogOpen(true);
  };

  const openSettingsDialog = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      category: team.category,
      department_id: team.department_id,
      team_leader_id: team.team_leader_id || '',
      supervisor_id: team.supervisor_id || ''
    });
    setIsSettingsDialogOpen(true);
  };

  const updateTeamSettings = async () => {
    if (!selectedTeam) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: formData.name.trim(),
          category: formData.category,
          department_id: formData.department_id,
          supervisor_id: formData.supervisor_id || null
        })
        .eq('id', selectedTeam.id);

      if (error) throw error;

      await fetchTeams();
      setIsSettingsDialogOpen(false);
      
      toast({
        title: "Team Updated",
        description: "Team settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team settings",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const addNewCategory = () => {
    if (newCategory.trim() && !teamCategories.includes(newCategory.trim())) {
      setTeamCategories([...teamCategories, newCategory.trim()]);
      setFormData({...formData, category: newCategory.trim()});
      setNewCategory('');
      toast({
        title: "Category Added",
        description: "New team category has been added successfully",
      });
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    const defaultCategories = [
      'Installation Team',
      'Maintenance Team', 
      'Field Operations',
      'Security Team',
      'Technical Support',
      'Quality Assurance'
    ];
    
    if (!defaultCategories.includes(categoryToRemove)) {
      setTeamCategories(teamCategories.filter(cat => cat !== categoryToRemove));
      toast({
        title: "Category Removed",
        description: "Team category has been removed successfully",
      });
    } else {
      toast({
        title: "Cannot Remove",
        description: "Default categories cannot be removed",
        variant: "destructive"
      });
    }
  };

  const supervisors = employees.filter(emp => 
    ['supervisor', 'admin', 'super_admin'].includes(emp.role)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-gray-600">Manage teams, assign leaders, and organize team members</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team and assign basic information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team_name">Team Name</Label>
                <Input
                  id="team_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center justify-between w-full">
                          <span>{category}</span>
                          {!['Installation Team', 'Maintenance Team', 'Field Operations', 'Security Team', 'Technical Support', 'Quality Assurance'].includes(category) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCategory(category);
                              }}
                              className="h-4 w-4 p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex mt-2 space-x-2">
                  <Input
                    placeholder="Add new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                  />
                  <Button type="button" onClick={addNewCategory} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department_id} onValueChange={(value) => setFormData({...formData, department_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supervisor">Supervisor (Optional)</Label>
                <Select value={formData.supervisor_id} onValueChange={(value) => setFormData({...formData, supervisor_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name} ({supervisor.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTeam} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>
                    Category: {team.category} | Department: {team.department?.name} | Created: {new Date(team.created_at).toLocaleDateString()}
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
                  <Button variant="outline" size="sm" onClick={() => openMembersDialog(team)}>
                    <Users className="w-4 h-4 mr-1" />
                    Manage Members
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openLeaderDialog(team)}>
                    <UserCog className="w-4 h-4 mr-1" />
                    Assign Leader
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openSettingsDialog(team)}>
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteTeam(team.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No teams found</p>
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Members Management Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Team Members - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Add or remove team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Members ({teamMembers.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{member.name} ({member.employee_id})</span>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => selectedTeam && removeTeamMember(selectedTeam.id, member.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Available Employees ({availableEmployees.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableEmployees.map((employee) => (
                  <div key={employee.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{employee.name} ({employee.employee_id}) - {employee.role}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => selectedTeam && addTeamMember(selectedTeam.id, employee.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsMembersDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Leader Assignment Dialog */}
      <Dialog open={isLeaderDialogOpen} onOpenChange={setIsLeaderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Team Leader - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Select an employee to be the team leader
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Team Leader</Label>
              <Select onValueChange={(value) => selectedTeam && updateTeamLeader(selectedTeam.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose team leader" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(emp => emp.role !== 'admin' && emp.role !== 'super_admin').map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id}) - {employee.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaderDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Settings - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Update team information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="settings_name">Team Name</Label>
              <Input
                id="settings_name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="settings_category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="settings_department">Department</Label>
              <Select value={formData.department_id} onValueChange={(value) => setFormData({...formData, department_id: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="settings_supervisor">Supervisor</Label>
              <Select value={formData.supervisor_id} onValueChange={(value) => setFormData({...formData, supervisor_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} ({supervisor.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateTeamSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTeamManagement;