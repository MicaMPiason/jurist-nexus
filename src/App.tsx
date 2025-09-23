import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Processes from "./pages/Processes";
import Services from "./pages/Services";
import CalendarPage from "./pages/CalendarPage";
import Clients from "./pages/Clients";
import Billing from "./pages/Billing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/processes" element={<Processes />} />
              <Route path="/services" element={<Services />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/billing" element={<Billing />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
