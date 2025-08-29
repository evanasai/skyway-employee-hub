import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Download, Edit, Users, Clock, MapPin, Filter, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_emp_id: string;
  department: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'checked_in' | 'checked_out' | 'on_break';
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  duration_minutes: number;
}

const AttendanceSummaryView = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchDepartments();
    fetchAttendanceRecords();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        () => {
          fetchAttendanceRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, startDate, endDate, statusFilter, departmentFilter]);

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

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          employee_id,
          check_in_time,
          check_out_time,
          status,
          location_address,
          location_lat,
          location_lng,
          employees!inner(
            id,
            employee_id,
            name,
            department
          )
        `)
        .gte('check_in_time', format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd'))
        .order('check_in_time', { ascending: false });

      if (error) throw error;

      const formattedRecords: AttendanceRecord[] = (data || []).map((record: any) => ({
        id: record.id,
        employee_id: record.employee_id,
        employee_name: record.employees?.name || 'Unknown',
        employee_emp_id: record.employees?.employee_id || 'N/A',
        department: record.employees?.department || 'Unknown',
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time,
        status: record.status,
        location_address: record.location_address,
        location_lat: record.location_lat,
        location_lng: record.location_lng,
        duration_minutes: record.check_in_time && record.check_out_time 
          ? Math.round((new Date(record.check_out_time).getTime() - new Date(record.check_in_time).getTime()) / (1000 * 60))
          : 0
      }));

      setAttendanceRecords(formattedRecords);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    // Date filter
    filtered = filtered.filter(record => {
      if (!record.check_in_time) return false;
      const recordDate = new Date(record.check_in_time);
      return recordDate >= startDate && recordDate <= new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    });

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(record => record.department === departmentFilter);
    }

    setFilteredRecords(filtered);
  };

  const handleStatusUpdate = async (recordId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({ status: newStatus })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Attendance status has been updated successfully.",
      });

      fetchAttendanceRecords();
      setShowEditDialog(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating attendance status:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance status",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => ({
      'Employee ID': record.employee_emp_id,
      'Employee Name': record.employee_name,
      'Department': record.department,
      'Check In Time': record.check_in_time ? format(new Date(record.check_in_time), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      'Check Out Time': record.check_out_time ? format(new Date(record.check_out_time), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      'Duration (Minutes)': record.duration_minutes,
      'Status': record.status,
      'Location': record.location_address || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Summary');
    
    const fileName = `attendance_summary_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Export Successful",
      description: `Attendance data exported as ${fileName}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      checked_in: { color: 'bg-green-100 text-green-800', label: 'Active' },
      checked_out: { color: 'bg-gray-100 text-gray-800', label: 'Offline' },
      on_break: { color: 'bg-yellow-100 text-yellow-800', label: 'On Break' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.checked_out;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Attendance Summary</h2>
          <p className="text-muted-foreground">Real-time employee attendance tracking and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Attendance Records</DialogTitle>
                <DialogDescription>
                  Filter attendance records by date range, status, and department
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="checked_in">Active</SelectItem>
                      <SelectItem value="checked_out">Offline</SelectItem>
                      <SelectItem value="on_break">On Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Department</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => setShowFilterDialog(false)} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={exportToExcel} disabled={filteredRecords.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredRecords.filter(r => r.status === 'checked_in').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Break</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredRecords.filter(r => r.status === 'on_break').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {filteredRecords.filter(r => r.status === 'checked_out').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Employee attendance from {format(startDate, 'MMM dd, yyyy')} to {format(endDate, 'MMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading attendance records...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employee_emp_id}</TableCell>
                      <TableCell>{record.employee_name}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>
                        {record.check_in_time ? format(new Date(record.check_in_time), 'MMM dd, HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time ? format(new Date(record.check_out_time), 'MMM dd, HH:mm') : 'Still Active'}
                      </TableCell>
                      <TableCell>{formatDuration(record.duration_minutes)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={record.location_address || 'N/A'}>
                        {record.location_address ? (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {record.location_address}
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRecord(record);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No attendance records found for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance Status</DialogTitle>
            <DialogDescription>
              Manually update the attendance status for {editingRecord?.employee_name}
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="mt-1">{getStatusBadge(editingRecord.status)}</div>
              </div>
              
              <div>
                <Label>New Status</Label>
                <Select 
                  defaultValue={editingRecord.status} 
                  onValueChange={(value) => handleStatusUpdate(editingRecord.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checked_in">Active</SelectItem>
                    <SelectItem value="checked_out">Offline</SelectItem>
                    <SelectItem value="on_break">On Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceSummaryView;