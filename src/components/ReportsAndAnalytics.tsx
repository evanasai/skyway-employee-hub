
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, FileText, Download, Users, ClipboardList, Calendar } from 'lucide-react';

interface ReportData {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  monthlyAttendance: number;
}

const ReportsAndAnalytics = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    monthlyAttendance: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch employee data
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*');

      // Fetch task submissions
      const { data: tasks, error: taskError } = await supabase
        .from('task_submissions')
        .select('*');

      // Fetch attendance data
      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('*');

      if (empError || taskError || attError) {
        throw new Error('Failed to fetch data');
      }

      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.is_active).length || 0;
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'approved').length || 0;
      const pendingTasks = tasks?.filter(task => task.status === 'submitted').length || 0;
      const monthlyAttendance = attendance?.length || 0;

      setReportData({
        totalEmployees,
        activeEmployees,
        totalTasks,
        completedTasks,
        pendingTasks,
        monthlyAttendance
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = (reportType: string) => {
    // Create CSV content
    const csvContent = `Report Type,${reportType}\nGenerated Date,${new Date().toLocaleDateString()}\n\nMetric,Value\nTotal Employees,${reportData.totalEmployees}\nActive Employees,${reportData.activeEmployees}\nTotal Tasks,${reportData.totalTasks}\nCompleted Tasks,${reportData.completedTasks}\nPending Tasks,${reportData.pendingTasks}\nMonthly Attendance Records,${reportData.monthlyAttendance}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Reports & Analytics</span>
          </CardTitle>
          <CardDescription>
            Comprehensive reporting and analytics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchReportData} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.activeEmployees} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Task Submissions</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.completedTasks} completed, {reportData.pendingTasks} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Records</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.monthlyAttendance}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Download detailed reports in CSV format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => downloadReport('employee_summary')}
                >
                  <FileText className="h-6 w-6" />
                  <span>Employee Summary</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => downloadReport('task_analytics')}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>Task Analytics</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => downloadReport('attendance_report')}
                >
                  <Calendar className="h-6 w-6" />
                  <span>Attendance Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Task Completion Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${reportData.totalTasks > 0 ? (reportData.completedTasks / reportData.totalTasks) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {reportData.totalTasks > 0 ? Math.round((reportData.completedTasks / reportData.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Employee Activity Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${reportData.totalEmployees > 0 ? (reportData.activeEmployees / reportData.totalEmployees) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {reportData.totalEmployees > 0 ? Math.round((reportData.activeEmployees / reportData.totalEmployees) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAndAnalytics;
