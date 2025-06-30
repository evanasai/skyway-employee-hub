
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LogOut, 
  User, 
  MapPin, 
  Calendar,
  FileText,
  CreditCard,
  Package,
  Settings,
  Bell
} from 'lucide-react';
import LiveClock from './LiveClock';
import StatusIndicator from './StatusIndicator';
import CheckInButton from './CheckInButton';
import QuickActions from './QuickActions';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [checkInStatus, setCheckInStatus] = useState<'in' | 'out' | 'idle'>('out');

  const handleCheckIn = () => {
    setCheckInStatus('in');
  };

  const handleCheckOut = () => {
    setCheckInStatus('out');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-sm">SW</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Skyway Networks</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <Card className="gradient-bg text-white">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back, {user?.name}!</CardTitle>
                <CardDescription className="text-blue-100">
                  Employee ID: {user?.employeeId} | Department: {user?.department}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Live Clock */}
            <LiveClock />

            {/* Status & Check-in */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatusIndicator status={checkInStatus} />
              <Card>
                <CardContent className="p-6">
                  <CheckInButton
                    isCheckedIn={checkInStatus === 'in'}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <QuickActions />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">{user?.phone}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    Address Details
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Attendance History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Days Present</span>
                  <span className="font-semibold text-green-600">22/24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="font-semibold text-blue-600">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Requests</span>
                  <span className="font-semibold text-orange-600">2</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span className="font-bold text-primary">92%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
