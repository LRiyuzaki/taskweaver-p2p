
import React from "react";
import { 
  BarChart2, 
  ClipboardList, 
  Database, 
  FileText, 
  Home, 
  LayoutDashboard, 
  Settings, 
  Users, 
  HelpCircle,
  PlusSquare,
  FileBarChart2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AppSidebarLinks() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const LinkItem = ({ to, icon, children }: { to: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <Button
      variant={isActive(to) ? "secondary" : "ghost"}
      className="w-full justify-start"
      onClick={() => navigate(to)}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </Button>
  );

  return (
    <>
      <LinkItem to="/" icon={<Home className="h-4 w-4" />}>
        Home
      </LinkItem>

      <LinkItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
        Dashboard
      </LinkItem>

      <LinkItem to="/tasks" icon={<ClipboardList className="h-4 w-4" />}>
        Case Management
      </LinkItem>

      <LinkItem to="/task-templates" icon={<PlusSquare className="h-4 w-4" />}>
        Templates
      </LinkItem>

      <LinkItem to="/bulk-task-creation" icon={<FileText className="h-4 w-4" />}>
        Bulk Creation
      </LinkItem>

      <LinkItem to="/client-management" icon={<Users className="h-4 w-4" />}>
        Clients
      </LinkItem>

      <LinkItem to="/task-column" icon={<BarChart2 className="h-4 w-4" />}>
        Task Board
      </LinkItem>

      <LinkItem to="/reports-list" icon={<FileBarChart2 className="h-4 w-4" />}>
        Reports
      </LinkItem>

      <LinkItem to="/database" icon={<Database className="h-4 w-4" />}>
        Database
      </LinkItem>

      <LinkItem to="/settings" icon={<Settings className="h-4 w-4" />}>
        Settings
      </LinkItem>

      <LinkItem to="/help" icon={<HelpCircle className="h-4 w-4" />}>
        Help
      </LinkItem>
    </>
  );
}
