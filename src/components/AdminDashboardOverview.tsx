
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, UserCheck, MapPin, ClipboardList, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  totalTeams: number;
  totalZones: number;
  pendingKYC: number;
  pendingTasks: number;
}

const AdminDashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalDepartments: 0,
    totalTeams: 0,
    totalZones: 0,
    pendingKYC: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch employees stats
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, is_active, kyc_status');
      
      if (empError) throw empError;

      // Fetch departments count
      const { count: deptCount, error: deptError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (deptError) throw deptError;

      // Fetch teams count
      const { count: teamCount, error: teamError } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (teamError) throw teamError;

      // Fetch zones count
      const { count: zoneCount, error: zoneError } = await supabase
        .from('zones')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (zoneError) throw zoneError;

      // Fetch pending tasks count
      const { count: taskCount, error: taskError } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');
      
      if (taskError) throw taskError;

      // Calculate stats
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.is_active)?.length || 0;
      const pendingKYC = employees?.filter(emp => emp.kyc_status === 'pending')?.length || 0;

      setStats({
        totalEmployees,
        activeEmployees,
        totalDepartments: deptCount || 0,
        totalTeams: teamCount || 0,
        totalZones: zoneCount || 0,
        pendingKYC,
        pendingTasks: taskCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      subtitle: `${stats.activeEmployees} active`,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      subtitle: 'Active departments',
      icon: Building,
      color: 'bg-green-500'
    },
    {
      title: 'Teams',
      value: stats.totalTeams,
      subtitle: 'Active teams',
      icon: UserCheck,
      color: 'bg-purple-500'
    },
    {
      title: 'Zones',
      value: stats.totalZones,
      subtitle: 'Geographic zones',
      icon: MapPin,
      color: 'bg-orange-500'
    },
    {
      title: 'Pending KYC',
      value: stats.pendingKYC,
      subtitle: 'Awaiting verification',
      icon: UserCheck,
      color: 'bg-yellow-500'
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      subtitle: 'Awaiting review',
      icon: ClipboardList,
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Overview</h2>
        <p className="text-gray-600">Monitor your organization's key metrics and activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900">Add Employee</h3>
              <p className="text-sm text-gray-600">Register new team member</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900">Create Team</h3>
              <p className="text-sm text-gray-600">Organize employees into teams</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900">Define Zone</h3>
              <p className="text-sm text-gray-600">Set up work areas</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900">Review Tasks</h3>
              <p className="text-sm text-gray-600">Approve pending submissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Employee Management</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Task Submissions</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Zone Management</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            {stats.pendingKYC > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">KYC Verification</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {stats.pendingKYC} Pending
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardOverview;
