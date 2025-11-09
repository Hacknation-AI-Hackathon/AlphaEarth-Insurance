import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/dashboard/dashboard";
import DamageClaims from "./pages/dashboard/DamageClaims";
import RiskScoring from "./pages/dashboard/RiskScoring";
import FlightDelays from "./pages/dashboard/FlightDelays";
import Parametric from "./pages/dashboard/Parametric";
import ImpactMap from "./pages/dashboard/ImpactMap";
import Profile from "./pages/dashboard/Profile";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/assess" element={<Demo />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/login" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="damage-claims" element={<DamageClaims />} />
              <Route path="risk-scoring" element={<RiskScoring />} />
              <Route path="flight-delays" element={<FlightDelays />} />
              <Route path="parametric" element={<Parametric />} />
              <Route path="impact-map" element={<ImpactMap />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NotificationProvider>
  </QueryClientProvider>
);

export default App;
