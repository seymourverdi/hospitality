// City Club HMS - Server Stats Component
// Server performance breakdown for dashboard

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, getInitials } from '@/core/lib/utils';

interface ServerStat {
  id: string;
  name: string;
  avatar?: string;
  ordersCount: number;
  revenue: number;
  avgTicketTime: number; // in minutes
}

interface ServerStatsProps {
  servers: ServerStat[];
  className?: string;
}

export function ServerStats({ servers, className }: ServerStatsProps) {
  // Sort by revenue descending
  const sortedServers = [...servers].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <h3 className="text-h4 font-semibold">Server Performance</h3>

        <div className="space-y-3">
          {sortedServers.map((server) => (
            <div
              key={server.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-background-tertiary"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={server.avatar} alt={server.name} />
                <AvatarFallback>{getInitials(server.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{server.name}</p>
                <p className="text-xs text-muted-foreground">
                  {server.ordersCount} orders · Avg {server.avgTicketTime}min
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(server.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
