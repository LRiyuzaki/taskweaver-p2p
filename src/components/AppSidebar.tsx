
import React from 'react';
import { Home, PlusCircle, Calendar, Settings, Users, Tag } from 'lucide-react';
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
            TW
          </div>
          <span>TaskWeaver</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="/">
                    <Home className="h-4 w-4" />
                    <span>Board</span>
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
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Teams</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <Users className="h-4 w-4" />
                    <span>My Team</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3" asChild>
                  <a href="#">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Team</span>
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
