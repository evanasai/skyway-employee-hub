
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Home,
  ClipboardList,
  Calendar,
  CreditCard,
  Package,
  FileText,
  HelpCircle,
  LogOut,
  TrendingUp,
  FolderOpen,
  User
} from 'lucide-react';

interface EmployeeSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const EmployeeSidebar = ({ currentView, onNavigate }: EmployeeSidebarProps) => {
  const { logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      view: 'dashboard'
    },
    {
      title: 'My Profile',
      icon: User,
      view: 'profile'
    },
    {
      title: 'Monthly Performance',
      icon: TrendingUp,
      view: 'performance'
    },
    {
      title: 'Payslips',
      icon: FileText,
      view: 'payslips'
    },
    {
      title: 'My Documents',
      icon: FolderOpen,
      view: 'documents'
    },
    {
      title: 'Request Leave',
      icon: Calendar,
      view: 'leave'
    },
    {
      title: 'Submit Task',
      icon: ClipboardList,
      view: 'task'
    },
    {
      title: 'Advance Request',
      icon: CreditCard,
      view: 'advance'
    },
    {
      title: 'Asset Request',
      icon: Package,
      view: 'asset'
    },
    {
      title: 'Support',
      icon: HelpCircle,
      view: 'support'
    }
  ];

  return (
    <Sidebar className="w-64 bg-white border-r border-gray-200">
      <SidebarHeader>
        <div className="flex items-center space-x-2 p-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SW</span>
          </div>
          <span className="font-semibold">Skyway Networks</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.view}>
                <SidebarMenuButton
                  onClick={() => onNavigate(item.view)}
                  isActive={currentView === item.view}
                  className="w-full justify-start hover:bg-gray-100"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default EmployeeSidebar;
