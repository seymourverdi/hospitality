// City Club HMS - App Shell
// Main layout wrapper with responsive navigation matching Figma

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { SidebarNav } from './sidebar-nav';
import { BottomNav } from './bottom-nav';
import { Toaster } from '@/components/ui/toaster';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  // Mock user - will be replaced with auth context
  const user = {
    name: 'Dustin S',
    avatar: undefined,
  };

  return (
    <div className="min-h-screen bg-[#292929]">
      {/* Desktop Sidebar - 85px width matching Figma */}
      <SidebarNav user={user} />

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen',
          // Offset for sidebar on desktop (85px)
          'lg:pl-[85px]',
          // Offset for bottom nav on mobile
          'pb-16 lg:pb-0',
          className
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
