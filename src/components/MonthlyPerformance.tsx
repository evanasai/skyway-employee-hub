
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyPerformanceProps {
  onBack: () => void;
}

interface PerformanceData {
  days_attended: number;
  leave_days: number;
  tasks_completed: number;
  advance_taken: number;
  base_salary: number;
}

const MonthlyPerformance = ({ onBack }: MonthlyPerformanceProps) => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emiPlans, setEmiPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchPerformanceData();
    fetchEmiPlans();
  }, [user]);

  const fetchPerformanceData = async () => {
    if (!user) return;
    
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        // Calculate current month stats manually
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
        const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString();

        // Get attendance days
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('check_in_time', startOfMonth)
          .lte('check_in_time', endOfMonth);

        // Get leave days
        const { data: leaves } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('status', 'approved')
          .gte('start_date', startOfMonth)
          .lte('start_date', endOfMonth);

        // Get tasks
        const { data: tasks } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('employee_id', employee.id)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        // Get advance taken
        const { data: advances } = await supabase
          .from('advance_requests')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('status', 'approved')
          .gte('request_date', startOfMonth)
          .lte('request_date', endOfMonth);

        const attendanceDays = attendance ? new Set(attendance.map(a => new Date(a.check_in_time).toDateString())).size : 0;
        const leaveDays = leaves ? leaves.reduce((sum, leave) => {
          const start = new Date(leave.start_date);
          const end = new Date(leave.end_date);
          return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }, 0) : 0;
        const tasksCount = tasks ? tasks.length : 0;
        const advanceAmount = advances ? advances.reduce((sum, adv) => sum + Number(adv.amount), 0) : 0;

        setPerformanceData({
          days_attended: attendanceDays,
          leave_days: leaveDays,
          tasks_completed: tasksCount,
          advance_taken: advanceAmount,
          base_salary: employee.salary || 0
        });
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmiPlans = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { data: assetRequests } = await supabase
          .from('asset_requests')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('status', 'approved')
          .eq('payment_type', 'emi');

        setEmiPlans(assetRequests || []);
      }
    } catch (error) {
      console.error('Error fetching EMI plans:', error);
    }
  };

  const calculateSalary = () => {
    if (!performanceData) return { netSalary: 0, esiAmount: 0, pfAmount: 0 };
    
    const workingDays = 26; // Assume 26 working days per month
    const dailySalary = performanceData.base_salary / workingDays;
    const earnedSalary = dailySalary * performanceData.days_attended;
    
    const esiRate = 0.0175; // 1.75%
    const pfRate = 0.12; // 12%
    
    const esiAmount = earnedSalary * esiRate;
    const pfAmount = earnedSalary * pfRate;
    const netSalary = earnedSalary - esiAmount - pfAmount - performanceData.advance_taken;
    
    return { netSalary, esiAmount, pfAmount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div>Loading performance data...</div>
      </div>
    );
  }

  const salaryDetails = calculateSalary();
  const chartData = [
    { name: 'Days Attended', value: performanceData?.days_attended || 0 },
    { name: 'Leave Days', value: performanceData?.leave_days || 0 },
    { name: 'Tasks Completed', value: performanceData?.tasks_completed || 0 },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Monthly Performance</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{performanceData?.days_attended || 0}</div>
                  <div className="text-sm text-gray-600">Days Attended</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{performanceData?.leave_days || 0}</div>
                  <div className="text-sm text-gray-600">Leave Days</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{performanceData?.tasks_completed || 0}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">₹{performanceData?.advance_taken || 0}</div>
                  <div className="text-sm text-gray-600">Advance Taken</div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Salary Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>This Month's Salary Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Salary:</span>
                    <span>₹{performanceData?.base_salary || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Attended: {performanceData?.days_attended || 0}/26</span>
                    <span>₹{Math.round((performanceData?.base_salary || 0) / 26 * (performanceData?.days_attended || 0))}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>ESI (1.75%):</span>
                    <span>-₹{Math.round(salaryDetails.esiAmount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>PF (12%):</span>
                    <span>-₹{Math.round(salaryDetails.pfAmount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Advance Taken:</span>
                    <span>-₹{performanceData?.advance_taken || 0}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Net Salary:</span>
                    <span>₹{Math.round(salaryDetails.netSalary)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active EMI Plans */}
            {emiPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active EMI Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emiPlans.map((emi, index) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Asset Request #{emi.id.slice(0, 8)}</div>
                            <div className="text-sm text-gray-600">Monthly EMI: ₹{emi.monthly_emi}</div>
                            <div className="text-sm text-gray-600">Remaining: {emi.emi_months} months</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">₹{emi.total_amount}</div>
                            <div className="text-sm text-gray-600">Total Amount</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyPerformance;
