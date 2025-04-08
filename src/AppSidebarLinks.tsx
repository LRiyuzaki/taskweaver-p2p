
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
import { Link } from "@/components/ui/sidebar";

export default function AppSidebarLinks() {
  return (
    <>
      <Link to="/" icon={<Home />}>
        Home
      </Link>

      <Link to="/dashboard" icon={<LayoutDashboard />}>
        Dashboard
      </Link>

      <Link to="/tasks" icon={<ClipboardList />}>
        Tasks
      </Link>

      <Link to="/task-templates" icon={<PlusSquare />}>
        Templates
      </Link>

      <Link to="/bulk-task-creation" icon={<FileText />}>
        Bulk Creation
      </Link>

      <Link to="/client-management" icon={<Users />}>
        Clients
      </Link>

      <Link to="/task-column" icon={<BarChart2 />}>
        Task Board
      </Link>

      <Link to="/reports-list" icon={<FileBarChart2 />}>
        Reports
      </Link>

      <Link to="/database" icon={<Database />}>
        Database
      </Link>

      <Link to="/settings" icon={<Settings />}>
        Settings
      </Link>

      <Link to="/help" icon={<HelpCircle />}>
        Help
      </Link>
    </>
  );
}
