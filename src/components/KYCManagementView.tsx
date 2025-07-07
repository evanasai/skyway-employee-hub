
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, UserPlus, FileCheck } from 'lucide-react';
import KYCManagement from './KYCManagement';
import KYCSubmissionForm from './KYCSubmissionForm';

const KYCManagementView = () => {
  const [selectedEmployeeForSubmission, setSelectedEmployeeForSubmission] = useState<string>('');

  const handleSubmissionComplete = () => {
    setSelectedEmployeeForSubmission('');
    // Optionally refresh the KYC management view
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Employee Verification (KYC)</span>
          </CardTitle>
          <CardDescription>
            Manage employee KYC verification, documentation, and submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="management" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="management" className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4" />
                <span>KYC Management</span>
              </TabsTrigger>
              <TabsTrigger value="submission" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Submit KYC</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="management" className="mt-6">
              <KYCManagement />
            </TabsContent>
            
            <TabsContent value="submission" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Submit KYC for Employee</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    As an admin, you can submit KYC details on behalf of employees
                  </p>
                </div>
                
                {selectedEmployeeForSubmission ? (
                  <KYCSubmissionForm 
                    employeeId={selectedEmployeeForSubmission}
                    onSubmissionComplete={handleSubmissionComplete}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500 text-center">
                        Please select an employee from the KYC Management tab to submit their details, 
                        or use the employee selection in the form above.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCManagementView;
