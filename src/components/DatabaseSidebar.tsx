
import React, { useState } from 'react';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Database, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Search 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTableDialog } from './CreateTableDialog';

export const DatabaseSidebar: React.FC = () => {
  const { tables, activeTableId, setActiveTableId, deleteTable } = useDatabaseContext();
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Sidebar className="w-[280px] border-r">
      <SidebarHeader className="flex items-center h-16 border-b p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Database className="h-5 w-5" />
          <span>Database</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => setIsCreateTableDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Tables</h3>
          </div>
          
          <SidebarMenu>
            {filteredTables.length > 0 ? (
              filteredTables.map(table => (
                <SidebarMenuItem key={table.id}>
                  <div className="flex items-center justify-between w-full">
                    <SidebarMenuButton 
                      className={`flex items-center gap-2 flex-1 ${activeTableId === table.id ? 'bg-accent' : ''}`}
                      onClick={() => setActiveTableId(table.id)}
                    >
                      <span className="truncate">{table.name}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteTable(table.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? "No tables found" : "No tables yet"}
              </div>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>
      
      <CreateTableDialog 
        open={isCreateTableDialogOpen} 
        onOpenChange={setIsCreateTableDialogOpen}
      />
    </Sidebar>
  );
};
