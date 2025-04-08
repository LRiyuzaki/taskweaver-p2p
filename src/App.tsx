import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { router } from './router'
import { TaskProvider } from './contexts/TaskContext';
import { ClientProvider } from './contexts/ClientContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { P2PProvider } from './contexts/P2PContext';

function App() {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TaskProvider>
          <ClientProvider>
            <DatabaseProvider>
              <P2PProvider>
                <RouterProvider router={router} />
                <Toaster />
              </P2PProvider>
            </DatabaseProvider>
          </ClientProvider>
        </TaskProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
