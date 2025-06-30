
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PayslipsViewProps {
  onBack: () => void;
}

const PayslipsView = ({ onBack }: PayslipsViewProps) => {
  const { user } = useAuth();

  // Mock payslip data
  const payslips = [
    { id: '1', month: 'December 2024', amount: '₹25,000', status: 'Paid' },
    { id: '2', month: 'November 2024', amount: '₹25,000', status: 'Paid' },
    { id: '3', month: 'October 2024', amount: '₹24,500', status: 'Paid' },
    { id: '4', month: 'September 2024', amount: '₹25,000', status: 'Paid' },
  ];

  const handleDownload = (payslipId: string, month: string) => {
    console.log(`Downloading payslip for ${month} (ID: ${payslipId})`);
    alert(`Payslip for ${month} downloaded successfully!`);
  };

  const handleView = (payslipId: string, month: string) => {
    console.log(`Viewing payslip for ${month} (ID: ${payslipId})`);
    alert(`Opening payslip for ${month}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>My Payslips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payslips.map((payslip) => (
              <Card key={payslip.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{payslip.month}</h3>
                      <p className="text-lg font-bold text-green-600">{payslip.amount}</p>
                      <p className="text-sm text-muted-foreground">Status: {payslip.status}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(payslip.id, payslip.month)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleDownload(payslip.id, payslip.month)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipsView;
