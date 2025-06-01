
import { BrowserRouter as Router, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { P2PProvider } from '@/contexts/P2PContext';
import { P2PAuthProvider } from '@/contexts/P2PAuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { SupabaseTaskProvider } from '@/contexts/SupabaseTaskContext';
import { SupabaseClientProvider } from '@/contexts/SupabaseClientContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { MigrationStatus } from '@/components/MigrationStatus';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { router } from '@/router';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { isInitialized, migrationStatus } = useSupabaseIntegration();

  return (
    <>
      {(!isInitialized || migrationStatus === 'in-progress') && <MigrationStatus />}
      <RouterProvider router={router} />
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <PerformanceProvider>
          <P2PAuthProvider>
            <P2PProvider>
              <DatabaseProvider>
                <SupabaseClientProvider>
                  <SupabaseTaskProvider>
                    <AppContent />
                    <Toaster />
                  </SupabaseTaskProvider>
                </SupabaseClientProvider>
              </DatabaseProvider>
            </P2PProvider>
          </P2PAuthProvider>
        </PerformanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
