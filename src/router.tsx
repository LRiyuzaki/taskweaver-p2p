
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import NotFound from './pages/NotFound';

// Lazy load components to improve initial loading performance
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ClientManagementPage = lazy(() => import('./pages/ClientManagementPage'));
const ClientPage = lazy(() => import('./pages/ClientPage'));
const AdvancedSettings = lazy(() => import('./pages/AdvancedSettings'));
const TaskTemplatesPage = lazy(() => import('./pages/TaskTemplatesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const Database = lazy(() => import('./pages/Database'));
const Settings = lazy(() => import('./pages/Settings'));
const BulkTaskCreationPage = lazy(() => import('./pages/BulkTaskCreationPage'));
const ClientManagement = lazy(() => import('./pages/ClientManagement'));
const ReportListPage = lazy(() => import('./pages/ReportListPage'));

// Loading fallback for routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Wrap lazy components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: withSuspense(Index),
    errorElement: <NotFound />,
  },
  {
    path: '/dashboard',
    element: withSuspense(Dashboard),
  },
  {
    path: '/tasks',
    element: withSuspense(TasksPage),
  },
  {
    path: '/task-templates',
    element: withSuspense(TaskTemplatesPage),
  },
  {
    path: '/client-management',
    element: withSuspense(ClientManagementPage),
  },
  {
    path: '/client/:clientId',
    element: withSuspense(ClientPage),
  },
  {
    path: '/advanced-settings',
    element: withSuspense(AdvancedSettings),
  },
  {
    path: '/help',
    element: withSuspense(HelpPage),
  },
  {
    path: '/reports',
    element: withSuspense(ReportsPage),
  },
  {
    path: '/reports-list',
    element: withSuspense(ReportListPage),
  },
  {
    path: '/database',
    element: withSuspense(Database),
  },
  {
    path: '/task-column',
    element: withSuspense(TasksPage), /* Redirecting to TasksPage instead of non-existent TaskColumn */
  },
  {
    path: '/settings',
    element: withSuspense(Settings),
  },
  {
    path: '/bulk-task-creation',
    element: withSuspense(BulkTaskCreationPage),
  },
  {
    path: '/client-management-db',
    element: withSuspense(ClientManagement),
  }
];

export const router = createBrowserRouter(routes);

export default router;
