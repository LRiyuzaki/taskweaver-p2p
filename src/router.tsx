
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ClientDetailsPage from './pages/ClientDetailsPage';
import ClientManagementPage from './pages/ClientManagementPage';
import TasksPage from './pages/TasksPage';
import Dashboard from './pages/Dashboard';
import ReportsPage from './pages/ReportsPage';
import ReportListPage from './pages/ReportListPage';
import Settings from './pages/Settings';
import AdvancedSettings from './pages/AdvancedSettings';
import HelpPage from './pages/HelpPage';
import BulkTaskCreationPage from './pages/BulkTaskCreationPage';
import NotFound from './pages/NotFound';
import ClientPage from './pages/ClientPage';
import TaskTemplatesPage from './pages/TaskTemplatesPage';
import CreateClientPage from './pages/CreateClientPage';
import ClientGroups from './pages/ClientGroups';
import AttendancePage from './pages/AttendancePage';
import Database from './pages/Database';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/tasks',
    element: <TasksPage />
  },
  {
    path: '/clients',
    element: <ClientManagementPage />
  },
  {
    path: '/clients/new',
    element: <CreateClientPage />
  },
  {
    path: '/clients/groups',
    element: <ClientGroups />
  },
  {
    path: '/clients/:clientId',
    element: <ClientDetailsPage />
  },
  {
    path: '/reports',
    element: <ReportsPage />
  },
  {
    path: '/reports/list',
    element: <ReportListPage />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/settings/advanced',
    element: <AdvancedSettings />
  },
  {
    path: '/help',
    element: <HelpPage />
  },
  {
    path: '/tasks/bulk-create',
    element: <BulkTaskCreationPage />
  },
  {
    path: '/tasks/templates',
    element: <TaskTemplatesPage />
  },
  {
    path: '/client/:id',
    element: <ClientPage />
  },
  {
    path: '/attendance',
    element: <AttendancePage />
  },
  {
    path: '/database',
    element: <Database />
  },
  {
    path: '*',
    element: <NotFound />
  }
]);
