import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Satellite,
  Target,
  Plane,
  Zap,
  Map,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: Satellite, label: "Damage Claims", path: "/dashboard/damage-claims" },
  { icon: Target, label: "Risk Scoring", path: "/dashboard/risk-scoring" },
  { icon: Plane, label: "Flight Delays", path: "/dashboard/flight-delays" },
  { icon: Zap, label: "Parametric", path: "/dashboard/parametric" },
  { icon: Map, label: "Impact Map", path: "/dashboard/impact-map" },
];

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-[#F5F7FA]">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-60 bg-[#0f172a] text-white
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Satellite className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AlphaEarth</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#1e293b] transition-colors"
              activeClassName="bg-[#1e293b] text-white font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                DU
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-400">Demo User</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex-1 md:ml-0 ml-12">
              {/* Page title will be set by individual pages */}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  DU
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
