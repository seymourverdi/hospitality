'use client'

import * as React from 'react'
import type { LogTicket, LogTicketItem } from '@/app/api/log/tickets/route'

// ─── Badge colours (cycling per item index) ───────────────────────────────────

const BADGE_COLORS = [
  { bg: '#E67E22', text: '#fff' },
  { bg: '#C0392B', text: '#fff' },
  { bg: '#2980B9', text: '#fff' },
  { bg: '#8E44AD', text: '#fff' },
  { bg: '#27AE60', text: '#fff' },
]

function getBadgeColor(idx: number) {
  return BADGE_COLORS[idx % BADGE_COLORS.length] ?? BADGE_COLORS[0]!
}

// ─── Server chip ──────────────────────────────────────────────────────────────

function ServerChip({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials = parts.length >= 2
    ? `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase()
    : name.slice(0, 2).toUpperCase()
  const shortName = parts[0]
    ? `${parts[0]} ${parts[parts.length - 1]?.[0] ?? ''}.`
    : name

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      backgroundColor: '#3B5998', borderRadius: 20,
      padding: '3px 10px 3px 5px',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        backgroundColor: '#5271B8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}>
        {initials}
      </div>
      <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {shortName}
      </span>
    </div>
  )
}

// ─── Header pill (Location / Table / Seat) ────────────────────────────────────

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 6, padding: '3px 8px',
      fontSize: 11, color: 'rgba(255,255,255,0.85)',
      whiteSpace: 'nowrap',
    }}>
      {icon}
      <span>{label}</span>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.6 }}>
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({ item, idx, delivered }: { item: LogTicketItem; idx: number; delivered: boolean }) {
  const color = getBadgeColor(idx)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        backgroundColor: color.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: color.text,
        flexShrink: 0,
      }}>
        {item.quantity}
      </div>
      <span style={{
        fontSize: 12,
        color: delivered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)',
        textDecoration: delivered ? 'line-through' : 'none',
      }}>
        {item.name}
      </span>
    </div>
  )
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick} style={{
      width: 30, height: 30, borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: '#fff', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}

// ─── Ticket card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket, onDeliver, onReopen }: {
  ticket: LogTicket
  onDeliver: (id: string) => void
  onReopen:  (id: string) => void
}) {
  const delivered   = ticket.status === 'delivered'
  const cardBg      = delivered ? '#1E8449' : '#2C2C3E'
  const headerBg    = delivered ? '#196F3D' : '#23233A'
  const borderColor = delivered ? '#27AE60' : '#3D3D5C'
  const dimText     = delivered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.45)'

  return (
    <div style={{
      backgroundColor: cardBg, border: `1px solid ${borderColor}`,
      borderRadius: 10, overflow: 'hidden', marginBottom: 10,
    }}>
      {/* ── Card header ── */}
      <div style={{
        backgroundColor: headerBg, padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 2 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', backgroundColor: '#5D6D7E',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
            {ticket.guestName ?? 'Walk-in'}
          </span>
        </div>

        <Pill label={ticket.locationName ?? 'Location'} icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        } />
        <Pill label={ticket.tableName ?? 'Table'} icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        } />
        <Pill label={ticket.seatNumber != null ? `Seat ${ticket.seatNumber}` : 'Seat'} icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2v11M18 2v11M6 13a6 6 0 0 0 12 0M12 19v3"/>
          </svg>
        } />
      </div>

      {/* ── Items ── */}
      <div style={{ padding: '8px 10px 4px' }}>
        {ticket.items.map((item, idx) => (
          <ItemRow key={item.id} item={item} idx={idx} delivered={delivered} />
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '6px 10px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: `1px solid ${borderColor}`, marginTop: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: dimText, fontSize: 11 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span>{ticket.time}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ServerChip name={ticket.serverName} />

          <ActionBtn title="Edit guest">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </ActionBtn>

          <ActionBtn title={delivered ? 'Re-open' : 'Refresh'} onClick={() => onReopen(ticket.id)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </ActionBtn>

          <ActionBtn
            title={delivered ? 'Re-open' : 'Mark Delivered'}
            onClick={() => delivered ? onReopen(ticket.id) : onDeliver(ticket.id)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={delivered ? '#4ade80' : 'currentColor'} strokeWidth="2.5">
              <path d="M3 12l5 5L20 7"/>
            </svg>
          </ActionBtn>
        </div>
      </div>
    </div>
  )
}

// ─── Column header ────────────────────────────────────────────────────────────

function ColHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', backgroundColor: '#3D3D5C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff',
      }}>
        {count}
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{label}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogPage() {
  const [tickets, setTickets]   = React.useState<LogTicket[]>([])
  const [loading, setLoading]   = React.useState(true)
  const [error,   setError]     = React.useState<string | null>(null)

  async function loadTickets() {
    try {
      const res  = await fetch('/api/log/tickets', { cache: 'no-store' })
      const data = await res.json() as { ok: boolean; tickets?: LogTicket[]; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Failed')
      setTickets(data.tickets ?? [])
      setError(null)
    } catch {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void loadTickets()
    const id = setInterval(() => void loadTickets(), 15_000)
    return () => clearInterval(id)
  }, [])

  async function handleDeliver(ticketId: string) {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: 'delivered' as const } : t
    ))
    await fetch('/api/log/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: Number(ticketId), status: 'COMPLETED' }),
    })
  }

  async function handleReopen(ticketId: string) {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: 'pending' as const } : t
    ))
    await fetch('/api/log/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: Number(ticketId), status: 'OPEN' }),
    })
  }

  const pending   = tickets.filter(t => t.status === 'pending')
  const delivered = tickets.filter(t => t.status === 'delivered')

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#1A1A2E',
      color: '#fff', display: 'flex', flexDirection: 'column',
    }}>
      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Log</span>
        <button type="button" onClick={() => void loadTickets()} style={{
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* two-column grid */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
      }}>
        {/* ── Pending ── */}
        <div style={{
          padding: '16px', borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto',
        }}>
          <ColHeader label="Pending" count={pending.length} />
          {loading && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</p>}
          {error   && <p style={{ color: '#e74c3c', fontSize: 13 }}>{error}</p>}
          {!loading && !error && pending.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
              No pending orders
            </p>
          )}
          {pending.map(t => (
            <TicketCard key={t.id} ticket={t} onDeliver={handleDeliver} onReopen={handleReopen} />
          ))}
        </div>

        {/* ── Delivered ── */}
        <div style={{ padding: '16px', overflowY: 'auto' }}>
          <ColHeader label="Delivered" count={delivered.length} />
          {!loading && !error && delivered.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
              No delivered orders yet
            </p>
          )}
          {delivered.map(t => (
            <TicketCard key={t.id} ticket={t} onDeliver={handleDeliver} onReopen={handleReopen} />
          ))}
        </div>
      </div>
    </div>
  )
}