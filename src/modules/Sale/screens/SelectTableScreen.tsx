// City Club HMS - Select Table Screen (Step 3)
// Floor plan with table selection and seat assignment

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { useSale } from '../context/SaleContext';
import type { Table, Floor } from '../types';

// Mock floor data - will be replaced with actual data
const MOCK_FLOORS: Floor[] = [
  {
    id: 'dining',
    name: 'Dining Room',
    tables: [
      { id: 'd1', name: 'D1', shape: 'rectangle', x: 50, y: 50, width: 80, height: 40, seats: [], maxSeats: 4, floorId: 'dining' },
      { id: 'd2', name: 'D2', shape: 'rectangle', x: 150, y: 50, width: 80, height: 40, seats: [], maxSeats: 4, floorId: 'dining' },
      { id: 'd3', name: 'D3', shape: 'rectangle', x: 250, y: 50, width: 80, height: 40, seats: [], maxSeats: 4, floorId: 'dining' },
      { id: 'd4', name: 'D4', shape: 'rectangle', x: 350, y: 50, width: 80, height: 40, seats: [], maxSeats: 4, floorId: 'dining' },
      { id: 'd5', name: 'D5', shape: 'circle', x: 100, y: 150, width: 60, height: 60, seats: [], maxSeats: 6, floorId: 'dining' },
      { id: 'd6', name: 'D6', shape: 'circle', x: 200, y: 150, width: 60, height: 60, seats: [], maxSeats: 6, floorId: 'dining' },
      { id: 'd7', name: 'D7', shape: 'circle', x: 300, y: 150, width: 60, height: 60, seats: [], maxSeats: 6, floorId: 'dining' },
      { id: 'ct', name: 'CT', shape: 'rectangle', x: 150, y: 250, width: 160, height: 60, seats: [], maxSeats: 10, floorId: 'dining' },
    ],
  },
];

interface TableIconProps {
  table: Table;
  isSelected: boolean;
  onSelect: (table: Table) => void;
}

function TableIcon({ table, isSelected, onSelect }: TableIconProps) {
  const isCircle = table.shape === 'circle';

  return (
    <button
      onClick={() => onSelect(table)}
      className={cn(
        'absolute transition-all duration-150',
        'flex items-center justify-center',
        'text-sm font-medium',
        isCircle ? 'rounded-full' : 'rounded-lg',
        isSelected
          ? 'bg-primary text-black ring-2 ring-white shadow-lg scale-105'
          : 'bg-sale-card text-white hover:bg-[#444] active:scale-95'
      )}
      style={{
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height,
      }}
    >
      {table.name}
    </button>
  );
}

interface SeatSelectorProps {
  maxSeats: number;
  selectedSeats: number[];
  onSeatToggle: (seatNum: number) => void;
  className?: string;
}

function SeatSelector({ maxSeats, selectedSeats, onSeatToggle, className }: SeatSelectorProps) {
  return (
    <div className={cn('', className)}>
      <p className="text-white/60 text-sm mb-3">Select Seat(s):</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: maxSeats }, (_, i) => i + 1).map((seatNum) => {
          const isSelected = selectedSeats.includes(seatNum);
          return (
            <button
              key={seatNum}
              onClick={() => onSeatToggle(seatNum)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                'text-sm font-medium transition-all',
                'min-w-[40px] min-h-[40px]', // Touch target
                isSelected
                  ? 'bg-primary text-black'
                  : 'bg-sale-card text-white hover:bg-[#444]'
              )}
            >
              {seatNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SelectTableScreenProps {
  className?: string;
}

export function SelectTableScreen({ className }: SelectTableScreenProps) {
  const { state, selectTable } = useSale();
  const { selectedTable, selectedSeats } = state;

  const [activeFloor, setActiveFloor] = React.useState<Floor>(MOCK_FLOORS[0]!);

  // Handle table selection
  const handleTableSelect = (table: Table) => {
    if (selectedTable?.id === table.id) {
      // If same table, keep selected seats
      selectTable(table, selectedSeats);
    } else {
      // New table, reset seats
      selectTable(table, []);
    }
  };

  // Handle seat toggle
  const handleSeatToggle = (seatNum: number) => {
    if (!selectedTable) return;

    const newSeats = selectedSeats.includes(seatNum)
      ? selectedSeats.filter((s) => s !== seatNum)
      : [...selectedSeats, seatNum];

    selectTable(selectedTable, newSeats);
  };

  return (
    <div className={cn('flex-1 flex flex-col bg-sale-bg p-4', className)}>
      {/* Floor Tabs */}
      <div className="flex gap-2 mb-4">
        {MOCK_FLOORS.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setActiveFloor(floor)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeFloor.id === floor.id
                ? 'bg-primary text-black'
                : 'bg-sale-card text-white hover:bg-[#444]'
            )}
          >
            {floor.name}
          </button>
        ))}
      </div>

      {/* Floor Plan */}
      <div className="flex-1 relative bg-sale-panel rounded-xl overflow-hidden min-h-[300px]">
        {activeFloor.tables.map((table) => (
          <TableIcon
            key={table.id}
            table={table}
            isSelected={selectedTable?.id === table.id}
            onSelect={handleTableSelect}
          />
        ))}

        {/* Empty state overlay if no tables */}
        {activeFloor.tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 text-sm">No tables configured for this floor</p>
          </div>
        )}
      </div>

      {/* Seat Selection (shown when table is selected) */}
      {selectedTable && (
        <div className="mt-4 p-4 bg-sale-panel rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">
                Table {selectedTable.name}
              </h3>
              <p className="text-white/40 text-xs">
                {selectedTable.maxSeats} seats available
              </p>
            </div>
            {selectedSeats.length > 0 && (
              <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm">
                {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <SeatSelector
            maxSeats={selectedTable.maxSeats}
            selectedSeats={selectedSeats}
            onSeatToggle={handleSeatToggle}
          />
        </div>
      )}

      {/* Instructions when no table selected */}
      {!selectedTable && (
        <div className="mt-4 p-4 bg-sale-panel rounded-xl text-center">
          <p className="text-white/40 text-sm">
            Tap a table on the floor plan to select it
          </p>
        </div>
      )}
    </div>
  );
}
