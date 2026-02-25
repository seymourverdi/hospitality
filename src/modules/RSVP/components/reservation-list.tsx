// City Club HMS - Reservation List
// List of reservations for a date

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { ReservationCard } from './reservation-card';
import { ReservationItemSkeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ReservationWithDetails } from '../types';

interface ReservationListProps {
  reservations: ReservationWithDetails[];
  selectedId?: string;
  onSelect: (reservation: ReservationWithDetails) => void;
  isLoading?: boolean;
  className?: string;
}

export function ReservationList({
  reservations,
  selectedId,
  onSelect,
  isLoading = false,
  className,
}: ReservationListProps) {
  // Group reservations by time
  const groupedReservations = React.useMemo(() => {
    const groups: Record<string, ReservationWithDetails[]> = {};
    reservations.forEach((res) => {
      const hour = res.reservation_time.split(':')[0] ?? '12';
      const period = parseInt(hour, 10) < 12 ? 'Morning' : parseInt(hour, 10) < 17 ? 'Afternoon' : 'Evening';
      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(res);
    });
    // Sort by time within each group
    Object.values(groups).forEach((group) => {
      group.sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
    });
    return groups;
  }, [reservations]);

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(5)].map((_, i) => (
          <ReservationItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <p className="text-muted-foreground">No reservations for this date</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new reservation to get started
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="space-y-6 p-4">
        {['Morning', 'Afternoon', 'Evening'].map((period) => {
          const groupReservations = groupedReservations[period];
          if (!groupReservations?.length) return null;

          return (
            <div key={period}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {period}
              </h3>
              <div className="space-y-2">
                {groupReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    isSelected={reservation.id === selectedId}
                    onSelect={() => onSelect(reservation)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
