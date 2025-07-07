
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { createTestCredentials } from '@/utils/createTestCredentials';
import { Users } from 'lucide-react';

const TestCredentialsButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCredentials = async () => {
    setIsLoading(true);
    try {
      await createTestCredentials();
      toast({
        title: "Test Credentials Created",
        description: "All test user accounts have been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateCredentials} 
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Users className="h-4 w-4 mr-2" />
      {isLoading ? 'Creating...' : 'Create Test Credentials'}
    </Button>
  );
};

export default TestCredentialsButton;
