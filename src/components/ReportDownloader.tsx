
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Calendar } from 'lucide-react';

interface ReportColumn {
  id: string;
  label: string;
  checked: boolean;
}

const ReportDownloader: React.FC = () => {
  const [reportType, setReportType] = useState<'attendance' | 'tasks' | 'assets'>('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [columns, setColumns] = useState<ReportColumn[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchZones();
    setDefaultColumns();
  }, [reportType]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, employee_id')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const setDefaultColumns = () => {
    let defaultColumns: ReportColumn[] = [];

    switch (reportType) {
      case 'attendance':
        defaultColumns = [
          { id: 'date', label: 'Date', checked: true },
          { id: 'employee_id', label: 'Employee ID', checked: true },
          { id: 'employee_name', label: 'Employee Name', checked: true },
          { id: 'check_in_time', label: 'Check In Time', checked: true },
          { id: 'check_out_time', label: 'Check Out Time', checked: true },
          { id: 'zone', label: 'Zone', checked: true },
          { id: 'location_address', label: 'Location', checked: false },
          { id: 'status', label: 'Status', checked: true },
          { id: 'total_hours', label: 'Total Hours', checked: false }
        ];
        break;
      case 'tasks':
        defaultColumns = [
          { id: 'date', label: 'Date', checked: true },
          { id: 'employee_id', label: 'Employee ID', checked: true },
          { id: 'employee_name', label: 'Employee Name', checked: true },
          { id: 'task_type', label: 'Task Type', checked: true },
          { id: 'start_time', label: 'Start Time', checked: true },
          { id: 'end_time', label: 'End Time', checked: true },
          { id: 'status', label: 'Status', checked: true },
          { id: 'location_address', label: 'Location', checked: false },
          { id: 'comments', label: 'Comments', checked: false }
        ];
        break;
      case 'assets':
        defaultColumns = [
          { id: 'date', label: 'Date', checked: true },
          { id: 'employee_id', label: 'Employee ID', checked: true },
          { id: 'employee_name', label: 'Employee Name', checked: true },
          { id: 'asset_name', label: 'Asset Name', checked: true },
          { id: 'quantity', label: 'Quantity', checked: true },
          { id: 'status', label: 'Status', checked: true },
          { id: 'request_date', label: 'Request Date', checked: false },
          { id: 'approved_date', label: 'Approved Date', checked: false }
        ];
        break;
    }

    setColumns(defaultColumns);
  };

  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, checked: !col.checked } : col
    ));
  };

  const generateReport = async () => {
    const selectedColumns = columns.filter(col => col.checked);
    
    if (selectedColumns.length === 0) {
      toast({
        title: "No Columns Selected",
        description: "Please select at least one column for the report",
        variant: "destructive"
      });
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      toast({
        title: "Date Range Required",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      let query = supabase.from('');
      let data: any[] = [];

      switch (reportType) {
        case 'attendance':
          query = supabase
            .from('attendance')
            .select(`
              *,
              employees:employee_id (name, employee_id)
            `)
            .gte('check_in_time', dateRange.startDate)
            .lte('check_in_time', dateRange.endDate + 'T23:59:59');

          if (selectedEmployee !== 'all') {
            query = query.eq('employee_id', selectedEmployee);
          }

          const { data: attendanceData, error: attendanceError } = await query.order('check_in_time', { ascending: false });
          if (attendanceError) throw attendanceError;
          data = attendanceData || [];
          break;

        case 'tasks':
          query = supabase
            .from('task_submissions')
            .select(`
              *,
              employees:employee_id (name, employee_id)
            `)
            .gte('created_at', dateRange.startDate)
            .lte('created_at', dateRange.endDate + 'T23:59:59');

          if (selectedEmployee !== 'all') {
            query = query.eq('employee_id', selectedEmployee);
          }

          const { data: taskData, error: taskError } = await query.order('created_at', { ascending: false });
          if (taskError) throw taskError;
          data = taskData || [];
          break;

        case 'assets':
          query = supabase
            .from('asset_requests')
            .select(`
              *,
              employees:employee_id (name, employee_id),
              assets:asset_id (name)
            `)
            .gte('request_date', dateRange.startDate)
            .lte('request_date', dateRange.endDate + 'T23:59:59');

          if (selectedEmployee !== 'all') {
            query = query.eq('employee_id', selectedEmployee);
          }

          const { data: assetData, error: assetError } = await query.order('request_date', { ascending: false });
          if (assetError) throw assetError;
          data = assetData || [];
          break;
      }

      // Generate CSV
      const csvContent = generateCSV(data, selectedColumns);
      downloadCSV(csvContent, `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);

      toast({
        title: "Report Generated",
        description: `${reportType} report has been downloaded successfully`,
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

  const generateCSV = (data: any[], selectedColumns: ReportColumn[]) => {
    const headers = selectedColumns.map(col => col.label);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const csvRow = selectedColumns.map(col => {
        let value = '';
        
        switch (col.id) {
          case 'date':
            value = new Date(row.check_in_time || row.created_at || row.request_date).toLocaleDateString();
            break;
          case 'employee_id':
            value = row.employees?.employee_id || '';
            break;
          case 'employee_name':
            value = row.employees?.name || '';
            break;
          case 'check_in_time':
            value = row.check_in_time ? new Date(row.check_in_time).toLocaleString() : '';
            break;
          case 'check_out_time':
            value = row.check_out_time ? new Date(row.check_out_time).toLocaleString() : '';
            break;
          case 'start_time':
            value = row.start_time ? new Date(row.start_time).toLocaleString() : '';
            break;
          case 'end_time':
            value = row.end_time ? new Date(row.end_time).toLocaleString() : '';
            break;
          case 'zone':
            value = row.location_address || '';
            break;
          case 'asset_name':
            value = row.assets?.name || '';
            break;
          case 'total_hours':
            if (row.check_in_time && row.check_out_time) {
              const hours = (new Date(row.check_out_time).getTime() - new Date(row.check_in_time).getTime()) / (1000 * 60 * 60);
              value = hours.toFixed(2);
            }
            break;
          case 'request_date':
            value = row.request_date ? new Date(row.request_date).toLocaleDateString() : '';
            break;
          case 'approved_date':
            value = row.approved_date ? new Date(row.approved_date).toLocaleDateString() : '';
            break;
          default:
            value = row[col.id] || '';
        }
        
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      });
      
      csvRows.push(csvRow.join(','));
    });

    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Custom Report Generator</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate Custom Reports</span>
          </CardTitle>
          <CardDescription>
            Select report type, date range, and columns to generate custom reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="tasks">Task Report</SelectItem>
                  <SelectItem value="assets">Asset Request Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Employee Filter</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Zone Filter</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <Label className="text-base font-medium">Select Columns to Include</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {columns.map(column => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={column.checked}
                    onCheckedChange={() => toggleColumn(column.id)}
                  />
                  <Label htmlFor={column.id} className="text-sm">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="min-w-32"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDownloader;
