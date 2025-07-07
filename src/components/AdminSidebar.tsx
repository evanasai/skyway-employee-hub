
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
  Calendar,
  UsersRound,
  UserCog,
  Shield,
  Building
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
    { id: 'team-management', label: 'Team Management', icon: UsersRound },
    { id: 'supervisor-assignment', label: 'Supervisor Assignment', icon: UserCog },
    { id: 'kyc-management', label: 'Employee Verification', icon: Shield },
    { id: 'tasks', label: 'Task Management', icon: ClipboardList },
    { id: 'enhanced-tasks', label: 'Department Tasks', icon: Calendar },
    { id: 'inventory', label: 'Asset Management', icon: Package },
    { id: 'payroll', label: 'Payroll Management', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
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
