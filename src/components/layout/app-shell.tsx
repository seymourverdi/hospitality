'use client'

import * as React from 'react'
import { cn } from '@/core/lib/utils'
import { SidebarNav } from './sidebar-nav'
import { BottomNav } from './bottom-nav'
import { Toaster } from '@/components/ui/toaster'
import { authFetch } from '@/lib/pos/auth-client'

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

type MeResponse = {
  user?: {
    id: number
    firstName: string
    lastName: string
    roleId: number
    locationId: number
  }
}

function buildUserName(user?: MeResponse['user']) {
  if (!user) return 'User'
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  return fullName || 'User'
}

export function AppShell({ children, className }: AppShellProps) {
  const [userName, setUserName] = React.useState('User')

  React.useEffect(() => {
    let cancelled = false

    async function loadMe() {
      try {
        const res = await authFetch('/api/me', {
          method: 'GET',
        })

        if (!res.ok) return

        const data = (await res.json()) as MeResponse

        if (cancelled) return

        setUserName(buildUserName(data.user))
      } catch {
        if (cancelled) return
      }
    }

    void loadMe()

    return () => {
      cancelled = true
    }
  }, [])

  const user = React.useMemo(
    () => ({
      name: userName,
      avatar: undefined as string | undefined,
    }),
    [userName]
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