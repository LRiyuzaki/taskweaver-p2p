
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskProvider } from "@/contexts/TaskContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import AdvancedSettings from "./pages/AdvancedSettings";
import Database from "./pages/Database";
import ClientManagement from "./pages/ClientManagement";
import ClientManagementPage from "./pages/ClientManagementPage";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <TaskProvider>
          <DatabaseProvider>
            <ClientProvider>
              <SidebarProvider>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/advanced-settings" element={<AdvancedSettings />} />
                      <Route path="/database" element={<Database />} />
                      <Route path="/client-management" element={<ClientManagement />} />
                      <Route path="/accounting" element={<ClientManagementPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                  </div>
                </div>
              </SidebarProvider>
            </ClientProvider>
          </DatabaseProvider>
        </TaskProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
