
import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import ClientManagement from "@/pages/ClientManagement";
import ClientManagementPage from "@/pages/ClientManagementPage";
import ClientPage from "@/pages/ClientPage";
import TasksPage from "@/pages/TasksPage";
import ReportsPage from "@/pages/ReportsPage";
import ReportListPage from "@/pages/ReportListPage";
import Settings from "@/pages/Settings";
import AdvancedSettings from "@/pages/AdvancedSettings";
import HelpPage from "@/pages/HelpPage";
import TaskTemplatesPage from "@/pages/TaskTemplatesPage";
import BulkTaskCreationPage from "@/pages/BulkTaskCreationPage";
import Database from "@/pages/Database";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/enhanced-dashboard",
    element: <EnhancedDashboard />,
  },
  {
    path: "/client-management",
    element: <ClientManagement />,
  },
  {
    path: "/client-management-page",
    element: <ClientManagementPage />,
  },
  {
    path: "/client/:id",
    element: <ClientPage />,
  },
  {
    path: "/tasks",
    element: <TasksPage />,
  },
  {
    path: "/reports",
    element: <ReportsPage />,
  },
  {
    path: "/report-list",
    element: <ReportListPage />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/advanced-settings",
    element: <AdvancedSettings />,
  },
  {
    path: "/help",
    element: <HelpPage />,
  },
  {
    path: "/task-templates",
    element: <TaskTemplatesPage />,
  },
  {
    path: "/bulk-tasks",
    element: <BulkTaskCreationPage />,
  },
  {
    path: "/database",
    element: <Database />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
