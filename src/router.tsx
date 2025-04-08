
import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import ClientManagementPage from './pages/ClientManagementPage';
import ClientPage from './pages/ClientPage';
import AdvancedSettings from './pages/AdvancedSettings';
import TaskTemplatesPage from './pages/TaskTemplatesPage';
import ReportsPage from './pages/ReportsPage';
import HelpPage from './pages/HelpPage';
import Database from './pages/Database';
import TaskColumn from './pages/TaskColumn';
import Settings from './pages/Settings';
import BulkTaskCreationPage from './pages/BulkTaskCreationPage';
import ClientManagement from './pages/ClientManagement';
import ReportListPage from './pages/ReportListPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/tasks',
    element: <TasksPage />,
  },
  {
    path: '/task-templates',
    element: <TaskTemplatesPage />,
  },
  {
    path: '/client-management',
    element: <ClientManagementPage />,
  },
  {
    path: '/client/:clientId',
    element: <ClientPage />,
  },
  {
    path: '/advanced-settings',
    element: <AdvancedSettings />,
  },
  {
    path: '/help',
    element: <HelpPage />,
  },
  {
    path: '/reports',
    element: <ReportsPage />,
  },
  {
    path: '/reports-list',
    element: <ReportListPage />,
  },
  {
    path: '/database',
    element: <Database />,
  },
  {
    path: '/task-column',
    element: <TaskColumn />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/bulk-task-creation',
    element: <BulkTaskCreationPage />,
  },
  {
    path: '/client-management-db',
    element: <ClientManagement />,
  }
];

export const router = createBrowserRouter(routes);

export default router;
