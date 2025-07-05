
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Download, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReportDownloaderProps {
  onBack: () => void;
}

const ReportDownloader = ({ onBack }: ReportDownloaderProps) => {
  const [reportType, setReportType] = useState('attendance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reportColumns = {
    attendance: [
      { id: 'date', label: 'Date' },
      { id: 'employee_id', label: 'Employee ID' },
      { id: 'employee_name', label: 'Employee Name' },
      { id: 'check_in_time', label: 'Check In Time' },
      { id: 'check_out_time', label: 'Check Out Time' },
      { id: 'location_address', label: 'Location' },
      { id: 'status', label: 'Status' }
    ],
    tasks: [
      { id: 'date', label: 'Date' },
      { id: 'employee_id', label: 'Employee ID' },
      { id: 'employee_name', label: 'Employee Name' },
      { id: 'task_type', label: 'Task Type' },
      { id: 'task_description', label: 'Description' },
      { id: 'start_time', label: 'Start Time' },
      { id: 'end_time', label: 'End Time' },
      { id: 'status', label: 'Status' }
    ],
    assets: [
      { id: 'date', label: 'Date' },
      { id: 'employee_id', label: 'Employee ID' },
      { id: 'employee_name', label: 'Employee Name' },
      { id: 'asset_name', label: 'Asset Name' },
      { id: 'quantity', label: 'Quantity' },
      { id: 'total_amount', label: 'Total Amount' },
      { id: 'payment_type', label: 'Payment Type' },
      { id: 'status', label: 'Status' }
    ]
  };

  useEffect(() => {
    fetchEmployees();
    fetchZones();
    // Set default columns for attendance
    setSelectedColumns(['date', 'employee_name', 'check_in_time', 'check_out_time', 'status']);
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, name')
        .eq('is_active', true);
      
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
        .eq('is_active', true);
      
      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return [];
    }

    try {
      let query;
      
      if (reportType === 'attendance') {
        query = supabase
          .from('attendance')
          .select(`
            *,
            employees!attendance_employee_id_fkey(employee_id, name)
          `)
          .gte('check_in_time', startDate)
          .lte('check_in_time', endDate);
      } else if (reportType === 'tasks') {
        query = supabase
          .from('task_submissions')
          .select(`
            *,
            employees!task_submissions_employee_id_fkey(employee_id, name)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      } else if (reportType === 'assets') {
        query = supabase
          .from('asset_requests')
          .select(`
            *,
            employees!asset_requests_employee_id_fkey(employee_id, name),
            assets!asset_requests_asset_id_fkey(name)
          `)
          .gte('request_date', startDate)
          .lte('request_date', endDate);
      }

      if (selectedEmployee && query) {
        const employee = employees.find(emp => emp.id === selectedEmployee);
        if (employee) {
          query = query.eq('employee_id', employee.id);
        }
      }

      const { data, error } = await query!.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive"
      });
      return [];
    }
  };

  const downloadReport = async () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one column",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchReportData();
      
      if (data.length === 0) {
        toast({
          title: "No Data",
          description: "No data found for the selected criteria",
        });
        setIsLoading(false);
        return;
      }

      // Transform data based on selected columns
      const transformedData = data.map(row => {
        const transformedRow: any = {};
        
        selectedColumns.forEach(columnId => {
          switch (columnId) {
            case 'date':
              if (reportType === 'attendance' && row.check_in_time) {
                transformedRow[columnId] = new Date(row.check_in_time).toLocaleDateString();
              } else if (row.created_at) {
                transformedRow[columnId] = new Date(row.created_at).toLocaleDateString();
              } else if (row.request_date) {
                transformedRow[columnId] = new Date(row.request_date).toLocaleDateString();
              }
              break;
            case 'employee_id':
              transformedRow[columnId] = row.employees?.employee_id || '';
              break;
            case 'employee_name':
              transformedRow[columnId] = row.employees?.name || '';
              break;
            case 'asset_name':
              transformedRow[columnId] = row.assets?.name || '';
              break;
            case 'check_in_time':
              transformedRow[columnId] = row.check_in_time ? 
                new Date(row.check_in_time).toLocaleTimeString() : '';
              break;
            case 'check_out_time':
              transformedRow[columnId] = row.check_out_time ? 
                new Date(row.check_out_time).toLocaleTimeString() : 'Not checked out';
              break;
            case 'start_time':
              transformedRow[columnId] = row.start_time ? 
                new Date(row.start_time).toLocaleTimeString() : '';
              break;
            case 'end_time':
              transformedRow[columnId] = row.end_time ? 
                new Date(row.end_time).toLocaleTimeString() : '';
              break;
            default:
              transformedRow[columnId] = row[columnId] || '';
          }
        });
        
        return transformedRow;
      });

      // Create CSV content
      const headers = selectedColumns.map(columnId => 
        reportColumns[reportType as keyof typeof reportColumns]
          .find(col => col.id === columnId)?.label || columnId
      );
      
      const csvContent = [
        headers.join(','),
        ...transformedData.map(row => 
          selectedColumns.map(col => `"${row[col] || ''}"`).join(',')
        )
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-6 w-6" />
              <span>Download Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="tasks">Task Report</SelectItem>
                  <SelectItem value="assets">Asset Request Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Filter by Employee (Optional)</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zone">Filter by Zone (Optional)</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="All zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Zones</SelectItem>
                    {zones.map((zone) => (
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
              <Label>Select Columns to Include</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {reportColumns[reportType as keyof typeof reportColumns].map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.id}
                      checked={selectedColumns.includes(column.id)}
                      onCheckedChange={() => handleColumnToggle(column.id)}
                    />
                    <Label htmlFor={column.id} className="text-sm">
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button onClick={downloadReport} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Download Report'}
                <Download className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportDownloader;
