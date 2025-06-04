
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import { UserNav } from "@/components/UserNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navLinkClass = "text-sm font-medium transition-colors hover:text-primary";
const activeClass = "text-primary";

const NavigationLinks = ({ mobile = false, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) => {
  const location = useLocation();
  
  const linkClass = mobile 
    ? "block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    : navLinkClass;

  const links = [
    { to: "/dashboard", label: "Dashboard", active: location.pathname === '/dashboard' || location.pathname === '/' },
    { to: "/tasks", label: "Tasks", active: location.pathname === '/tasks' },
    { to: "/client-management", label: "Clients", active: location.pathname.startsWith('/client') },
    { to: "/reports", label: "Reports", active: location.pathname.includes('report') },
    { to: "/settings", label: "Settings", active: location.pathname === '/settings' },
  ];

  return (
    <>
      {links.map(({ to, label, active }) => (
        <Link 
          key={to}
          to={to} 
          className={cn(linkClass, active && (mobile ? "bg-accent text-accent-foreground" : activeClass))}
          onClick={onLinkClick}
        >
          {label}
        </Link>
      ))}
    </>
  );
};

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded">
              <span className="text-sm font-bold">AM</span>
            </div>
            <span className="hidden sm:inline-block text-lg font-semibold">AccountMaster</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="flex flex-1">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <NavigationLinks />
          </nav>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          <ModeToggle />
          <UserNav />
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded">
                      <span className="text-sm font-bold">AM</span>
                    </div>
                    <span className="text-lg font-semibold">AccountMaster</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="mt-6 space-y-1">
                  <NavigationLinks mobile onLinkClick={() => setMobileMenuOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
