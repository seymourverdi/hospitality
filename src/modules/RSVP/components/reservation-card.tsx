// City Club HMS - Reservation Card
// Card showing reservation details in list

'use client';

import * as React from 'react';
import { Clock, Users, MapPin, Star } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ReservationWithDetails } from '../types';

const statusColors = {
  confirmed: 'bg-success',
  seated: 'bg-primary',
  completed: 'bg-muted',
  cancelled: 'bg-destructive',
  no_show: 'bg-warning',
};

const statusLabels = {
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

interface ReservationCardProps {
  reservation: ReservationWithDetails;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function ReservationCard({
  reservation,
  isSelected = false,
  onSelect,
  className,
}: ReservationCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours ?? '0', 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-4 rounded-xl text-left transition-all',
        'bg-card border-2',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'border-primary shadow-md'
          : 'border-transparent hover:border-border',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Time badge */}
        <div className="flex flex-col items-center">
          <div className="text-h3 font-bold">
            {formatTime(reservation.reservation_time)}
          </div>
          <Badge
            variant="secondary"
            className="mt-1 text-[10px]"
            style={{
              backgroundColor:
                statusColors[reservation.status] + '20',
              color:
                reservation.status === 'confirmed'
                  ? 'rgb(34 197 94)'
                  : undefined,
            }}
          >
            {statusLabels[reservation.status]}
          </Badge>
        </div>

        {/* Guest info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">
              {reservation.guest_name}
            </p>
            {reservation.member && (
              <Badge variant="secondary" className="text-[10px]">
                Member
              </Badge>
            )}
            {reservation.special_occasion && (
              <Star className="h-4 w-4 text-warning" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {reservation.party_size}
            </span>
            {reservation.table && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {reservation.table.table_number}
              </span>
            )}
            {reservation.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {reservation.duration_minutes}min
              </span>
            )}
          </div>

          {reservation.notes && (
            <p className="text-xs text-muted-foreground mt-2 truncate italic">
              {reservation.notes}
            </p>
          )}

          {reservation.dietary_requirements &&
            reservation.dietary_requirements.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {reservation.dietary_requirements.map((req) => (
                  <Badge key={req} variant="allergen" className="text-[10px]">
                    {req}
                  </Badge>
                ))}
              </div>
            )}
        </div>
      </div>
    </button>
  );
}
