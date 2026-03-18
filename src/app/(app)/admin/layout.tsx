'use client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { href: string; label: string; exact?: boolean }

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/locations', label: 'Locations' },
  { href: '/admin/tables', label: 'Areas & Tables' },
  { href: '/admin/menu', label: 'Menu' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="border-b border-white/10 px-6">
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Link
                key={item.href}
                href={item.href as any}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-white text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      {children}
    </div>
  )
}
