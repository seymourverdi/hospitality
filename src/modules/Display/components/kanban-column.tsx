// City Club HMS - Kanban Column
// Column for kitchen display kanban board

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KitchenTicketCard } from './kitchen-ticket';
import { TicketSkeleton } from '@/components/ui/skeleton';
import type { KitchenTicket, KanbanColumn } from '../types';

const columnConfig = {
  incoming: {
    title: 'Incoming',
    color: 'bg-muted',
    headerColor: 'text-muted-foreground',
  },
  fired: {
    title: 'Fired',
    color: 'bg-warning/20',
    headerColor: 'text-warning',
  },
  complete: {
    title: 'Complete',
    color: 'bg-success/20',
    headerColor: 'text-success',
  },
};

interface KanbanColumnProps {
  column: KanbanColumn;
  tickets: KitchenTicket[];
  onFire?: (ticketId: string) => void;
  onComplete?: (ticketId: string) => void;
  onBump?: (ticketId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function KanbanColumnComponent({
  column,
  tickets,
  onFire,
  onComplete,
  onBump,
  isLoading = false,
  className,
}: KanbanColumnProps) {
  const config = columnConfig[column];

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-xl',
        'bg-background-secondary border border-border',
        className
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          'flex items-center justify-between p-4',
          'border-b border-border'
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', config.color)} />
          <h2 className={cn('text-sm font-semibold', config.headerColor)}>
            {config.title}
          </h2>
        </div>
        <Badge variant="secondary">{tickets.length}</Badge>
      </div>

      {/* Tickets */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {isLoading ? (
            <>
              <TicketSkeleton />
              <TicketSkeleton />
              <TicketSkeleton />
            </>
          ) : tickets.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No tickets
            </div>
          ) : (
            tickets.map((ticket) => (
              <KitchenTicketCard
                key={ticket.id}
                ticket={ticket}
                onFire={() => onFire?.(ticket.id)}
                onComplete={() => onComplete?.(ticket.id)}
                onBump={() => onBump?.(ticket.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
