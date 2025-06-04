
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ClipboardList, 
  Users, 
  BarChart, 
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/tasks', icon: ClipboardList, label: 'Tasks' },
    { path: '/client-management', icon: Users, label: 'Clients' },
    { path: '/reports', icon: BarChart, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];
  
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (path === '/client-management') {
      return location.pathname.startsWith('/client');
    }
    if (path === '/reports') {
      return location.pathname.includes('report');
    }
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center justify-center h-12 px-2 text-xs",
              isActive(path) ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
            onClick={() => navigate(path)}
          >
            <Icon className="h-4 w-4 mb-1" />
            <span className="text-[10px]">{label}</span>
          </Button>
        ))}
        
        {/* Quick Add Button */}
        <Button
          size="sm"
          className="flex flex-col items-center justify-center h-12 px-2 text-xs"
          onClick={() => {
            // This could open a quick add dialog or navigate to a quick add page
            navigate('/tasks');
          }}
        >
          <Plus className="h-4 w-4 mb-1" />
          <span className="text-[10px]">Add</span>
        </Button>
      </nav>
    </div>
  );
};
