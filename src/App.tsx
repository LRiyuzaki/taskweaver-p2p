
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { router } from "@/router";
import { RouterProvider } from "react-router-dom";
import { ClientProvider } from "@/contexts/ClientContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { SupabaseClientProvider } from "@/contexts/SupabaseClientContext";
import { P2PAuthProvider } from "@/contexts/P2PAuthContext";
import { P2PProvider } from "@/contexts/P2PContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <PerformanceProvider>
          <DatabaseProvider>
            <SupabaseClientProvider>
              <P2PAuthProvider>
                <P2PProvider>
                  <ClientProvider>
                    <TaskProvider>
                      <RouterProvider router={router} />
                      <Toaster />
                    </TaskProvider>
                  </ClientProvider>
                </P2PProvider>
              </P2PAuthProvider>
            </SupabaseClientProvider>
          </DatabaseProvider>
        </PerformanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
