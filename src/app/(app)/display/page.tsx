'use client';

import * as React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type UiTicketItem = {
  id: string;
  ticketItemId: string;
  name: string;
  modifier: string | null;
  allergy: string | null;
  seat: number | null;
  server: string | null;
  completed: boolean;
};

type UiTicket = {
  id: string;
  orderId: number;
  tableName: string | null;
  locationName: string | null;
  course: string | null;
  time: string;
  elapsed: string;        // API returns formatted string e.g. "1 min 30 sec"
  elapsedSeconds?: number;
  status: 'incoming' | 'fired' | 'complete' | 'scheduled';
  scheduledTime: string | null;
  items: UiTicketItem[];
};

type CountItem = { name: string; count: number };

// ─── Colours ──────────────────────────────────────────────────────────────────

const COL = {
  incoming:  { header: '#C0392B', body: 'rgba(192,57,43,0.15)', border: '#C0392B' },
  fired:     { header: '#6C3483', body: 'rgba(108,52,131,0.15)', border: '#8E44AD' },
  complete:  { header: '#1E8449', body: 'rgba(30,132,73,0.15)',  border: '#27AE60' },
  scheduled: { header: '#C0392B', body: 'rgba(192,57,43,0.15)', border: '#C0392B' },
};

// ─── Live elapsed timer ───────────────────────────────────────────────────────

// Parse "X min Y sec" or "Y sec" from API into seconds
function parseElapsed(s: string): number {
  const mMatch = s.match(/(\d+)\s*min/);
  const sMatch = s.match(/(\d+)\s*sec/);
  return (mMatch ? parseInt(mMatch[1] ?? '0') * 60 : 0) + (sMatch ? parseInt(sMatch[1] ?? '0') : 0);
}

function ElapsedTimer({ elapsed }: { elapsed: string }) {
  const base = React.useMemo(() => parseElapsed(elapsed), [elapsed]);
  const [extra, setExtra] = React.useState(0);

  React.useEffect(() => {
    setExtra(0);
    const id = setInterval(() => setExtra(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [elapsed]);

  const total = base + extra;
  const m = Math.floor(total / 60);
  const s = total % 60;
  const label = m > 0
    ? `${m} Minute${m !== 1 ? 's' : ''} ${s} Seconds...`
    : `${s} Seconds...`;

  return <span className="text-orange-400">{label}</span>;
}

// ─── Ticket item row ──────────────────────────────────────────────────────────

function TicketItemRow({
  item,
  status,
  onToggle,
}: {
  item: UiTicketItem;
  status: UiTicket['status'];
  onToggle: () => void;
}) {
  const done = item.completed || status === 'complete';

  return (
    <div className="py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <span className="text-xs font-bold text-white/40 w-4 flex-shrink-0 mt-0.5 text-right">
            {item.id.slice(-1)}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-snug ${done ? 'line-through text-white/40' : 'text-white'}`}>
              {item.name}
            </p>
            {item.modifier && (
              <p className={`text-xs mt-0.5 ${done ? 'line-through text-orange-300/40' : 'text-orange-400'}`}>
                🔥 {item.modifier}
              </p>
            )}
            {item.allergy && (
              <p className={`text-xs mt-0.5 font-medium ${done ? 'line-through text-red-400/40' : 'text-red-400'}`}>
                🔥 {item.allergy}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-white/35">
              {item.seat != null && (
                <span className="flex items-center gap-0.5">
                  Seat {item.seat}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              )}
              {item.server && (
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  {item.server}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border ${
            done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 bg-transparent'
          }`}
        >
          {done && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Ticket card ──────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  onItemToggle,
  onBump,
}: {
  ticket: UiTicket;
  onItemToggle: (ticketId: string, item: UiTicketItem) => void;
  onBump: (ticketId: string) => void;
}) {
  const c = COL[ticket.status];
  const allDone = ticket.status === 'complete';

  return (
    <div className="rounded-xl overflow-hidden mb-3 flex-shrink-0" style={{ border: `1px solid ${c.border}` }}>
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2.5 py-2" style={{ backgroundColor: c.header }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-70 flex-shrink-0">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        <button type="button" className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-white font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {ticket.locationName ?? 'Location'}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button type="button" className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-white font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          {ticket.tableName ? `T${ticket.tableName}` : 'Table'}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button type="button" className="flex items-center justify-center w-5 h-5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
        {ticket.scheduledTime && (
          <span className="text-xs text-white/80 ml-1">{ticket.scheduledTime}</span>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => onBump(ticket.id)}
            className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${
              allDone ? 'bg-white border-white' : 'border-white/50 bg-transparent'
            }`}
          >
            {allDone && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l2.5 2.5L9 1" stroke={c.header} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-1" style={{ backgroundColor: c.body }}>
        {ticket.items.map(item => (
          <TicketItemRow
            key={item.id}
            item={item}
            status={ticket.status}
            onToggle={() => onItemToggle(ticket.id, item)}
          />
        ))}
        <div className="flex items-center gap-1.5 py-2 text-xs text-white/35">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Today</span>
          <span className="text-white/50">{ticket.time}</span>
          <ElapsedTimer elapsed={ticket.elapsed} />
        </div>
      </div>
    </div>
  );
}

// ─── Course group (Fired) ─────────────────────────────────────────────────────

function CourseGroup({ course, tickets, idx, onItemToggle, onBump }: {
  course: string; tickets: UiTicket[]; idx: number;
  onItemToggle: (tid: string, item: UiTicketItem) => void;
  onBump: (tid: string) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-sm font-semibold text-white">{course}</span>
        <div className="flex-1 border-t border-dashed border-white/15" />
        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
          {idx + 1}
        </span>
      </div>
      {tickets.map(t => <TicketCard key={t.id} ticket={t} onItemToggle={onItemToggle} onBump={onBump} />)}
    </div>
  );
}

// ─── Count bar ────────────────────────────────────────────────────────────────

function CountBar({ items }: { items: CountItem[] }) {
  return (
    <div className="flex items-center border-t border-white/10 flex-shrink-0" style={{ backgroundColor: '#1a1a1a', height: 34 }}>
      <div className="flex items-center gap-1.5 px-3 border-r border-white/10 flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span className="text-xs font-semibold text-white/60">Count</span>
      </div>
      <div className="flex items-center overflow-hidden flex-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-white/8 whitespace-nowrap flex-shrink-0">
            <span className="text-xs font-bold text-white/70">{item.count}</span>
            <span className="text-xs text-white/45">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DisplayPage() {
  const [tickets, setTickets] = React.useState<UiTicket[]>([]);
  const [view, setView] = React.useState<'main' | 'scheduled'>('main');
  const [stationFilter, setStationFilter] = React.useState<'all' | 'bar' | 'kitchen'>('all');
  const [loading, setLoading] = React.useState(true);

  const loadTickets = React.useCallback(async () => {
    try {
      const res = await fetch('/api/sale/kds/tickets', { cache: 'no-store' });
      const data = await res.json() as { ok: boolean; tickets?: UiTicket[] };
      if (data.ok) setTickets(data.tickets ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTickets();
    const id = setInterval(() => void loadTickets(), 10000);
    return () => clearInterval(id);
  }, [loadTickets]);

  // Toggle a single item — action depends on current ticket status
  async function handleItemToggle(ticketId: string, item: UiTicketItem) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Optimistic update
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        items: t.items.map(i =>
          i.ticketItemId === item.ticketItemId ? { ...i, completed: !i.completed } : i
        ),
      };
    }));

    // Correct action per status
    const action = ticket.status === 'incoming' ? 'start'
      : ticket.status === 'fired' ? 'ready'
      : 'serve';

    await fetch(`/api/sale/kds/items/${item.ticketItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    // Reload to get true server state
    setTimeout(() => void loadTickets(), 500);
  }

  // Bump whole ticket — mark all items with appropriate action
  async function handleBump(ticketId: string) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const action = ticket.status === 'incoming' ? 'start'
      : ticket.status === 'fired' ? 'ready'
      : 'serve';

    // Optimistic
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const next: UiTicket['status'] = ticket.status === 'incoming' ? 'fired'
        : ticket.status === 'fired' ? 'complete' : 'complete';
      return { ...t, status: next, items: t.items.map(i => ({ ...i, completed: true })) };
    }));

    // Fire all items
    await Promise.all(
      ticket.items.map(item =>
        fetch(`/api/sale/kds/items/${item.ticketItemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
      )
    );

    setTimeout(() => void loadTickets(), 500);
  }

  const grouped = React.useMemo(() => ({
    incoming:  tickets.filter(t => t.status === 'incoming'),
    fired:     tickets.filter(t => t.status === 'fired'),
    complete:  tickets.filter(t => t.status === 'complete'),
    scheduled: tickets.filter(t => t.status === 'scheduled'),
  }), [tickets]);

  // Fired grouped by course
  const firedByCourse = React.useMemo(() => {
    const map = new Map<string, UiTicket[]>();
    for (const t of grouped.fired) {
      const key = t.course ?? 'Uncategorised';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [grouped.fired]);

  const countItems = React.useMemo((): CountItem[] => {
    const map = new Map<string, number>();
    for (const t of tickets) {
      for (const item of t.items) {
        map.set(item.name, (map.get(item.name) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 14)
      .map(([name, count]) => ({ name, count }));
  }, [tickets]);

  if (loading) {
    return (
      <div className="h-screen bg-neutral-950 text-white flex items-center justify-center">
        <span className="text-white/30 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">

      {/* ── Single top bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-6 px-4 py-2.5 flex-shrink-0">
        {view === 'main' ? (
          <>
            {(['incoming','fired','complete'] as const).map(s => (
              <div key={s} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-bold">
                  {grouped[s].length}
                </span>
                <span className="text-sm font-semibold text-white capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </div>
            ))}
            <button type="button" onClick={() => setView('scheduled')}
              className="ml-auto w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-bold">
                {grouped.scheduled.length}
              </span>
              <span className="text-sm font-semibold text-white">Scheduled</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setView('main')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-white/70 transition">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Move Back
              </button>
              <button type="button"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Kanban columns ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden px-2 pb-1">
        {view === 'scheduled' ? (
          <div className="h-full overflow-y-auto p-1 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {grouped.scheduled.length === 0
              ? <div className="text-white/20 text-sm text-center py-12 col-span-full">No scheduled tickets</div>
              : grouped.scheduled.map(t => <TicketCard key={t.id} ticket={t} onItemToggle={handleItemToggle} onBump={handleBump} />)
            }
          </div>
        ) : (
          <div className="h-full grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {/* Incoming */}
            <div className="overflow-y-auto px-1 pt-1">
              {grouped.incoming.length === 0
                ? <div className="text-white/15 text-sm text-center py-8">No tickets</div>
                : grouped.incoming.map(t => <TicketCard key={t.id} ticket={t} onItemToggle={handleItemToggle} onBump={handleBump} />)
              }
            </div>

            {/* Fired */}
            <div className="overflow-y-auto px-1 pt-1">
              {grouped.fired.length === 0
                ? <div className="text-white/15 text-sm text-center py-8">No tickets</div>
                : Array.from(firedByCourse.entries()).map(([course, ts], i) => (
                    <CourseGroup key={course} course={course} tickets={ts} idx={i}
                      onItemToggle={handleItemToggle} onBump={handleBump} />
                  ))
              }
            </div>

            {/* Complete */}
            <div className="overflow-y-auto px-1 pt-1">
              {grouped.complete.length === 0
                ? <div className="text-white/15 text-sm text-center py-8">No tickets</div>
                : grouped.complete.map(t => <TicketCard key={t.id} ticket={t} onItemToggle={handleItemToggle} onBump={handleBump} />)
              }
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom count bar + station filter ───────────────────────── */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex-1 overflow-hidden">
          <CountBar items={countItems} />
        </div>
        <div className="flex items-center gap-1 px-3 border-t border-white/10 flex-shrink-0" style={{ backgroundColor: '#1a1a1a', height: 34 }}>
          {(['All','Bar','Kitchen'] as const).map(s => (
            <button key={s} type="button"
              onClick={() => setStationFilter(s.toLowerCase() as 'all'|'bar'|'kitchen')}
              className={`px-3 py-0.5 rounded text-xs font-semibold transition ${
                stationFilter === s.toLowerCase()
                  ? s === 'Kitchen' ? 'bg-emerald-500 text-white'
                  : 'bg-white/90 text-neutral-900'
                  : 'text-white/40 hover:text-white/70'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
