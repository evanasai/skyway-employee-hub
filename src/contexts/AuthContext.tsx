
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('skyway_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('Loaded saved user:', parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('skyway_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('Attempting login for:', employeeId);
    
    try {
      // Query the employees table directly for authentication
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      console.log('Employee query result:', { employee, error });

      if (error || !employee) {
        console.log('No employee found or error:', error);
        setIsLoading(false);
        return false;
      }

      // Check password - now using the numeric password field from the database
      if (employee.password && parseInt(password) === employee.password) {
        const userWithLogin: User = {
          id: employee.id,
          employeeId: employee.employee_id,
          name: employee.name,
          email: employee.email,
          role: employee.role as 'employee' | 'supervisor' | 'admin' | 'super_admin',
          department: employee.department,
          phone: employee.phone,
          isActive: employee.is_active,
          checkInStatus: 'out' as 'in' | 'out' | 'idle',
          lastLogin: new Date()
        };
        
        console.log('Login successful for user:', userWithLogin);
        setUser(userWithLogin);
        localStorage.setItem('skyway_user', JSON.stringify(userWithLogin));
        setIsLoading(false);
        return true;
      }
      
      console.log('Password mismatch');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('skyway_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
