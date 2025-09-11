
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Lock } from 'lucide-react';

const LoginForm = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !password) {
      toast({
        title: "Error",
        description: "Please enter both Employee ID and Password",
        variant: "destructive",
      });
      return;
    }

    const success = await login(employeeId, password);
    
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid Employee ID or Password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Skyway Networks",
        description: "Login successful!",
      });
      // Redirect will be handled automatically by routing
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
              <div className="text-white font-bold text-2xl">SW</div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Skyway Networks
            </CardTitle>
            <CardDescription className="text-lg">
              Employee Management System
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-primary font-medium">
                  Employee ID
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="Enter your Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-accent"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-accent"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold gradient-bg hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p className="mt-4">
                <strong>Phone:</strong> +91 7842288660<br />
                <strong>Email:</strong> info@skywaynetworks.in
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
