
import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { MenuIcon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-background border-b flex items-center h-16 px-4">
      <div className="mr-2 md:hidden">
        <SidebarTrigger>
          <MenuIcon className="h-5 w-5" />
        </SidebarTrigger>
      </div>
      
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
