
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClientManagementPage from './pages/ClientManagementPage';
import ClientPage from './pages/ClientPage';
import TaskTemplatesPage from './pages/TaskTemplatesPage';
import BulkTaskCreationPage from './pages/BulkTaskCreationPage';
import ReportsPage from './pages/ReportsPage';
import Settings from './pages/Settings';
import HelpPage from './pages/HelpPage';
import Database from './pages/Database';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/client-management',
    element: <ClientManagementPage />,
  },
  {
    path: '/client/:id',
    element: <ClientPage />,
  },
  {
    path: '/task-templates',
    element: <TaskTemplatesPage />,
  },
  {
    path: '/bulk-tasks',
    element: <BulkTaskCreationPage />,
  },
  {
    path: '/reports',
    element: <ReportsPage />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/help',
    element: <HelpPage />,
  },
  {
    path: '/database',
    element: <Database />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
