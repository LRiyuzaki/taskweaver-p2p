
import React from 'react';
import { 
  Home, 
  ListTodo, 
  Users, 
  BarChart, 
  Settings,
  HelpCircle,
  DatabaseIcon,
  Calendar,
  UserCheck,
  UsersRound,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export interface AppSidebarLink {
  title: string;
  icon?: React.ReactNode;
  href: string;
  children?: AppSidebarLink[];
}

export const appSidebarLinks: AppSidebarLink[] = [
  {
    title: 'Dashboard',
    icon: <Home className="mr-2 h-4 w-4" />,
    href: '/dashboard'
  },
  {
    title: 'Tasks',
    icon: <ListTodo className="mr-2 h-4 w-4" />,
    href: '/tasks',
    children: [
      {
        title: 'All Tasks',
        href: '/tasks'
      },
      {
        title: 'Bulk Create',
        href: '/tasks/bulk-create'
      },
      {
        title: 'Templates',
        href: '/tasks/templates'
      }
    ]
  },
  {
    title: 'Clients',
    icon: <Users className="mr-2 h-4 w-4" />,
    href: '/clients',
    children: [
      {
        title: 'All Clients',
        href: '/clients'
      },
      {
        title: 'Create Client',
        href: '/clients/new'
      },
      {
        title: 'Client Groups',
        href: '/clients/groups'
      }
    ]
  },
  {
    title: 'Calendar',
    icon: <Calendar className="mr-2 h-4 w-4" />,
    href: '/calendar'
  },
  {
    title: 'Team',
    icon: <UsersRound className="mr-2 h-4 w-4" />,
    href: '/team',
    children: [
      {
        title: 'Team Members',
        href: '/team/members'
      },
      {
        title: 'Attendance',
        href: '/attendance'
      }
    ]
  },
  {
    title: 'Time & Work',
    icon: <FileSpreadsheet className="mr-2 h-4 w-4" />,
    href: '/work',
    children: [
      {
        title: 'Timesheet',
        href: '/work/timesheet'
      },
      {
        title: 'Approval',
        href: '/work/approval'
      }
    ]
  },
  {
    title: 'Compliance',
    icon: <UserCheck className="mr-2 h-4 w-4" />,
    href: '/compliance'
  },
  {
    title: 'Documents',
    icon: <FileText className="mr-2 h-4 w-4" />,
    href: '/documents'
  },
  {
    title: 'Reports',
    icon: <BarChart className="mr-2 h-4 w-4" />,
    href: '/reports'
  },
  {
    title: 'Database',
    icon: <DatabaseIcon className="mr-2 h-4 w-4" />,
    href: '/database'
  },
  {
    title: 'Settings',
    icon: <Settings className="mr-2 h-4 w-4" />,
    href: '/settings'
  },
  {
    title: 'Help',
    icon: <HelpCircle className="mr-2 h-4 w-4" />,
    href: '/help'
  }
];
