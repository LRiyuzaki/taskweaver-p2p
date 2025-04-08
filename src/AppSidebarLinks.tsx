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
  FilePlus,
  LayoutDashboard,
  Check,
  ListChecks,
  BarChart
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

const links = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: <Check className="h-4 w-4" />,
  },
  {
    title: "Client Management",
    href: "/client-management",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Task Templates",
    href: "/task-templates",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    title: "Bulk Task Creation",
    href: "/bulk-tasks",
    icon: <ListChecks className="h-4 w-4" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <BarChart className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Help",
    href: "/help",
    icon: <HelpCircle className="h-4 w-4" />,
  },
];

export const AppSidebarLinks = () => {
  return (
    <div className="space-y-1 py-2">
      {links.map((link) => (
        <SidebarLink key={link.title} to={link.href} icon={link.icon} label={link.title} />
      ))}
    </div>
  );
};
