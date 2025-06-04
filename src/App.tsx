
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { router } from './router';
import { TaskProvider } from './contexts/TaskContext';
import { ClientProvider } from './contexts/ClientContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { P2PProvider } from './contexts/P2PContext';
import { P2PAuthProvider } from './contexts/P2PAuthContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect, Suspense } from 'react';
import { initializeWithSeedData } from './utils/seedData';
import { performanceService } from './services/monitoring/performance-service';
import { env } from './config/env';

// Create custom loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: 1,
      }
    }
  });
  
  // Initialize performance monitoring
  useEffect(() => {
    try {
      performanceService.init();
      
      if (env.isDevelopment) {
        console.log(`Application initialized in ${env.isDevelopment ? 'development' : 'production'} mode`);
        console.log(`Connected to Supabase project: ${import.meta.env.VITE_SUPABASE_URL || 'Not configured'}`);
      }
    } catch (error) {
      console.error('Failed to initialize performance service:', error);
    }
    
    return () => {
      try {
        performanceService.dispose();
      } catch (error) {
        console.error('Failed to dispose performance service:', error);
      }
    };
  }, []);
  
  // Initialize app with seed data if needed
  useEffect(() => {
    try {
      initializeWithSeedData();
    } catch (error) {
      console.error('Failed to initialize seed data:', error);
    }
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PerformanceProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <DatabaseProvider>
              <P2PAuthProvider>
                <P2PProvider>
                  <TaskProvider>
                    <ClientProvider>
                      <Suspense fallback={<LoadingFallback />}>
                        <RouterProvider router={router} />
                      </Suspense>
                      <Toaster />
                    </ClientProvider>
                  </TaskProvider>
                </P2PProvider>
              </P2PAuthProvider>
            </DatabaseProvider>
          </ThemeProvider>
        </PerformanceProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
