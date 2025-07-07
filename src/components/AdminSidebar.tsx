
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { 
  Users, 
  MapPin, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  FileText,
  DollarSign,
  Package,
  UserCheck,
  Calendar
} from 'lucide-react';

interface AdminSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'zones', label: 'Zone Management', icon: MapPin },
    { id: 'tasks', label: 'Task Management', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance Reports', icon: UserCheck },
    { id: 'payroll', label: 'Payroll Management', icon: DollarSign },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.id)}
                      isActive={currentView === item.id}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
