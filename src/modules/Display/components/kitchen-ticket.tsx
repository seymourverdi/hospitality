// City Club HMS - Kitchen Ticket Card
// Card showing order for kitchen display

'use client';

import * as React from 'react';
import { Clock, AlertTriangle, Flame, Check } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { KitchenTicket } from '../types';

interface KitchenTicketCardProps {
  ticket: KitchenTicket;
  onFire?: () => void;
  onComplete?: () => void;
  onBump?: () => void;
  className?: string;
}

export function KitchenTicketCard({
  ticket,
  onFire,
  onComplete,
  onBump,
  className,
}: KitchenTicketCardProps) {
  // Calculate elapsed time string
  const elapsedStr = React.useMemo(() => {
    const mins = Math.floor(ticket.elapsedTime / 60);
    const secs = ticket.elapsedTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [ticket.elapsedTime]);

  // Determine if ticket is urgent (> 10 minutes)
  const isUrgent = ticket.elapsedTime > 600;

  // Progress percentage (based on 15 min target)
  const progress = Math.min((ticket.elapsedTime / 900) * 100, 100);

  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-card border border-border',
        'transition-all duration-200',
        isUrgent && ticket.status !== 'complete' && 'border-destructive bg-destructive/10',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="font-mono text-base font-bold"
          >
            #{ticket.orderNumber}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {ticket.tableNumber}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isUrgent && ticket.status !== 'complete'
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        >
          <Clock className="h-4 w-4" />
          {elapsedStr}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-3">
        {ticket.items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-2 p-2 rounded-lg',
              'bg-background-secondary'
            )}
          >
            <span className="font-semibold text-primary min-w-[24px]">
              {item.quantity}x
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.name}</p>
              {item.modifiers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {item.modifiers.join(' · ')}
                </p>
              )}
              {item.notes && (
                <p className="text-xs text-warning italic mt-1">
                  {item.notes}
                </p>
              )}
              {item.allergenNotes && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  <p className="text-xs text-destructive">
                    {item.allergenNotes}
                  </p>
                </div>
              )}
            </div>
            <Badge
              variant={item.routing === 'bar' ? 'bar' : 'kitchen'}
              className="text-[10px]"
            >
              {item.routing === 'bar' ? 'BAR' : 'K'}
            </Badge>
          </div>
        ))}
      </div>

      {/* Notes */}
      {ticket.notes && (
        <div className="mb-3 p-2 rounded-lg bg-warning/10 border border-warning/30">
          <p className="text-xs text-warning">{ticket.notes}</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden mb-3">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            progress < 50
              ? 'bg-success'
              : progress < 80
              ? 'bg-warning'
              : 'bg-destructive'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {ticket.status === 'incoming' && (
          <Button
            onClick={onFire}
            className="flex-1"
            variant="warning"
          >
            <Flame className="mr-2 h-4 w-4" />
            Fire
          </Button>
        )}
        {ticket.status === 'fired' && (
          <Button
            onClick={onComplete}
            className="flex-1"
            variant="success"
          >
            <Check className="mr-2 h-4 w-4" />
            Complete
          </Button>
        )}
        {ticket.status === 'complete' && (
          <Button
            onClick={onBump}
            variant="outline"
            className="flex-1"
          >
            Bump
          </Button>
        )}
      </div>

      {/* Server */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Server: {ticket.serverName}
      </div>
    </div>
  );
}
