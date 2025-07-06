
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Filter, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const EnhancedReportDownloader = () => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [zones, setZones] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'employee_attendance', label: 'Employee Attendance Report' },
    { value: 'task_submissions', label: 'Task Submissions Report' },
    { value: 'zone_activities', label: 'Zone Activities Report' },
    { value: 'employee_performance', label: 'Employee Performance Report' },
    { value: 'payroll_summary', label: 'Payroll Summary Report' }
  ];

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const generateEmployeeAttendanceReport = async () => {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          employees!attendance_employee_id_fkey (
            name,
            employee_id,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reportData = (data || []).map(record => ({
        'Employee ID': record.employees?.employee_id || 'N/A',
        'Employee Name': record.employees?.name || 'N/A',
        'Department': record.employees?.department || 'N/A',
        'Check In Time': record.check_in_time ? new Date(record.check_in_time).toLocaleString() : 'N/A',
        'Check Out Time': record.check_out_time ? new Date(record.check_out_time).toLocaleString() : 'N/A',
        'Location': record.location_address || 'N/A',
        'Status': record.status || 'N/A',
        'Date': record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'
      }));

      return reportData;
    } catch (error) {
      console.error('Error generating attendance report:', error);
      throw error;
    }
  };

  const generateTaskSubmissionsReport = async () => {
    try {
      let query = supabase
        .from('task_submissions')
        .select(`
          *,
          employees!task_submissions_employee_id_fkey (
            name,
            employee_id,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reportData = (data || []).map(record => ({
        'Employee ID': record.employees?.employee_id || 'N/A',
        'Employee Name': record.employees?.name || 'N/A',
        'Department': record.employees?.department || 'N/A',
        'Task Type': record.task_type || 'N/A',
        'Task Description': record.task_description || 'N/A',
        'Status': record.status || 'N/A',
        'Location': record.location_address || 'N/A',
        'Start Time': record.start_time ? new Date(record.start_time).toLocaleString() : 'N/A',
        'End Time': record.end_time ? new Date(record.end_time).toLocaleString() : 'N/A',
        'Comments': record.comments || 'N/A',
        'Supervisor Feedback': record.supervisor_feedback || 'N/A',
        'Submitted Date': record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'
      }));

      return reportData;
    } catch (error) {
      console.error('Error generating task submissions report:', error);
      throw error;
    }
  };

  const generateZoneActivitiesReport = async () => {
    try {
      // Combine attendance and task submissions by location/zone
      const [attendanceData, taskData] = await Promise.all([
        supabase
          .from('attendance')
          .select(`
            *,
            employees!attendance_employee_id_fkey (
              name,
              employee_id
            )
          `)
          .gte('created_at', startDate || '2000-01-01')
          .lte('created_at', endDate || '2099-12-31'),
        
        supabase
          .from('task_submissions')
          .select(`
            *,
            employees!task_submissions_employee_id_fkey (
              name,
              employee_id
            )
          `)
          .gte('created_at', startDate || '2000-01-01')
          .lte('created_at', endDate || '2099-12-31')
      ]);

      const reportData: any[] = [];

      // Process attendance data
      attendanceData.data?.forEach(record => {
        if (!selectedZone || record.location_address?.includes(selectedZone)) {
          reportData.push({
            'Activity Type': 'Attendance',
            'Employee ID': record.employees?.employee_id || 'N/A',
            'Employee Name': record.employees?.name || 'N/A',
            'Location': record.location_address || 'N/A',
            'Activity': record.status === 'checked_in' ? 'Check In' : 'Check Out',
            'Time': record.check_in_time || record.check_out_time ? 
              new Date(record.check_in_time || record.check_out_time).toLocaleString() : 'N/A',
            'Date': record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'
          });
        }
      });

      // Process task data
      taskData.data?.forEach(record => {
        if (!selectedZone || record.location_address?.includes(selectedZone)) {
          reportData.push({
            'Activity Type': 'Task',
            'Employee ID': record.employees?.employee_id || 'N/A',
            'Employee Name': record.employees?.name || 'N/A',
            'Location': record.location_address || 'N/A',
            'Activity': record.task_type || 'N/A',
            'Time': record.start_time ? new Date(record.start_time).toLocaleString() : 'N/A',
            'Date': record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'
          });
        }
      });

      return reportData.sort((a, b) => new Date(b.Time).getTime() - new Date(a.Time).getTime());
    } catch (error) {
      console.error('Error generating zone activities report:', error);
      throw error;
    }
  };

  const generateReport = async () => {
    if (!reportType) {
      toast({
        title: "Missing Information",
        description: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      let reportData: any[] = [];
      let fileName = '';

      switch (reportType) {
        case 'employee_attendance':
          reportData = await generateEmployeeAttendanceReport();
          fileName = `Employee_Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        
        case 'task_submissions':
          reportData = await generateTaskSubmissionsReport();
          fileName = `Task_Submissions_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        
        case 'zone_activities':
          reportData = await generateZoneActivitiesReport();
          fileName = `Zone_Activities_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        
        default:
          throw new Error('Unsupported report type');
      }

      if (reportData.length === 0) {
        toast({
          title: "No Data Found",
          description: "No data available for the selected criteria",
          variant: "destructive"
        });
        return;
      }

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

      // Download the file
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Report Generated",
        description: `${reportData.length} records exported successfully`,
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports Generator</CardTitle>
          <CardDescription>
            Generate and download various reports in Excel format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType === 'zone_activities' && (
              <div>
                <Label htmlFor="zone">Zone (Optional)</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone or leave empty for all" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Zones</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.name}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate & Download Report'}</span>
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Report Types Available:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Employee Attendance:</strong> Check-in/out records with location and timing</li>
              <li>• <strong>Task Submissions:</strong> All task submissions with status and feedback</li>
              <li>• <strong>Zone Activities:</strong> Combined attendance and task activities by location</li>
              <li>• <strong>Employee Performance:</strong> Summary of employee activities and ratings</li>
              <li>• <strong>Payroll Summary:</strong> Salary and deductions summary by employee</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedReportDownloader;
