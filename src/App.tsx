
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ClientProvider } from '@/contexts/ClientContext';
import { TaskProvider } from '@/contexts/TaskContext';  // Fixed import path
import { ThemeProvider } from '@/components/theme-provider';
import Dashboard from '@/pages/Dashboard';
import ClientManagementPage from '@/pages/ClientManagementPage';
import ClientPage from '@/pages/ClientPage';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import HelpPage from '@/pages/HelpPage';
import Index from '@/pages/Index';
import TaskTemplatesPage from '@/pages/TaskTemplatesPage';
import BulkTaskCreationPage from '@/pages/BulkTaskCreationPage';
import ReportsPage from '@/pages/ReportsPage';

import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ClientProvider>
        <TaskProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Index />} />
              <Route path="/task-templates" element={<TaskTemplatesPage />} />
              <Route path="/bulk-tasks" element={<BulkTaskCreationPage />} />
              <Route path="/client-management" element={<ClientManagementPage />} />
              <Route path="/client/:clientId" element={<ClientPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<HelpPage />} />
              {/* Old routes redirect */}
              <Route path="/accounting" element={<Navigate to="/tasks" replace />} />
              <Route path="/database" element={<Navigate to="/client-management" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </TaskProvider>
      </ClientProvider>
    </ThemeProvider>
  );
}

export default App;
