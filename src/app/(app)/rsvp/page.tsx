// City Club HMS - RSVP Page
// Reservation management screen matching Figma design exactly

'use client';

import * as React from 'react';
import { Search, Calendar, Clock, Users, ChevronDown, Check, MapPin, Download } from 'lucide-react';
import { cn } from '@/core/lib/utils';

// Mock reservations data matching Figma
const reservationsData = [
  {
    id: '1',
    name: 'Thomas Kordell',
    avatar: 'TK',
    avatarColor: '#8B5CF6',
    date: 'Monday, August 25th, 2025',
    time: '9:30am',
    guests: 2,
    location: 'D4',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'seated',
    selected: false,
  },
  {
    id: '2',
    name: 'James Habig',
    avatar: 'JH',
    avatarColor: '#EC4899',
    date: 'Tuesday, August 26th, 2025',
    time: '12:30pm',
    guests: 5,
    location: 'D1',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'pending',
    selected: false,
  },
  {
    id: '3',
    name: 'Amanda Warner',
    avatar: 'AW',
    avatarColor: '#10B981',
    date: 'Wednesday, August 27th, 2025',
    time: '5:30pm',
    guests: 4,
    location: 'O3',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'next',
    selected: false,
  },
  {
    id: '4',
    name: 'Ryan Boykin',
    avatar: 'RB',
    avatarColor: '#F59E0B',
    date: 'Thursday, August 28th, 2025',
    time: '8:30am',
    guests: 6,
    location: 'T4',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'pending',
    selected: false,
  },
  {
    id: '5',
    name: 'Grace Yoon',
    avatar: 'GY',
    avatarColor: '#6366F1',
    date: 'Friday, August 29th, 2025',
    time: '10:00am',
    guests: 3,
    location: 'TT',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'pending',
    selected: false,
  },
  {
    id: '6',
    name: 'Steve Smith',
    avatar: 'SS',
    avatarColor: '#14B8A6',
    date: 'Monday, September 1st, 2025',
    time: '6:30pm',
    guests: 3,
    location: 'O2',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'search',
    selected: false,
  },
  {
    id: '7',
    name: 'Stefan du Toit',
    avatar: 'ST',
    avatarColor: '#EF4444',
    date: 'Monday, September 2nd, 2025',
    time: '5:45pm',
    guests: 2,
    location: 'D3',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'pending',
    selected: false,
  },
  {
    id: '8',
    name: 'Michael Carcase',
    avatar: 'MC',
    avatarColor: '#8B5CF6',
    date: 'Monday, September 3rd, 2025',
    time: '4:00pm',
    guests: 6,
    location: 'BR',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'search',
    selected: true,
  },
  {
    id: '9',
    name: 'Sina Simantob',
    avatar: 'SS',
    avatarColor: '#22C55E',
    date: 'Monday, September 4th, 2025',
    time: '12:00pm',
    guests: 4,
    location: 'L8',
    notes: 'Birthday Dinner!',
    server: null,
    status: 'pending',
    selected: false,
  },
];

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    seated: { bg: 'bg-green-500', text: 'text-white', label: 'Seated' },
    pending: { bg: 'bg-orange-500', text: 'text-white', label: 'Pending' },
    next: { bg: 'bg-blue-500', text: 'text-white', label: 'Next' },
    search: { bg: 'bg-purple-500', text: 'text-white', label: 'Search' },
  };

  const defaultConfig = { bg: 'bg-orange-500', text: 'text-white', label: 'Pending' };
  const config = statusConfig[status] ?? defaultConfig;

  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', config.bg, config.text)}>
      {config.label}
    </span>
  );
}

// Reservation Table Row
function ReservationRow({
  reservation,
  onSelect,
}: {
  reservation: typeof reservationsData[0];
  onSelect: () => void;
}) {
  return (
    <tr
      className={cn(
        'border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors',
        reservation.selected && 'bg-purple-900/30'
      )}
      onClick={onSelect}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <div
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center',
            reservation.selected
              ? 'bg-primary border-primary'
              : 'border-white/30'
          )}
        >
          {reservation.selected && <Check className="h-3 w-3 text-black" />}
        </div>
      </td>

      {/* Name with Avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: reservation.avatarColor }}
          >
            {reservation.avatar}
          </div>
          <span className="text-white text-sm">{reservation.name}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{reservation.date}</span>
        </div>
      </td>

      {/* Time */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Clock className="h-4 w-4" />
          <span>{reservation.time}</span>
        </div>
      </td>

      {/* Guests */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <span className="text-white/40">#</span>
          <span>{reservation.guests}</span>
        </div>
      </td>

      {/* Location */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{reservation.location}</span>
        </div>
      </td>

      {/* Notes */}
      <td className="px-4 py-3">
        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
          {reservation.notes}
        </span>
      </td>

      {/* Server */}
      <td className="px-4 py-3">
        <StatusBadge status={reservation.status} />
      </td>
    </tr>
  );
}

// New Reservation Form Panel
function NewReservationPanel() {
  return (
    <div className="w-80 bg-[#1a1a1a] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-lg">New Reservation</h2>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Reservation Date */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm">Reservation Date</label>
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#292929] text-white/60 text-sm">
            <span>Select Date</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Member Name */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm">Member Name</label>
          <input
            type="text"
            placeholder="Search member..."
            className="w-full px-3 py-2 rounded-lg bg-[#292929] text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Time and Guests Row */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <label className="text-white/60 text-sm">Time</label>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#292929] text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Time</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-white/60 text-sm">Guests</label>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#292929] text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Guests</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-white/60 text-sm">Table</label>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#292929] text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Table</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reservation Notes */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm">Reservation Notes</label>
          <textarea
            placeholder="Add notes..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#292929] text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-white/30 flex items-center justify-center bg-primary">
                <Check className="h-3 w-3 text-black" />
              </div>
              <span className="text-white/60 text-sm">All-Day Menu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-white/30 flex items-center justify-center">
              </div>
              <span className="text-white/60 text-sm">Social Lunch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-white/30 flex items-center justify-center bg-primary">
                <Check className="h-3 w-3 text-black" />
              </div>
              <span className="text-white/60 text-sm">Mixed</span>
            </div>
          </div>
        </div>

        {/* Add Guest Name */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-white/60" />
              <span className="text-white/60 text-sm">Add Guest Name</span>
              <span className="text-white/40 text-xs">Optional</span>
            </div>
            <button className="px-3 py-1 rounded bg-white/10 text-white/60 text-sm">
              Guest Name...
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Footer */}
      <div className="p-4 border-t border-white/10 bg-[#292929]">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-white text-xs">Enter Details</span>
          </div>
          <div className="h-px flex-1 bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 text-white/60 text-xs flex items-center justify-center">
              2
            </span>
            <span className="text-white/40 text-xs">Select Table</span>
          </div>
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-white/40 text-xs">Confirm Reservation</span>
        </div>

        {/* Date and Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
              4
            </span>
            <span>Thursday, May 28th</span>
            <span className="text-white/30">8:30 pm</span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
              Back
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-medium flex items-center gap-1">
              Next
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Column Header
function ColumnHeader({ label, sortable = true }: { label: string; sortable?: boolean }) {
  return (
    <th className="px-4 py-3 text-left">
      <button className="flex items-center gap-1 text-white/60 text-sm font-medium hover:text-white">
        {label}
        {sortable && <ChevronDown className="h-3 w-3" />}
      </button>
    </th>
  );
}

export default function RSVPPage() {
  const [reservations, setReservations] = React.useState(reservationsData);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSelectReservation = (id: string) => {
    setReservations(prev =>
      prev.map(r => ({
        ...r,
        selected: r.id === id ? !r.selected : false,
      }))
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#292929]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search Reservations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#333] text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date Range */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#333] text-white/60 text-sm">
          <Calendar className="h-4 w-4" />
          <span>May 1 - May 26</span>
        </div>

        {/* Monthly Dropdown */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#333] text-white/60 text-sm">
          Monthly
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Export Button */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#333] text-white/60 text-sm">
          Export
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#292929] border-b border-white/10">
              <tr>
                <th className="px-4 py-3 w-12" />
                <ColumnHeader label="Name" />
                <ColumnHeader label="Date" />
                <ColumnHeader label="Time" />
                <ColumnHeader label="Guests" />
                <ColumnHeader label="Location" />
                <ColumnHeader label="Notes" />
                <ColumnHeader label="Server" />
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <ReservationRow
                  key={reservation.id}
                  reservation={reservation}
                  onSelect={() => handleSelectReservation(reservation.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* New Reservation Panel */}
        <NewReservationPanel />
      </div>
    </div>
  );
}
