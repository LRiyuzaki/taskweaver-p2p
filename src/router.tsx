import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import ClientManagementPage from "./pages/ClientManagementPage";
import ClientPage from "./pages/ClientPage";
import Settings from "./pages/Settings";
import AdvancedSettings from "./pages/AdvancedSettings";
import TaskTemplatesPage from "./pages/TaskTemplatesPage";
import Database from "./pages/Database";
import BulkTaskCreationPage from "./pages/BulkTaskCreationPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";
import ReportListPage from "./pages/ReportListPage";
import ReportsPage from "./pages/ReportsPage";

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
    path: "/tasks",
    element: <TasksPage />,
  },
  {
    path: "/client-management",
    element: <ClientManagementPage />,
  },
  {
    path: "/client/:id",
    element: <ClientPage />,
  },
  {
    path: "/reports",
    element: <ReportsPage />,
  },
  {
    path: "/reports-list",
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
    path: "/task-templates",
    element: <TaskTemplatesPage />,
  },
  {
    path: "/database",
    element: <Database />,
  },
  {
    path: "/bulk-task-creation",
    element: <BulkTaskCreationPage />,
  },
  {
    path: "/help",
    element: <HelpPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
