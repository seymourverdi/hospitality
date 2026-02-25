// City Club HMS - Display (Kitchen) Page
// Kitchen display screen matching Figma design exactly

'use client';

import * as React from 'react';
import { ChevronDown, Check, Clock } from 'lucide-react';
import { cn } from '@/core/lib/utils';

// Sample ticket data matching Figma
const ticketsData = {
  incoming: [
    {
      id: '1',
      items: [
        {
          id: '1a',
          name: 'Grilled Cheese and Tomato Soup',
          modifier: 'Extra Toasted Please and extra butter',
          allergy: null,
          seat: 2,
          server: 'Stefan du Toit',
          completed: false,
        },
        {
          id: '1b',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: false,
        },
        {
          id: '1c',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: false,
        },
      ],
      time: '4:58pm',
      elapsed: '1 Minute 36 Seconds...',
    },
    {
      id: '2',
      course: 'Course Two',
      items: [
        {
          id: '2a',
          name: 'Grilled Cheese and Tomato Soup',
          modifier: 'Extra Toasted Please and extra butter',
          allergy: null,
          seat: 2,
          server: 'Stefan du Toit',
          completed: false,
        },
        {
          id: '2b',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: false,
        },
        {
          id: '2c',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: true,
        },
      ],
      time: '4:58pm',
      elapsed: '1 Minute 36 Seconds...',
    },
  ],
  fired: [
    {
      id: '3',
      course: 'Course One',
      courseCount: 1,
      items: [
        {
          id: '3a',
          name: 'Grilled Cheese and Tomato Soup',
          modifier: 'Extra Toasted Please and extra butter',
          allergy: null,
          seat: 2,
          server: 'Stefan du Toit',
          completed: true,
        },
        {
          id: '3b',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: false,
        },
        {
          id: '3c',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: false,
        },
      ],
      time: '4:58pm',
      elapsed: '1 Minute 38 Seconds...',
    },
    {
      id: '4',
      course: 'Course Two',
      courseCount: 2,
      items: [
        {
          id: '4a',
          name: 'Grilled Cheese and Tomato Soup',
          modifier: 'Extra Toasted Please and extra butter',
          allergy: null,
          seat: 2,
          server: 'Stefan du Toit',
          completed: false,
        },
        {
          id: '4b',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: false,
        },
      ],
      time: '4:58pm',
      elapsed: '1 Minute 38 Seconds...',
    },
  ],
  complete: [
    {
      id: '5',
      items: [
        {
          id: '5a',
          name: 'Grilled Cheese and Tomato Soup',
          modifier: 'Extra Toasted Please and extra butter',
          allergy: null,
          seat: 2,
          server: 'Stefan du Toit',
          completed: true,
        },
        {
          id: '5b',
          name: 'Gotham Greens Salad with Chicken',
          modifier: null,
          allergy: 'No Dairy Please (Dairy Allergy)',
          seat: 2,
          server: 'Lidia Jones',
          completed: true,
        },
      ],
      time: '4:58pm',
      elapsed: '1 Minute 38 Seconds...',
    },
  ],
};

// Count bar items
const countItems = [
  { name: 'Gotham Greens Salad with Chicken', count: 2, color: '#22C55E' },
  { name: 'Grilled Cheese', count: 1, color: '#22C55E' },
  { name: 'House Dessert', count: 1, color: '#22C55E' },
  { name: 'Chocolate Bark', count: 1, color: '#A855F7' },
  { name: 'Side: Chicken', count: 1, color: '#F97316' },
  { name: 'Ham & Gruyere Croissant Sandwich', count: 1, color: '#22C55E' },
  { name: 'Chicken Quesadilla', count: 1, color: '#22C55E' },
];

// Filter Dropdown Button
function FilterDropdown({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button className="flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs">
      {icon}
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  );
}

// Ticket Item Component
function TicketItem({
  item,
  showCheckbox = true,
}: {
  item: typeof ticketsData.incoming[0]['items'][0];
  showCheckbox?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
      {showCheckbox && (
        <div
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5',
            item.completed
              ? 'bg-primary border-primary'
              : 'border-white/30'
          )}
        >
          {item.completed && <Check className="h-3 w-3 text-black" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-white text-sm">{item.name}</span>
          {item.completed && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
        </div>
        {item.modifier && (
          <p className="text-orange-400 text-xs mt-1">{item.modifier}</p>
        )}
        {item.allergy && (
          <p className="text-red-400 text-xs mt-1">{item.allergy}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
          <span className="flex items-center gap-1">
            Seat {item.seat} <ChevronDown className="h-3 w-3" />
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            👤 {item.server}
          </span>
        </div>
      </div>
    </div>
  );
}

// Ticket Card Component
function TicketCard({
  ticket,
  columnType,
}: {
  ticket: typeof ticketsData.incoming[0];
  columnType: 'incoming' | 'fired' | 'complete';
}) {
  const bgColor = columnType === 'incoming'
    ? 'bg-[#1a1a1a]'
    : columnType === 'fired'
      ? 'bg-blue-900/30'
      : 'bg-green-900/30';

  return (
    <div className={cn('rounded-xl overflow-hidden', bgColor)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <FilterDropdown label="Location" />
        <FilterDropdown label="Table" />
        <button className="ml-auto text-white/50">
          <Clock className="h-4 w-4" />
        </button>
      </div>

      {/* Course Header (if applicable) */}
      {ticket.course && (
        <div className="flex items-center justify-between px-3 py-2 bg-blue-500">
          <span className="text-white text-sm font-medium">{ticket.course}</span>
        </div>
      )}

      {/* Items */}
      <div className="px-3">
        {ticket.items.map((item) => (
          <TicketItem key={item.id} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
        <span>Today {ticket.time}</span>
        <span>{ticket.elapsed}</span>
      </div>
    </div>
  );
}

// Column Component
function Column({
  title,
  tickets,
  type,
  count,
}: {
  title: string;
  tickets: typeof ticketsData.incoming;
  type: 'incoming' | 'fired' | 'complete';
  count: number;
}) {
  const headerColor = type === 'incoming'
    ? 'text-white/60'
    : type === 'fired'
      ? 'text-blue-400'
      : 'text-green-400';

  const dotColor = type === 'incoming'
    ? 'bg-white/40'
    : type === 'fired'
      ? 'bg-blue-400'
      : 'bg-green-400';

  return (
    <div className="flex-1 flex flex-col min-w-[350px]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', dotColor)} />
          <span className={cn('font-semibold', headerColor)}>{title}</span>
        </div>
        <span className="w-6 h-6 rounded-full bg-white/10 text-white/60 text-xs flex items-center justify-center">
          {count}
        </span>
      </div>

      {/* Tickets */}
      <div className="flex-1 overflow-y-auto space-y-3 px-2">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} columnType={type} />
        ))}
      </div>
    </div>
  );
}

// Count Bar Component
function CountBar() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-t border-white/10 overflow-x-auto">
      <div className="flex items-center gap-2 text-white/60 text-sm flex-shrink-0">
        <span className="text-xl">≡</span>
        <span className="font-medium">Count</span>
      </div>
      {countItems.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <span
            className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: item.color }}
          >
            {item.count}
          </span>
          <span className="text-white text-xs">{item.name}</span>
        </div>
      ))}

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        <span className="px-3 py-1 rounded bg-primary text-black text-xs font-medium">
          Scheduled
        </span>
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span>All</span>
          <span>Bar</span>
        </div>
        <button className="px-3 py-1 rounded bg-primary text-black text-xs font-medium">
          Kitchen
        </button>
      </div>
    </div>
  );
}

export default function DisplayPage() {
  return (
    <div className="h-screen flex flex-col bg-[#292929]">
      {/* Main Content - Three Columns */}
      <div className="flex-1 flex overflow-hidden">
        <Column
          title="Incoming"
          tickets={ticketsData.incoming}
          type="incoming"
          count={ticketsData.incoming.length}
        />
        <Column
          title="Fired"
          tickets={ticketsData.fired}
          type="fired"
          count={ticketsData.fired.length}
        />
        <Column
          title="Complete"
          tickets={ticketsData.complete}
          type="complete"
          count={ticketsData.complete.length}
        />
      </div>

      {/* Count Bar */}
      <CountBar />
    </div>
  );
}
