
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import { UserNav } from "@/components/UserNav";

const navLinkClass = "text-sm font-medium transition-colors hover:text-primary";
const activeClass = "text-primary";

export function Header() {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <nav className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-lg font-medium">LegalEdge</span>
            </Link>
          </nav>
        </div>
        <div className="flex-1">
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className={cn(navLinkClass, location.pathname === '/dashboard' && activeClass)}>Dashboard</Link>
            <Link to="/tasks" className={cn(navLinkClass, location.pathname === '/tasks' && activeClass)}>Tasks</Link>
            <Link to="/client-management" className={cn(navLinkClass, location.pathname.startsWith('/client') && activeClass)}>Clients</Link>
            <Link to="/reports" className={cn(navLinkClass, location.pathname.includes('report') && activeClass)}>Reports</Link>
            <Link to="/settings" className={cn(navLinkClass, location.pathname === '/settings' && activeClass)}>Settings</Link>
          </nav>
        </div>
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  );
}

export default Header;
