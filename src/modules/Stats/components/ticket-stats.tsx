// City Club HMS - Ticket Stats Component
// Ticket status breakdown for dashboard

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TicketStatsProps {
  incoming: number;
  fired: number;
  complete: number;
  scheduled: number;
  className?: string;
}

export function TicketStats({
  incoming,
  fired,
  complete,
  scheduled,
  className,
}: TicketStatsProps) {
  const total = incoming + fired + complete + scheduled;

  const stats = [
    { label: 'Incoming', count: incoming, color: 'bg-gray-500' },
    { label: 'Fired', count: fired, color: 'bg-gray-700' },
    { label: 'Complete', count: complete, color: 'bg-success' },
    { label: 'Scheduled', count: scheduled, color: 'bg-accent' },
  ];

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-h4 font-semibold">Tickets Today</h3>
          <Badge variant="secondary">{total} total</Badge>
        </div>

        {/* Progress bar */}
        <div className="h-3 flex rounded-full overflow-hidden bg-background-tertiary">
          {stats.map((stat) =>
            stat.count > 0 ? (
              <div
                key={stat.label}
                className={cn(stat.color, 'transition-all duration-500')}
                style={{ width: `${(stat.count / total) * 100}%` }}
              />
            ) : null
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <div className={cn('h-3 w-3 rounded-full', stat.color)} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-semibold ml-auto">{stat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
