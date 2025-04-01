
import React from 'react';
import { Home, PlusCircle, Calendar, Settings, Users, Tag, Database, Briefcase, ListFilter, MessageSquare } from 'lucide-react';
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
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
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
                  className={`flex items-center gap-3 ${isActive('/database') ? 'bg-accent' : ''}`}
                  onClick={() => navigate('/database')}
                >
                  <Database className="h-4 w-4" />
                  <span>Database</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <span>Collaboration</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Clients</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4" />
                  <span>All Clients</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <ListFilter className="h-4 w-4" />
                  <span>Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Team</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  <span>Members</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <PlusCircle className="h-4 w-4" />
                  <span>Invite</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={`flex items-center gap-3 ${isActive('/settings') ? 'bg-accent' : ''}`} 
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
