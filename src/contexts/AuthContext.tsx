
import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john@skyway.com',
    role: 'employee',
    department: 'Field Operations',
    phone: '+91 9876543210',
    isActive: true,
    checkInStatus: 'out'
  },
  {
    id: '2',
    employeeId: 'SUP001',
    name: 'Jane Smith',
    email: 'jane@skyway.com',
    role: 'supervisor',
    department: 'Operations',
    phone: '+91 9876543211',
    isActive: true,
    checkInStatus: 'in'
  },
  {
    id: '3',
    employeeId: 'ADM001',
    name: 'Admin User',
    email: 'admin@skyway.com',
    role: 'admin',
    department: 'Administration',
    phone: '+91 9876543212',
    isActive: true,
    checkInStatus: 'idle'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('skyway_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.employeeId === employeeId);
    
    if (foundUser && password === 'password123') {
      const userWithLogin = {
        ...foundUser,
        lastLogin: new Date()
      };
      setUser(userWithLogin);
      localStorage.setItem('skyway_user', JSON.stringify(userWithLogin));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skyway_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
