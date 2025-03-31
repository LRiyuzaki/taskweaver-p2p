
import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { MenuIcon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-background border-b flex items-center h-16 px-4">
      <SidebarTrigger asChild className="mr-2 md:hidden">
        <Button variant="ghost" size="icon">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SidebarTrigger>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            TW
          </div>
          <span>TaskWeaver</span>
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        {/* Add user profile or other header items here */}
      </div>
    </header>
  );
};
