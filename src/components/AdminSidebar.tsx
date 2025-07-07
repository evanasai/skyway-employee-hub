
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  CheckSquare, 
  Map, 
  UserCheck, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings,
  LayoutDashboard,
  Shield,
  Building,
  UserCog,
  ClipboardCheck
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader
} from '@/components/ui/sidebar';

interface AdminSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const AdminSidebar = ({ currentView, onNavigate }: AdminSidebarProps) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      category: 'main'
    },
    { 
      id: 'employees', 
      label: 'Employee Management', 
      icon: Users,
      category: 'hr'
    },
    { 
      id: 'team-management', 
      label: 'Team Management', 
      icon: Building,
      category: 'hr'
    },
    { 
      id: 'supervisor-assignment', 
      label: 'Supervisor Allocation', 
      icon: UserCog,
      category: 'hr'
    },
    { 
      id: 'kyc-management', 
      label: 'Employee Verification (KYC)', 
      icon: Shield,
      category: 'hr'
    },
    { 
      id: 'enhanced-tasks', 
      label: 'Task Management', 
      icon: CheckSquare,
      category: 'operations'
    },
    { 
      id: 'zones', 
      label: 'Zone Management', 
      icon: Map,
      category: 'operations'
    },
    { 
      id: 'zone-assignment', 
      label: 'Zone Assignment', 
      icon: UserCheck,
      category: 'operations'
    },
    { 
      id: 'inventory', 
      label: 'Inventory Management', 
      icon: Package,
      category: 'finance'
    },
    { 
      id: 'payroll', 
      label: 'Payroll Management', 
      icon: DollarSign,
      category: 'finance'
    },
    { 
      id: 'reports', 
      label: 'Reports & Analytics', 
      icon: BarChart3,
      category: 'analytics'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      category: 'system'
    }
  ];

  const categories = {
    main: 'Overview',
    hr: 'Human Resources',
    operations: 'Operations',
    finance: 'Finance & Assets',
    analytics: 'Analytics',
    system: 'System'
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <Sidebar className="w-64 border-r bg-white">
      <SidebarHeader className="px-6 py-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SW</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">Management Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="flex-1">
          {Object.entries(groupedItems).map(([category, items]) => (
            <SidebarGroup key={category}>
              <SidebarGroupLabel className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {categories[category as keyof typeof categories]}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onNavigate(item.id)}
                        isActive={currentView === item.id}
                        className="w-full justify-start px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-r-2 data-[active=true]:border-blue-600"
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
