'use client'

import * as React from 'react'
import { AppShell, TopBar } from '@/components/layout'

interface MeUser {
  id: number
  firstName: string
  lastName: string
  roleId: number
  avatarColor?: string | null
}

interface MeResponse {
  user?: MeUser
  role?: string
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<MeUser | null>(null)
  const [role, setRole] = React.useState('user')

  const fetchUser = React.useCallback(() => {
    // Plain fetch — pos_session_v1 cookie is sent automatically
    fetch('/api/me', { method: 'GET', cache: 'no-store' })
      .then(r => r.json())
      .then((data: MeResponse) => {
        if (data.user) setUser(data.user)
        if (data.role) setRole(data.role)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    fetchUser()
    window.addEventListener('focus', fetchUser)
    return () => window.removeEventListener('focus', fetchUser)
  }, [fetchUser])

  const name = user ? `${user.firstName} ${user.lastName}`.trim() || 'User' : 'User'

  return (
    <AppShell>
      <TopBar
        user={{
          name,
          email: '',
          role,
          avatarColor: user?.avatarColor ?? undefined,
        }}
      />
      {children}
    </AppShell>
  )
}