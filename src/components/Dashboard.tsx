import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LogOut, 
  User, 
  MapPin, 
  Calendar,
  FileText,
  CreditCard,
  Package,
  Settings,
  Bell,
  Menu,
  CheckSquare
} from 'lucide-react';
import LiveClock from './LiveClock';
import StatusIndicator from './StatusIndicator';
import CheckInButton from './CheckInButton';
import QuickActions from './QuickActions';
import TaskSubmissionForm from './TaskSubmissionForm';
import LeaveRequestForm from './LeaveRequestForm';
import AdvanceRequestForm from './AdvanceRequestForm';
import AssetRequestForm from './AssetRequestForm';
import PayslipsView from './PayslipsView';
import SupportView from './SupportView';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [checkInStatus, setCheckInStatus] = useState<'in' | 'out' | 'idle'>('out');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [totalWorkedTime, setTotalWorkedTime] = useState(0);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInStatus('in');
    setCheckInTime(now);
    console.log('Checked in at:', now);
  };

  const handleCheckOut = () => {
    if (checkInTime) {
      const now = new Date();
      const workedSeconds = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
      setTotalWorkedTime(prev => prev + workedSeconds);
      console.log('Worked for:', workedSeconds, 'seconds');
      console.log('Total worked time today:', totalWorkedTime + workedSeconds, 'seconds');
    }
    setCheckInStatus('out');
    setCheckInTime(null);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const ProfileSidebar = () => (
    <div className="flex flex-col h-full p-6 bg-white">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="h-10 w-10 text-white" />
        </div>
        <h3 className="font-semibold text-lg">{user?.name}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <p className="text-sm text-muted-foreground">{user?.phone}</p>
        <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium inline-block">
          {user?.role}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Menu Items */}
      <div className="flex-1 space-y-2">
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => setSidebarOpen(false)}>
          <User className="mr-3 h-5 w-5" />
          My Account
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => setSidebarOpen(false)}>
          <MapPin className="mr-3 h-5 w-5" />
          Address Details
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => setSidebarOpen(false)}>
          <Calendar className="mr-3 h-5 w-5" />
          Attendance History
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => {
          handleNavigate('payslips');
          setSidebarOpen(false);
        }}>
          <CreditCard className="mr-3 h-5 w-5" />
          Payslips
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => setSidebarOpen(false)}>
          <Package className="mr-3 h-5 w-5" />
          Assets Status
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => setSidebarOpen(false)}>
          <FileText className="mr-3 h-5 w-5" />
          Documents
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => {
          handleNavigate('task');
          setSidebarOpen(false);
        }}>
          <CheckSquare className="mr-3 h-5 w-5" />
          Submit Task
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12" onClick={() => setSidebarOpen(false)}>
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Logout Button */}
      <Button 
        variant="destructive" 
        className="w-full justify-start h-12" 
        onClick={() => {
          setSidebarOpen(false);
          logout();
        }}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Logout
      </Button>
    </div>
  );

  if (currentView === 'task') {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex justify-between items-center h-16 px-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="text-primary"
            >
              ← Back to Dashboard
            </Button>
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </div>
        </header>
        <TaskSubmissionForm />
      </div>
    );
  }

  if (currentView === 'leave') {
    return <LeaveRequestForm onBack={handleBackToDashboard} />;
  }

  if (currentView === 'advance') {
    return <AdvanceRequestForm onBack={handleBackToDashboard} />;
  }

  if (currentView === 'asset') {
    return <AssetRequestForm onBack={handleBackToDashboard} />;
  }

  if (currentView === 'payslips') {
    return <PayslipsView onBack={handleBackToDashboard} />;
  }

  if (currentView === 'support') {
    return <SupportView onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <ProfileSidebar />
              </SheetContent>
            </Sheet>

            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <div className="text-white font-bold text-sm">SW</div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Skyway Networks</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <Card className="gradient-bg text-white">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Welcome back, {user?.name}!</CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              Employee ID: {user?.employeeId} | Department: {user?.department}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Live Clock */}
        <LiveClock />

        {/* Status & Check-in */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusIndicator 
            status={checkInStatus} 
            checkInTime={checkInTime}
            totalWorkedTime={totalWorkedTime}
          />
          <Card>
            <CardContent className="p-4">
              <CheckInButton
                isCheckedIn={checkInStatus === 'in'}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Task Submission */}
        {checkInStatus === 'in' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleNavigate('task')}
                className="w-full"
                size="lg"
              >
                <CheckSquare className="mr-2 h-5 w-5" />
                Submit Task Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <QuickActions onNavigate={handleNavigate} />

        {/* Quick Stats - Mobile Optimized */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">22/24</div>
                <div className="text-sm text-muted-foreground">Days Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">18</div>
                <div className="text-sm text-muted-foreground">Tasks Done</div>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">92%</div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
