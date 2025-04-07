
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Calendar,
  ClipboardList,
  Users,
  HelpCircle,
  GitMerge,
  FilePlus
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon: Icon, 
  label,
  end = false
}) => {
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => `
        flex items-center gap-2 px-3 py-2 rounded-md text-sm
        ${isActive 
          ? 'bg-accent text-accent-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
      `}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
};

export const AppSidebarLinks = () => {
  return (
    <div className="space-y-1 py-2">
      <SidebarLink to="/" icon={Home} label="Dashboard" end />
      <SidebarLink to="/tasks" icon={ClipboardList} label="Tasks" />
      <SidebarLink to="/task-templates" icon={GitMerge} label="Task Templates" />
      <SidebarLink to="/bulk-tasks" icon={FilePlus} label="Bulk Task Creation" />
      <SidebarLink to="/client-management" icon={Users} label="Clients" />
      <SidebarLink to="/settings" icon={Settings} label="Settings" />
      <SidebarLink to="/help" icon={HelpCircle} label="Help" />
    </div>
  );
};
