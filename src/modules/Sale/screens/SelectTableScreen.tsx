// City Club HMS - Select Table Screen (Step 3)
// Floor plan with table selection and seat assignment

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { useSale } from '../context/SaleContext';
import type { Table, Floor } from '../types';

type FloorResponse = {
  ok: boolean;
  floors?: Floor[];
  error?: string;
};

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

function SeatSelector({
  maxSeats,
  selectedSeats,
  onSeatToggle,
  className,
}: SeatSelectorProps) {
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
                'min-w-[40px] min-h-[40px]',
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

  const [floors, setFloors] = React.useState<Floor[]>([]);
  const [activeFloorId, setActiveFloorId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const activeFloor = React.useMemo(() => {
    if (!activeFloorId) return null;
    return floors.find((floor) => floor.id === activeFloorId) ?? null;
  }, [floors, activeFloorId]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadFloors() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/sale/tables', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = (await res.json()) as FloorResponse;

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to load tables');
        }

        const nextFloors = data.floors ?? [];

        if (!cancelled) {
          setFloors(nextFloors);
          setActiveFloorId(nextFloors[0]?.id ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load sale tables', err);
          setError(err instanceof Error ? err.message : 'Failed to load tables');
          setFloors([]);
          setActiveFloorId(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFloors();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTableSelect = (table: Table) => {
    if (selectedTable?.id === table.id) {
      selectTable(table, selectedSeats);
    } else {
      selectTable(table, []);
    }
  };

  const handleSeatToggle = (seatNum: number) => {
    if (!selectedTable) return;

    const newSeats = selectedSeats.includes(seatNum)
      ? selectedSeats.filter((s) => s !== seatNum)
      : [...selectedSeats, seatNum];

    selectTable(selectedTable, newSeats);
  };

  return (
    <div className={cn('flex-1 flex flex-col bg-sale-bg p-4', className)}>
      <div className="flex gap-2 mb-4 flex-wrap">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setActiveFloorId(floor.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeFloor?.id === floor.id
                ? 'bg-primary text-black'
                : 'bg-sale-card text-white hover:bg-[#444]'
            )}
          >
            {floor.name}
          </button>
        ))}
      </div>

      <div className="flex-1 relative bg-sale-panel rounded-xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 text-sm">Loading tables...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : activeFloor?.tables?.length ? (
          activeFloor.tables.map((table) => (
            <TableIcon
              key={table.id}
              table={table}
              isSelected={selectedTable?.id === table.id}
              onSelect={handleTableSelect}
            />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 text-sm">
              No tables configured for this floor
            </p>
          </div>
        )}
      </div>

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

      {!selectedTable && !loading && !error && (
        <div className="mt-4 p-4 bg-sale-panel rounded-xl text-center">
          <p className="text-white/40 text-sm">
            Tap a table on the floor plan to select it
          </p>
        </div>
      )}
    </div>
  );
}