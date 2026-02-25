// City Club HMS - Kanban Board
// Main kitchen display kanban board

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { KanbanColumnComponent } from './kanban-column';
import type { KitchenTicket, KanbanColumn, DisplayFilters } from '../types';

interface KanbanBoardProps {
  tickets: KitchenTicket[];
  filters: DisplayFilters;
  onFire: (ticketId: string) => void;
  onComplete: (ticketId: string) => void;
  onBump: (ticketId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function KanbanBoard({
  tickets,
  filters,
  onFire,
  onComplete,
  onBump,
  isLoading = false,
  className,
}: KanbanBoardProps) {
  // Filter tickets by routing
  const filteredTickets = React.useMemo(() => {
    if (filters.routing === 'all') return tickets;
    return tickets.filter((ticket) =>
      ticket.items.some(
        (item) =>
          item.routing === filters.routing ||
          (filters.routing === 'kitchen' && item.routing === 'both')
      )
    );
  }, [tickets, filters.routing]);

  // Group tickets by status
  const ticketsByStatus = React.useMemo(() => {
    const grouped: Record<KanbanColumn, KitchenTicket[]> = {
      incoming: [],
      fired: [],
      complete: [],
    };

    filteredTickets.forEach((ticket) => {
      if (ticket.status === 'complete' && !filters.showComplete) return;
      grouped[ticket.status].push(ticket);
    });

    // Sort by elapsed time (longest first for urgency)
    grouped.incoming.sort((a, b) => b.elapsedTime - a.elapsedTime);
    grouped.fired.sort((a, b) => b.elapsedTime - a.elapsedTime);
    grouped.complete.sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));

    return grouped;
  }, [filteredTickets, filters.showComplete]);

  const columns: KanbanColumn[] = ['incoming', 'fired', 'complete'];

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-4 h-full',
        className
      )}
    >
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column}
          column={column}
          tickets={ticketsByStatus[column]}
          onFire={onFire}
          onComplete={onComplete}
          onBump={onBump}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
