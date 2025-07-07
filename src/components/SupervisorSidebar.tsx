
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { 
  Users, 
  ClipboardList, 
  BarChart3, 
  FileText,
  UserCheck
} from 'lucide-react';

interface SupervisorSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const SupervisorSidebar: React.FC<SupervisorSidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'tasks', label: 'Task Management', icon: ClipboardList },
    { id: 'assignments', label: 'Assignment Management', icon: UserCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Supervisor Panel</SidebarGroupLabel>
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

export default SupervisorSidebar;
