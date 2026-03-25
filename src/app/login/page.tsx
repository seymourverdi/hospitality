'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'


// ─── Types ─────────────────────────────────────────────────────────────────────

type LoginUser = {
  id: number
  firstName: string
  lastName: string
  avatarColor: string | null
  role: { id: number; name: string }
}

type LogTicket = {
  id: string
  guestName: string | null
  serverName: string
  time: string
  status: 'pending' | 'delivered'
  items: { id: string; name: string; quantity: number }[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function initials(u: LoginUser) {
  return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
}

function fullName(u: LoginUser) {
  return `${u.firstName} ${u.lastName}`
}

const SEEN_KEY = 'login_bell_seen_at'

function getSeenAt(): number {
  if (typeof window === 'undefined') return 0
  return Number(localStorage.getItem(SEEN_KEY) ?? 0)
}
function markSeen() {
  if (typeof window !== 'undefined')
    localStorage.setItem(SEEN_KEY, String(Date.now()))
}

// ─── Bell dropdown ─────────────────────────────────────────────────────────────

function BellPanel({ tickets}: { tickets: LogTicket[]; onClose: () => void }) {
  const recent = tickets.slice(0, 10)
  return (
    <div
      style={{
        position: 'absolute', top: 52, right: 0, width: 320, zIndex: 200,
        backgroundColor: '#1E1E2E', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Recent Activity</span>
      </div>
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {recent.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            No recent activity
          </div>
        )}
        {recent.map(t => (
          <div key={t.id} style={{
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
              backgroundColor: t.status === 'pending' ? '#E67E22' : '#27AE60',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                {t.guestName ?? 'Walk-in'}{' '}
                <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>
                  — {t.items.length} item{t.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {t.time} · {t.status === 'pending' ? '🟡 Pending' : '✅ Delivered'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bell button ────────────────────────────────────────────────────────────────

function BellButton() {
  const [open, setOpen]       = React.useState(false)
  const [tickets, setTickets] = React.useState<LogTicket[]>([])
  const [badge, setBadge]     = React.useState(0)
  const ref                   = React.useRef<HTMLDivElement>(null)

  async function fetchTickets() {
    try {
      const res  = await fetch('/api/log/tickets', { cache: 'no-store' })
      const data = await res.json() as { ok: boolean; tickets?: LogTicket[] }
      if (!data.ok || !data.tickets) return
      setTickets(data.tickets)
      // Badge = pending tickets created after last "seen" timestamp
      const seenAt = getSeenAt()
      const newCount = data.tickets.filter(t => t.status === 'pending').length
      setBadge(seenAt === 0 ? newCount : newCount)
    } catch { /* noop */ }
  }

  React.useEffect(() => {
    void fetchTickets()
    const id = setInterval(() => void fetchTickets(), 30_000)
    return () => clearInterval(id)
  }, [])

  // Close on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggle() {
    if (!open) { markSeen(); setBadge(0) }
    setOpen(p => !p)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={toggle} style={{
        width: 44, height: 44, borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff', position: 'relative',
      }}>
        {/* Bell SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {/* Live badge */}
        {badge > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 18, height: 18, borderRadius: 9,
            backgroundColor: '#E74C3C',
            border: '2px solid #0F0F1E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
            padding: '0 4px',
            animation: 'badge-pulse 2s infinite',
          }}>
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </button>
      {open && <BellPanel tickets={tickets} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── User avatar card ───────────────────────────────────────────────────────────

function UserCard({ user, onSelect }: { user: LoginUser; onSelect: () => void }) {
  const [pressed, setPressed] = React.useState(false)
  const color = user.avatarColor ?? '#6B7280'

  return (
    <button
      type="button"
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onSelect() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        padding: '20px 16px',
        backgroundColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, cursor: 'pointer',
        transition: 'background-color 0.1s, transform 0.1s',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        minWidth: 120,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        backgroundColor: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, fontWeight: 700, color: '#fff',
        boxShadow: `0 0 0 3px rgba(255,255,255,0.1)`,
      }}>
        {initials(user)}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
          {user.firstName}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
          {user.role.name}
        </div>
      </div>
    </button>
  )
}

// ─── PIN key button ─────────────────────────────────────────────────────────────

function PinKey({
  label, sub, onPress, variant = 'default',
}: {
  label: React.ReactNode
  sub?: string
  onPress: () => void
  variant?: 'default' | 'action' | 'danger'
}) {
  const [pressed, setPressed] = React.useState(false)

  const bgMap = {
    default: pressed ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
    action:  pressed ? '#1A6B3C' : '#196F3D',
    danger:  pressed ? '#8B0000' : '#6B0000',
  }

  return (
    <button
      type="button"
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onPress() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', aspectRatio: '1',
        maxWidth: 90,
        borderRadius: '50%',
        backgroundColor: bgMap[variant],
        border: `1px solid ${variant === 'default' ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff',
        transition: 'background-color 0.08s, transform 0.08s',
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 26, fontWeight: 300, lineHeight: 1 }}>{label}</span>
      {sub && <span style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{sub}</span>}
    </button>
  )
}

// ─── PIN display dots ───────────────────────────────────────────────────────────

function PinDots({ length, filled, shake }: { length: number; filled: number; shake: boolean }) {
  return (
    <div style={{
      display: 'flex', gap: 14, justifyContent: 'center',
      animation: shake ? 'shake 0.4s ease' : 'none',
    }}>
      {Array.from({ length }).map((_, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: '50%',
          backgroundColor: i < filled ? '#fff' : 'transparent',
          border: '2px solid rgba(255,255,255,0.4)',
          transition: 'background-color 0.15s',
        }} />
      ))}
    </div>
  )
}

// ─── PIN pad modal ─────────────────────────────────────────────────────────────

function PinModal({ user, onCancel, redirectTo = '/stats' }: { user: LoginUser; onCancel: () => void; redirectTo?: string }) {
 
  const [pin, setPin]           = React.useState('')
  const [error, setError]       = React.useState<string | null>(null)
  const [shake, setShake]       = React.useState(false)
  const [loading, setLoading]   = React.useState(false)
  const PIN_LENGTH = 4

  async function submit(finalPin: string) {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: finalPin }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) {
        setError(data.error ?? 'Wrong PIN')
        setShake(true)
        setPin('')
        setTimeout(() => setShake(false), 500)
      } else {
        // Full reload so (app)/layout.tsx re-fetches the new user from /api/me
        window.location.href = redirectTo
      }
    } catch {
      setError('Connection error')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  function press(digit: string) {
    if (loading || pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    setError(null)
    if (next.length === PIN_LENGTH) void submit(next)
  }

  function backspace() {
    setPin(p => p.slice(0, -1))
    setError(null)
  }

  const color = user.avatarColor ?? '#6B7280'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#13132A',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '36px 32px 32px',
          width: '100%', maxWidth: 360,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        }}
      >
        {/* User avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', backgroundColor: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#fff',
          }}>
            {initials(user)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{fullName(user)}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{user.role.name}</div>
          </div>
        </div>

        {/* PIN dots */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <PinDots length={PIN_LENGTH} filled={pin.length} shake={shake} />
          <div style={{ height: 18 }}>
            {error && (
              <span style={{ fontSize: 12, color: '#E74C3C' }}>{error}</span>
            )}
          </div>
        </div>

        {/* Keypad */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12, width: '100%', maxWidth: 300,
        }}>
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <PinKey key={d} label={d} onPress={() => press(d)} />
          ))}
          {/* Bottom row */}
          <div /> {/* empty */}
          <PinKey label="0" onPress={() => press('0')} />
          <PinKey
            label={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12H7l5-5m0 10-5-5"/>
              </svg>
            }
            onPress={backspace}
            variant="danger"
          />
        </div>

        {/* Cancel */}
        <button type="button" onClick={onCancel} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', fontSize: 13,
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Main login page ────────────────────────────────────────────────────────────

export default function LoginPage() {
  const searchParams            = useSearchParams()
  const redirectTo              = searchParams.get('from') ?? '/stats'
  const [users, setUsers]       = React.useState<LoginUser[]>([])
  const [loading, setLoading]   = React.useState(true)
  const [selected, setSelected] = React.useState<LoginUser | null>(null)

  React.useEffect(() => {
    fetch('/api/login/users')
      .then(r => r.json())
      .then((d: { ok: boolean; users?: LoginUser[] }) => {
        if (d.ok && d.users) setUsers(d.users)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.2); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', backgroundColor: '#0F0F1E',
        display: 'flex', flexDirection: 'column',
        userSelect: 'none',
      }}>
        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px',
        }}>
          {/* Logo / wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: '#27AE60',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: -0.3 }}>
              City Club
            </span>
          </div>

          {/* Bell */}
          <BellButton />
        </div>

        {/* ── Body ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '20px 28px 60px',
        }}>
          <h1 style={{
            fontSize: 22, fontWeight: 600, color: '#fff',
            marginBottom: 8, letterSpacing: -0.3,
          }}>
            Who&apos;s working today?
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 40 }}>
            Select your profile to sign in
          </p>

          {loading && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading…</div>
          )}

          {!loading && users.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No active users found</div>
          )}

          {/* User grid */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center',
            maxWidth: 700,
            animation: 'fade-in 0.4s ease',
          }}>
            {users.map(u => (
              <UserCard key={u.id} user={u} onSelect={() => setSelected(u)} />
            ))}
          </div>
        </div>
      </div>

      {/* PIN modal */}
      {selected && (
        <PinModal user={selected} onCancel={() => setSelected(null)} redirectTo={redirectTo} />
      )}
    </>
  )
}