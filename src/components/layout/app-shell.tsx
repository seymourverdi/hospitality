'use client'

import * as React from 'react'
import { cn } from '@/core/lib/utils'
import { SidebarNav } from './sidebar-nav'
import { BottomNav } from './bottom-nav'
import { Toaster } from '@/components/ui/toaster'

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

type MeUser = {
  id: number
  firstName: string
  lastName: string
  roleId: number
  locationId: number
  avatarColor?: string | null
}

type MeResponse = {
  user?: MeUser
}

export function AppShell({ children, className }: AppShellProps) {
  const [meUser, setMeUser] = React.useState<MeUser | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadMe() {
      try {
        // Use plain fetch — cookie pos_session_v1 is sent automatically
        const res = await fetch('/api/me', { method: 'GET', cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as MeResponse
        if (cancelled) return
        if (data.user) setMeUser(data.user)
      } catch {
        if (cancelled) return
      }
    }

    void loadMe()

    // Re-fetch on window focus (after switching user)
    const onFocus = () => { void loadMe() }
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const user = React.useMemo(
    () => ({
      name: meUser ? `${meUser.firstName} ${meUser.lastName}`.trim() || 'User' : 'User',
      avatar: undefined as string | undefined,
      avatarColor: meUser?.avatarColor ?? undefined,
    }),
    [meUser]
  )

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <SidebarNav user={user} />

      <main className="min-w-0 md:pl-[84px]">
        {children}
      </main>

      <BottomNav />
      <Toaster />
    </div>
  )
}