// City Club HMS - Top Bar
// Page header with title and actions

'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, User } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/stats': 'Dashboard',
  '/sale': 'Point of Sale',
  '/rsvp': 'Reservations',
  '/display': 'Kitchen Display',
  '/tables': 'Table Management',
  '/filter': 'Allergen Filter',
  '/log': 'Activity Log',
  '/settings': 'Settings',
  '/admin': 'Admin',
  '/admin/users': 'User Management',
  '/admin/locations': 'Location Management',
  '/admin/tables': 'Area & Table Management',
  '/admin/menu': 'Menu Management',
};

interface TopBarProps {
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export function TopBar({
  className,
  title,
  subtitle,
  actions,
  showSearch = false,
  user,
}: TopBarProps) {
  const pathname = usePathname();

  // Get page title from pathname or use provided title
  const pageTitle = title || pageTitles[pathname] || 'City Club';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-4 px-4 md:px-6',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border',
        className
      )}
    >
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-h2 font-semibold">{pageTitle}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search (optional) */}
        {showSearch && (
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        )}

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Notifications</h4>
              <div className="space-y-2">
                <div className="flex gap-3 p-2 rounded-lg bg-background-secondary">
                  <div className="h-2 w-2 mt-2 rounded-full bg-warning" />
                  <div>
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-muted-foreground">
                      Wagyu Steak is running low (2 left)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-2 rounded-lg bg-background-secondary">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">New reservation</p>
                    <p className="text-xs text-muted-foreground">
                      John Smith - Party of 4 at 7:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Custom actions */}
        {actions}

        {/* User menu */}
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Switch User
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
