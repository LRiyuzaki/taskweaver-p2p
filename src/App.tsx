
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { TaskProvider } from './contexts/TaskContext';
import { ClientProvider } from './contexts/ClientContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import ClientManagement from './pages/ClientManagement';
import ClientDetailsPage from './pages/ClientDetailsPage';
import CompliancePage from './pages/CompliancePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <PerformanceProvider>
        <TaskProvider>
          <ClientProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/clients" element={<ClientManagement />} />
                    <Route path="/client/:id" element={<ClientDetailsPage />} />
                    <Route path="/compliance" element={<CompliancePage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Layout>
                <Toaster />
              </div>
            </Router>
          </ClientProvider>
        </TaskProvider>
      </PerformanceProvider>
    </ThemeProvider>
  );
}

export default App;
