
import React from 'react';
import { 
  Home, 
  Settings, 
  Database, 
  Users, 
  ClipboardList, 
  Calendar, 
  FileText, 
  BarChart2,
  MessageSquare,
  Bell
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-16 border-b px-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            CM
          </div>
          <span>ClientMaster</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${isActive('/') ? 'bg-accent' : ''}`} 
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${isActive('/client-management') ? 'bg-accent' : ''}`}
                  onClick={() => navigate('/client-management')}
                >
                  <Users className="h-4 w-4" />
                  <span>Client Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${isActive('/accounting') ? 'bg-accent' : ''}`}
                  onClick={() => navigate('/accounting')}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Practice Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${isActive('/database') ? 'bg-accent' : ''}`}
                  onClick={() => navigate('/database')}
                >
                  <Database className="h-4 w-4" />
                  <span>Database</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3`}
                  onClick={() => navigate('/calendar')}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <BarChart2 className="h-4 w-4" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <span>Communications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${isActive('/settings') ? 'bg-accent' : ''}`} 
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${isActive('/advanced-settings') ? 'bg-accent' : ''}`} 
                  onClick={() => navigate('/advanced-settings')}
                >
                  <Settings className="h-4 w-4" />
                  <span>Advanced Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
