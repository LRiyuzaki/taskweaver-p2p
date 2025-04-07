
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Users,
  ClipboardList,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const Header = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    if (isMobile) setIsMenuOpen(false);
  };

  const renderNavLinks = () => (
    <ul className={cn(
      "flex gap-1 items-center",
      isMobile ? "flex-col items-start w-full gap-2" : ""
    )}>
      <li>
        <NavLink
          to="/"
          className={({ isActive }) => cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-primary"
          )}
          onClick={closeMenu}
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/client-management"
          className={({ isActive }) => cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-primary"
          )}
          onClick={closeMenu}
        >
          <Users className="h-4 w-4 mr-2" />
          Clients
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/tasks"
          className={({ isActive }) => cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-primary"
          )}
          onClick={closeMenu}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Tasks
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/help"
          className={({ isActive }) => cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-primary"
          )}
          onClick={closeMenu}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </NavLink>
      </li>
    </ul>
  );

  return (
    <header className="bg-background border-b sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-md w-6 h-6"></div>
              <span className="font-bold text-lg">AccoManager</span>
            </div>

            {isMobile ? (
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            ) : (
              <nav>{renderNavLinks()}</nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </NavLink>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/help">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help & Documentation</span>
                    </NavLink>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isMobile && isMenuOpen && (
          <nav className="py-4">
            {renderNavLinks()}
          </nav>
        )}
      </div>
    </header>
  );
};
