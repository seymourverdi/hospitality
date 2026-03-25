'use client'

import * as React from 'react'
import { AppShell, TopBar } from '@/components/layout'
import { authFetch } from '@/lib/pos/auth-client'

type MeResponse = {
  user?: { id: number; firstName: string; lastName: string; roleId: number }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = React.useState('Admin')

  React.useEffect(() => {
    authFetch('/api/me', { method: 'GET' })
      .then(r => r.json())
      .then((data: MeResponse) => {
        if (data.user) {
          setUserName(
            `${data.user.firstName ?? ''} ${data.user.lastName ?? ''}`.trim() || 'Admin'
          )
        }
      })
      .catch(() => {})
  }, [])

  return (
    <AppShell>
      <TopBar user={{ name: userName, email: '', role: 'admin' }} />
      {children}
    </AppShell>
  )
}