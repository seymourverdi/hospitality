// City Club HMS - Reservation Details Panel
// Side panel showing full reservation details

'use client';

import * as React from 'react';
import {
  Clock,
  Users,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Star,
  Edit,
  Trash2,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { cn, formatDate } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ReservationWithDetails } from '../types';

const statusColors = {
  confirmed: 'text-success',
  seated: 'text-primary',
  completed: 'text-muted-foreground',
  cancelled: 'text-destructive',
  no_show: 'text-warning',
};

interface ReservationDetailsProps {
  reservation: ReservationWithDetails;
  onEdit?: () => void;
  onCancel?: () => void;
  onSeat?: () => void;
  onComplete?: () => void;
  onNoShow?: () => void;
  className?: string;
}

export function ReservationDetails({
  reservation,
  onEdit,
  onCancel,
  onSeat,
  onComplete,
  onNoShow,
  className,
}: ReservationDetailsProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours ?? '0', 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 font-semibold">Reservation Details</h2>
          <Badge
            variant="outline"
            className={cn('capitalize', statusColors[reservation.status])}
          >
            {reservation.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Guest info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={reservation.member?.avatar_url || undefined} />
            <AvatarFallback>
              {reservation.guest_name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{reservation.guest_name}</p>
            {reservation.member && (
              <Badge variant="secondary" className="text-[10px] mt-0.5">
                {reservation.member.member_number}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date & Time */}
        <div className="p-3 rounded-lg bg-background-secondary space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(new Date(reservation.reservation_date))}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatTime(reservation.reservation_time)}
              {reservation.duration_minutes && (
                <span className="text-muted-foreground">
                  {' '}
                  ({reservation.duration_minutes} min)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Party & Table */}
        <div className="p-3 rounded-lg bg-background-secondary space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Party of {reservation.party_size}</span>
          </div>
          {reservation.table && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                Table {reservation.table.table_number}
                {reservation.location && (
                  <span className="text-muted-foreground">
                    {' '}
                    - {reservation.location.name}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Contact */}
        {(reservation.guest_phone || reservation.guest_email) && (
          <div className="p-3 rounded-lg bg-background-secondary space-y-2">
            {reservation.guest_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.guest_phone}</span>
              </div>
            )}
            {reservation.guest_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{reservation.guest_email}</span>
              </div>
            )}
          </div>
        )}

        {/* Special occasion */}
        {reservation.special_occasion && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-warning" />
              <span className="font-medium capitalize">
                {reservation.special_occasion}
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        {reservation.notes && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Notes
            </p>
            <p className="text-sm p-3 rounded-lg bg-background-secondary">
              {reservation.notes}
            </p>
          </div>
        )}

        {/* Dietary requirements */}
        {reservation.dietary_requirements &&
          reservation.dietary_requirements.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Dietary Requirements
              </p>
              <div className="flex gap-2 flex-wrap">
                {reservation.dietary_requirements.map((req) => (
                  <Badge key={req} variant="allergen">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {/* Menu type */}
        {reservation.menu_type && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Menu Type
            </p>
            <Badge variant="secondary" className="capitalize">
              {reservation.menu_type.replace('-', ' ')}
            </Badge>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Status actions */}
        {reservation.status === 'confirmed' && (
          <div className="flex gap-2">
            <Button onClick={onSeat} className="flex-1">
              <UserCheck className="mr-2 h-4 w-4" />
              Seat Guest
            </Button>
            <Button variant="outline" onClick={onNoShow}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {reservation.status === 'seated' && (
          <Button onClick={onComplete} className="w-full" variant="success">
            <Check className="mr-2 h-4 w-4" />
            Complete
          </Button>
        )}

        {/* Edit/Cancel */}
        {reservation.status !== 'completed' &&
          reservation.status !== 'cancelled' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit} className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={onCancel} className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
