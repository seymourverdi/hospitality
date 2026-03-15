'use client';

import * as React from 'react';
import { Check, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/core/lib/utils';

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
  course: string | null;
  time: string;
  elapsed: string;
  status: 'incoming' | 'fired' | 'complete';
  items: UiTicketItem[];
};

type TicketsResponse = {
  ok: boolean;
  tickets?: UiTicket[];
  error?: string;
};

function FilterDropdown({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button className="flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs">
      {icon}
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  );
}

function TicketItemRow({
  item,
  column,
  onAction,
  busyId,
}: {
  item: UiTicketItem;
  column: 'incoming' | 'fired' | 'complete';
  onAction: (ticketItemId: string, action: 'start' | 'ready' | 'serve') => void;
  busyId: string | null;
}) {
  const isBusy = busyId === item.ticketItemId;

  return (
    <div className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
      <div
        className={cn(
          'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5',
          item.completed ? 'bg-primary border-primary' : 'border-white/30'
        )}
      >
        {item.completed && <Check className="h-3 w-3 text-black" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-white text-sm">{item.name}</span>
          {item.completed && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
        </div>

        {item.modifier ? (
          <p className="text-orange-400 text-xs mt-1">{item.modifier}</p>
        ) : null}

        {item.allergy ? (
          <p className="text-red-400 text-xs mt-1">{item.allergy}</p>
        ) : null}

        <div className="flex items-center gap-2 mt-2 text-xs text-white/50 flex-wrap">
          {typeof item.seat === 'number' ? (
            <>
              <span className="flex items-center gap-1">
                Seat {item.seat} <ChevronDown className="h-3 w-3" />
              </span>
              <span>•</span>
            </>
          ) : null}

          {item.server ? <span>{item.server}</span> : null}
        </div>

        <div className="mt-3">
          {column === 'incoming' ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onAction(item.ticketItemId, 'start')}
              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 disabled:opacity-50"
            >
              {isBusy ? 'Starting...' : 'Start'}
            </button>
          ) : null}

          {column === 'fired' ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onAction(item.ticketItemId, 'ready')}
              className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-300 disabled:opacity-50"
            >
              {isBusy ? 'Updating...' : 'Ready'}
            </button>
          ) : null}

          {column === 'complete' && !item.completed ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onAction(item.ticketItemId, 'serve')}
              className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 disabled:opacity-50"
            >
              {isBusy ? 'Serving...' : 'Serve'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  column,
  onAction,
  busyId,
}: {
  ticket: UiTicket;
  column: 'incoming' | 'fired' | 'complete';
  onAction: (ticketItemId: string, action: 'start' | 'ready' | 'serve') => void;
  busyId: string | null;
}) {
  return (
    <div className="rounded-2xl bg-[#333333] border border-white/10 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-white font-semibold">
            Table {ticket.tableName ?? '—'}
          </div>
          <div className="text-xs text-white/50 mt-1">
            Order #{ticket.orderId}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-white/70">{ticket.time}</div>
          <div className="text-[11px] text-orange-300 mt-1">{ticket.elapsed}</div>
        </div>
      </div>

      {ticket.course ? (
        <div className="text-xs font-medium text-primary mb-3">{ticket.course}</div>
      ) : null}

      <div>
        {ticket.items.map((item) => (
          <TicketItemRow
            key={item.id}
            item={item}
            column={column}
            onAction={onAction}
            busyId={busyId}
          />
        ))}
      </div>
    </div>
  );
}

function Column({
  title,
  tickets,
  column,
  onAction,
  busyId,
}: {
  title: string;
  tickets: UiTicket[];
  column: 'incoming' | 'fired' | 'complete';
  onAction: (ticketItemId: string, action: 'start' | 'ready' | 'serve') => void;
  busyId: string | null;
}) {
  return (
    <div className="rounded-2xl bg-[#2A2A2A] border border-white/10 p-4 min-h-[480px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
          {tickets.length}
        </span>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">
            No tickets
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              column={column}
              onAction={onAction}
              busyId={busyId}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function DisplayPage() {
  const [tickets, setTickets] = React.useState<UiTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const loadTickets = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sale/kds/tickets', {
        method: 'GET',
        cache: 'no-store',
      });

      const data = (await res.json()) as TicketsResponse;

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load tickets');
      }

      setTickets(data.tickets ?? []);
    } catch (err) {
      console.error('Failed to load KDS tickets', err);
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTickets();

    const timer = window.setInterval(() => {
      void loadTickets();
    }, 8000);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadTickets]);

  const grouped = React.useMemo(() => {
    return {
      incoming: tickets.filter((ticket) => ticket.status === 'incoming'),
      fired: tickets.filter((ticket) => ticket.status === 'fired'),
      complete: tickets.filter((ticket) => ticket.status === 'complete'),
    };
  }, [tickets]);

  const handleAction = React.useCallback(
    async (ticketItemId: string, action: 'start' | 'ready' | 'serve') => {
      setBusyId(ticketItemId);

      try {
        const res = await fetch(`/api/sale/kds/items/${ticketItemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to update KDS item');
        }

        await loadTickets();
      } catch (err) {
        console.error('Failed to update KDS item', err);
        setError(err instanceof Error ? err.message : 'Failed to update KDS item');
      } finally {
        setBusyId(null);
      }
    },
    [loadTickets]
  );

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white">
      <div className="border-b border-white/10 bg-[#292929] px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Kitchen Display</h1>
            <p className="text-sm text-white/50 mt-1">
              Live kitchen tickets and item progress
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FilterDropdown label="Kitchen" />
            <FilterDropdown label="Today" icon={<Clock className="h-3 w-3" />} />
            <button
              type="button"
              onClick={() => void loadTickets()}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/15"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="px-6 pt-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        </div>
      ) : null}

      <div className="p-6">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#2A2A2A] p-8 text-center text-white/50">
            Loading kitchen tickets...
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Column
              title="Incoming"
              tickets={grouped.incoming}
              column="incoming"
              onAction={handleAction}
              busyId={busyId}
            />
            <Column
              title="Fired"
              tickets={grouped.fired}
              column="fired"
              onAction={handleAction}
              busyId={busyId}
            />
            <Column
              title="Complete"
              tickets={grouped.complete}
              column="complete"
              onAction={handleAction}
              busyId={busyId}
            />
          </div>
        )}
      </div>
    </div>
  );
}