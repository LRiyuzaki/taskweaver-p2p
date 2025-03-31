
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

export function AppSidebar() {
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
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <Database className="h-4 w-4" />
                    <span>Database</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <Calendar className="h-4 w-4" />
                    <span>Calendar</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <MessageSquare className="h-4 w-4" />
                    <span>Collaboration</span>
                  </a>
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
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <Briefcase className="h-4 w-4" />
                    <span>All Clients</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <ListFilter className="h-4 w-4" />
                    <span>Categories</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                  </a>
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
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <PlusCircle className="h-4 w-4" />
                    <span>Invite</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
