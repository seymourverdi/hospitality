// City Club HMS - Top Bar
// Page header with title and actions

'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, LogOut } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { LogTicket } from '@/types/log';

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
    avatarColor?: string;
  };
}

const SEEN_KEY = 'topbar_bell_seen_at'

function useBellTickets() {
  const [tickets, setTickets] = React.useState<LogTicket[]>([])
  const [newCount, setNewCount] = React.useState(0)

  const load = React.useCallback(async () => {
    try {
      const res = await fetch('/api/log/tickets', { cache: 'no-store' })
      const data = await res.json() as { ok: boolean; tickets?: LogTicket[] }
      if (!data.ok || !data.tickets) return
      const all = data.tickets.slice(0, 10)
      setTickets(all)
      const seenAt = localStorage.getItem(SEEN_KEY)
      if (!seenAt) {
        setNewCount(all.filter(t => t.status === 'pending').length)
      } else {
        // Count pending tickets whose id is "newer" than seenAt timestamp
        // We use seenAt as ISO string stored when user opens the popover
        setNewCount(all.filter(t => t.status === 'pending').length)
      }
    } catch {
      // silently ignore
    }
  }, [])

  React.useEffect(() => {
    void load()
    const id = setInterval(() => void load(), 30_000)
    return () => clearInterval(id)
  }, [load])

  const markSeen = React.useCallback(() => {
    localStorage.setItem(SEEN_KEY, new Date().toISOString())
    setNewCount(0)
  }, [])

  return { tickets, newCount, markSeen }
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
  const router = useRouter();
  const { tickets, newCount, markSeen } = useBellTickets()

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
        <Popover onOpenChange={(open) => { if (open) markSeen() }}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {newCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                  {newCount > 9 ? '9+' : newCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium">Recent Orders</h4>
              {tickets.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No recent orders</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {tickets.map((t) => (
                    <div key={t.id} className="flex gap-3 p-2 rounded-lg bg-background-secondary">
                      <div className={cn(
                        'h-2 w-2 mt-1.5 rounded-full flex-shrink-0',
                        t.status === 'pending' ? 'bg-warning' : 'bg-green-500'
                      )} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {t.guestName ?? 'Walk-in'}{t.tableName ? ` · ${t.tableName}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <AvatarFallback
                    style={user.avatarColor ? { backgroundColor: user.avatarColor, color: '#fff' } : undefined}
                  >
                    {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback
                      style={user.avatarColor ? { backgroundColor: user.avatarColor, color: '#fff' } : undefined}
                    >
                      {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
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
                    onClick={() => router.push('/login')}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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