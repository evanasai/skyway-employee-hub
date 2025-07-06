import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeManagement from '@/components/EmployeeManagement';
import TaskManagement from '@/components/TaskManagement';
import ReportDownloader from '@/components/ReportDownloader';
import InventoryManagement from '@/components/InventoryManagement';
import { BarChart3, Users, CheckSquare, FileText, Package, MapPin } from 'lucide-react';
import { User } from '@/types';
import GoogleMapsZoneEditor from './GoogleMapsZoneEditor';

interface AdminDashboardProps {
  user: User | null;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      // Redirect or handle unauthorized access
      console.warn('Unauthorized access to Admin Dashboard');
      // Example: window.location.href = '/';
    }
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Employees</h3>
              <p className="text-2xl font-bold text-gray-900">120</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Active Tasks</h3>
              <p className="text-2xl font-bold text-gray-900">35</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Pending Reports</h3>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Inventory Items</h3>
              <p className="text-2xl font-bold text-gray-900">280</p>
            </div>
          </div>
        );
      
      case 'employees':
        return <EmployeeManagement />;
      
      case 'tasks':
        return <TaskManagement />;
      
      case 'reports':
        return <ReportDownloader onBack={() => setActiveTab('tasks')} />;
      
      case 'inventory':
        return <InventoryManagement />;
      
      case 'zones':
        return <GoogleMapsZoneEditor onBack={() => setActiveTab('dashboard')} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user?.role}
              </span>
            </div>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'zones', label: 'Zones', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
