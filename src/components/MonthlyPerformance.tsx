
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, CheckCircle, DollarSign, CreditCard, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MonthlyPerformanceProps {
  onBack: () => void;
}

interface PerformanceData {
  daysAttended: number;
  leaveDays: number;
  tasksCompleted: number;
  advanceTaken: number;
  baseSalary: number;
  calculatedSalary: number;
  esiAmount: number;
  pfAmount: number;
  emiPlans: Array<{
    asset_name: string;
    monthly_emi: number;
    remaining_amount: number;
  }>;
}

const MonthlyPerformance = ({ onBack }: MonthlyPerformanceProps) => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user, selectedMonth, selectedYear]);

  const fetchPerformanceData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (!employee) throw new Error('Employee not found');

      // Get performance summary
      const { data: summary } = await supabase
        .from('monthly_performance_summary')
        .select('*')
        .eq('employee_id', employee.id)
        .single();

      // Get attendance data for the selected month
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
      const endOfMonth = new Date(selectedYear, selectedMonth, 0).toISOString();

      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('check_in_time', startOfMonth)
        .lte('check_in_time', endOfMonth)
        .eq('status', 'checked_out');

      // Get leave requests for the selected month
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('status', 'approved')
        .gte('start_date', startOfMonth.split('T')[0])
        .lte('end_date', endOfMonth.split('T')[0]);

      // Get tasks for the selected month
      const { data: tasks } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      // Get advance requests for the selected month
      const { data: advances } = await supabase
        .from('advance_requests')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('status', 'approved')
        .gte('request_date', startOfMonth)
        .lte('request_date', endOfMonth);

      // Get active EMI plans
      const { data: emiPlans } = await supabase
        .from('asset_requests')
        .select(`
          *,
          assets (name)
        `)
        .eq('employee_id', employee.id)
        .eq('status', 'approved')
        .eq('payment_type', 'emi_plan');

      const daysAttended = attendance?.length || 0;
      const leaveDays = leaves?.reduce((total, leave) => {
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        return total + (Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      }, 0) || 0;

      const tasksCompleted = tasks?.length || 0;
      const advanceTaken = advances?.reduce((total, advance) => total + advance.amount, 0) || 0;

      // Calculate salary based on days attended (assuming 30 days in a month)
      const dailySalary = employee.salary / 30;
      const calculatedSalary = dailySalary * daysAttended;
      
      // Calculate ESI (1.75% of salary) and PF (12% of salary)
      const esiAmount = calculatedSalary * 0.0175;
      const pfAmount = calculatedSalary * 0.12;

      const performanceData: PerformanceData = {
        daysAttended,
        leaveDays,
        tasksCompleted,
        advanceTaken,
        baseSalary: employee.salary,
        calculatedSalary,
        esiAmount,
        pfAmount,
        emiPlans: emiPlans?.map(plan => ({
          asset_name: plan.assets?.name || 'Unknown Asset',
          monthly_emi: plan.monthly_emi,
          remaining_amount: plan.total_amount - (plan.monthly_emi * 
            Math.floor((new Date().getTime() - new Date(plan.request_date).getTime()) / (1000 * 60 * 60 * 24 * 30)))
        })) || []
      };

      setPerformanceData(performanceData);

      // Create chart data
      const chartData = [
        { name: 'Days Attended', value: daysAttended, color: '#8884d8' },
        { name: 'Leave Days', value: leaveDays, color: '#82ca9d' },
        { name: 'Tasks Completed', value: tasksCompleted, color: '#ffc658' }
      ];

      setChartData(chartData);

    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    toast({
      title: "Download Started",
      description: "Performance data is being prepared for download",
    });
    // Excel download functionality would be implemented here
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Monthly Performance</h1>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Monthly Performance</h1>
        </div>
        <Button onClick={downloadExcel} className="flex items-center space-x-2">
          <FileDown className="h-4 w-4" />
          <span>Download Excel</span>
        </Button>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Performance Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      {performanceData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Attended</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.daysAttended}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.leaveDays}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.tasksCompleted}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Advance Taken</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{performanceData.advanceTaken}</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Salary Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <span className="font-bold">₹{performanceData.baseSalary}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calculated Salary (Based on {performanceData.daysAttended} days):</span>
                  <span className="font-bold">₹{performanceData.calculatedSalary.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>ESI Deduction (1.75%):</span>
                  <span>-₹{performanceData.esiAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>PF Deduction (12%):</span>
                  <span>-₹{performanceData.pfAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Advance Taken:</span>
                  <span>-₹{performanceData.advanceTaken}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Net Salary:</span>
                  <span>₹{(performanceData.calculatedSalary - performanceData.esiAmount - performanceData.pfAmount - performanceData.advanceTaken).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EMI Plans */}
          {performanceData.emiPlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active EMI Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.emiPlans.map((emi, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{emi.asset_name}</div>
                        <div className="text-sm text-gray-600">Monthly EMI: ₹{emi.monthly_emi}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Outstanding: ₹{emi.remaining_amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyPerformance;
