// City Club HMS - Bottom Navigation
// Mobile bottom navigation bar

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ShoppingCart,
  CalendarDays,
  Monitor,
  LayoutGrid,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/core/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, FileText, Settings, Users, LogOut } from 'lucide-react';

// Primary navigation items (shown in bottom bar)
const primaryNavItems = [
  { href: '/stats' as const, label: 'Stats', icon: BarChart3 },
  { href: '/sale' as const, label: 'Sale', icon: ShoppingCart },
  { href: '/rsvp' as const, label: 'RSVP', icon: CalendarDays },
  { href: '/display' as const, label: 'Display', icon: Monitor },
  { href: '/tables' as const, label: 'Tables', icon: LayoutGrid },
];

// Secondary navigation items (in More menu)
const moreNavItems = [
  { href: '/filter' as const, label: 'Filter', icon: Filter },
  { href: '/log' as const, label: 'Log', icon: FileText },
  { href: '/settings' as const, label: 'Settings', icon: Settings },
  { href: '/admin/users' as const, label: 'Admin', icon: Users },
];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  const isActiveMore = moreNavItems.some((item) => pathname.startsWith(item.href));

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'bg-sidebar border-t border-border safe-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {primaryNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2',
                'transition-colors touch-target',
                isActive
                  ? 'text-sidebar-active'
                  : 'text-sidebar-foreground active:text-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2',
                'transition-colors touch-target',
                isActiveMore
                  ? 'text-sidebar-active'
                  : 'text-sidebar-foreground active:text-foreground'
              )}
            >
              <MoreHorizontal className="h-6 w-6" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-4 py-6">
              {moreNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 p-4 rounded-xl',
                      'transition-colors touch-target',
                      isActive
                        ? 'bg-sidebar-active text-white'
                        : 'bg-background-secondary text-foreground active:bg-background-tertiary'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  // TODO: Implement logout
                  console.log('Logout clicked');
                }}
                className={cn(
                  'flex items-center gap-3 w-full p-4 rounded-xl',
                  'bg-destructive/10 text-destructive',
                  'transition-colors active:bg-destructive/20'
                )}
              >
                <LogOut className="h-6 w-6" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
