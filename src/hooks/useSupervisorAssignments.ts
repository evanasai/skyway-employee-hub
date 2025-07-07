
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  name: string;
  employee_id: string;
  email: string;
  role: string;
  department: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
  department: {
    name: string;
  } | null;
}

interface Department {
  id: string;
  name: string;
}

interface SupervisorAllocation {
  id: string;
  assignment_type: string;
  assigned_at: string;
  is_active: boolean;
  team_id: string | null;
  supervisor: {
    name: string;
    employee_id: string;
    email: string;
  } | null;
  employee: {
    name: string;
    employee_id: string;
    email: string;
    department: string;
  } | null;
  team: {
    name: string;
    category: string;
  } | null;
  department: {
    name: string;
  } | null;
}

export const useSupervisorAssignments = () => {
  const [allocations, setAllocations] = useState<SupervisorAllocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      setEmployees(data || []);
      setSupervisors((data || []).filter(emp => 
        emp.role.toLowerCase().includes('supervisor') || 
        emp.role.toLowerCase().includes('admin') ||
        emp.role_level >= 2
      ));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          department:departments(name)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive"
      });
    }
  };

  const fetchAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisor_assignments')
        .select(`
          *,
          supervisor:employees!supervisor_assignments_supervisor_id_fkey(name, employee_id, email),
          employee:employees!supervisor_assignments_employee_id_fkey(name, employee_id, email, department),
          team:teams(name, category),
          department:departments(name)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      setAllocations(data || []);
    } catch (error) {
      console.error('Error fetching supervisor allocations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch supervisor allocations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
    fetchEmployees();
    fetchTeams();
    fetchDepartments();
  }, []);

  return {
    allocations,
    employees,
    teams,
    departments,
    supervisors,
    loading,
    fetchAllocations,
    fetchEmployees,
    fetchTeams,
    fetchDepartments
  };
};
