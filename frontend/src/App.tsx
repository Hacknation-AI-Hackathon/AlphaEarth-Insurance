import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/Home";
import DamageClaims from "./pages/dashboard/DamageClaims";
import RiskScoring from "./pages/dashboard/RiskScoring";
import FlightDelays from "./pages/dashboard/FlightDelays";
import Parametric from "./pages/dashboard/Parametric";
import ImpactMap from "./pages/dashboard/ImpactMap";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/assess" element={<Demo />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="damage-claims" element={<DamageClaims />} />
            <Route path="risk-scoring" element={<RiskScoring />} />
            <Route path="flight-delays" element={<FlightDelays />} />
            <Route path="parametric" element={<Parametric />} />
            <Route path="impact-map" element={<ImpactMap />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
