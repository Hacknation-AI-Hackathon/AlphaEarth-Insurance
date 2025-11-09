import { Button } from "@/components/ui/button";
import { Satellite } from "lucide-react";
import { NavLink } from "./NavLink";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Satellite className="h-6 w-6 text-primary" />
            <span>AlphaEarth Insurance</span>
          </NavLink>

          {/* Menu Items */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink 
              to="/" 
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary font-medium"
            >
              Home
            </NavLink>
            <a 
              href="#features" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <NavLink 
              to="/demo" 
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary font-medium"
            >
              Demo
            </NavLink>
            <NavLink 
              to="/signin" 
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary font-medium"
            >
              Sign In
            </NavLink>
            <Button 
              variant="default"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
};