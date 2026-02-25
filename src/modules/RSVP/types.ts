// City Club HMS - RSVP Module Types

import type { Reservation, Member, Table, Location } from '@/core/database.types';

// Extended reservation with relations
export interface ReservationWithDetails extends Reservation {
  member?: Member | null;
  table?: Table | null;
  location?: Location | null;
}

// Reservation form data
export interface ReservationFormData {
  memberId?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  durationMinutes: number;
  tableId?: string;
  locationPreference?: string;
  notes?: string;
  specialOccasion?: string;
  dietaryRequirements?: string[];
  menuType?: string;
}

// Time slot for availability
export interface TimeSlot {
  time: string;
  available: boolean;
  tablesAvailable: number;
}
