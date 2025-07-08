
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, Edit, Save, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  salary: number;
}

interface PayrollData {
  employee_id: string;
  name: string;
  basic_salary: number;
  advance_deduction: number;
  asset_emi_deduction: number;
  other_deductions: number;
  net_salary: number;
}

const PayrollManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PayrollData>>({});

  useEffect(() => {
    fetchEmployees();
    calculatePayroll();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, name, department, salary, role')
        .eq('is_active', true)
        .eq('role', 'employee'); // Only include employees in payroll

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };

  const calculatePayroll = async () => {
    try {
      // Fetch advance deductions
      const { data: advances, error: advanceError } = await supabase
        .from('advance_requests')
        .select('employee_id, amount')
        .eq('status', 'approved');

      // Fetch asset EMI deductions
      const { data: assetEMIs, error: emiError } = await supabase
        .from('asset_requests')
        .select('employee_id, monthly_emi')
        .eq('status', 'approved')
        .gt('monthly_emi', 0);

      if (advanceError) throw advanceError;
      if (emiError) throw emiError;

      // Calculate payroll for each employee
      const payroll = employees.map(emp => {
        const empAdvances = (advances || [])
          .filter(a => a.employee_id === emp.id)
          .reduce((sum, a) => sum + (a.amount || 0), 0);

        const empEMIs = (assetEMIs || [])
          .filter(a => a.employee_id === emp.id)
          .reduce((sum, a) => sum + (a.monthly_emi || 0), 0);

        const basicSalary = emp.salary || 0;
        const totalDeductions = empAdvances + empEMIs;
        const netSalary = basicSalary - totalDeductions;

        return {
          employee_id: emp.employee_id,
          name: emp.name,
          basic_salary: basicSalary,
          advance_deduction: empAdvances,
          asset_emi_deduction: empEMIs,
          other_deductions: 0,
          net_salary: netSalary
        };
      });

      setPayrollData(payroll);
    } catch (error) {
      console.error('Error calculating payroll:', error);
      toast({
        title: "Error",
        description: "Failed to calculate payroll",
        variant: "destructive"
      });
    }
  };

  const startEditing = (employeeId: string) => {
    const employee = payrollData.find(p => p.employee_id === employeeId);
    if (employee) {
      setEditingEmployee(employeeId);
      setEditData(employee);
    }
  };

  const saveEdits = async () => {
    if (!editingEmployee) return;

    try {
      // Update the local state
      setPayrollData(prev => 
        prev.map(p => 
          p.employee_id === editingEmployee 
            ? { ...p, ...editData, net_salary: (editData.basic_salary || 0) - (editData.advance_deduction || 0) - (editData.asset_emi_deduction || 0) - (editData.other_deductions || 0) }
            : p
        )
      );

      setEditingEmployee(null);
      setEditData({});

      toast({
        title: "Payroll Updated",
        description: "Employee payroll has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating payroll:', error);
      toast({
        title: "Error",
        description: "Failed to update payroll",
        variant: "destructive"
      });
    }
  };

  const cancelEditing = () => {
    setEditingEmployee(null);
    setEditData({});
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(payrollData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
    XLSX.writeFile(wb, `payroll_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "Payroll data has been exported to Excel",
    });
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as PayrollData[];
        
        setPayrollData(jsonData);
        
        toast({
          title: "Import Successful",
          description: "Payroll data has been imported from Excel",
        });
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast({
          title: "Import Failed",
          description: "Failed to import Excel file",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
          <CardDescription>
            Manage employee salaries, deductions, and payroll processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <Button onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                style={{ display: 'none' }}
                id="excel-import"
              />
              <Button
                onClick={() => document.getElementById('excel-import')?.click()}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import from Excel
              </Button>
            </div>
            <Button onClick={calculatePayroll} variant="outline">
              Recalculate Payroll
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Advance Deduction</TableHead>
                  <TableHead>Asset EMI</TableHead>
                  <TableHead>Other Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell className="font-medium">{employee.employee_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>
                      {editingEmployee === employee.employee_id ? (
                        <Input
                          type="number"
                          value={editData.basic_salary || 0}
                          onChange={(e) => setEditData({...editData, basic_salary: parseFloat(e.target.value) || 0})}
                          className="w-24"
                        />
                      ) : (
                        `₹${employee.basic_salary}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEmployee === employee.employee_id ? (
                        <Input
                          type="number"
                          value={editData.advance_deduction || 0}
                          onChange={(e) => setEditData({...editData, advance_deduction: parseFloat(e.target.value) || 0})}
                          className="w-24"
                        />
                      ) : (
                        `₹${employee.advance_deduction}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEmployee === employee.employee_id ? (
                        <Input
                          type="number"
                          value={editData.asset_emi_deduction || 0}
                          onChange={(e) => setEditData({...editData, asset_emi_deduction: parseFloat(e.target.value) || 0})}
                          className="w-24"
                        />
                      ) : (
                        `₹${employee.asset_emi_deduction}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEmployee === employee.employee_id ? (
                        <Input
                          type="number"
                          value={editData.other_deductions || 0}
                          onChange={(e) => setEditData({...editData, other_deductions: parseFloat(e.target.value) || 0})}
                          className="w-24"
                        />
                      ) : (
                        `₹${employee.other_deductions}`
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{editingEmployee === employee.employee_id 
                        ? (editData.basic_salary || 0) - (editData.advance_deduction || 0) - (editData.asset_emi_deduction || 0) - (editData.other_deductions || 0)
                        : employee.net_salary
                      }
                    </TableCell>
                    <TableCell>
                      {editingEmployee === employee.employee_id ? (
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={saveEdits}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(employee.employee_id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollManagement;
