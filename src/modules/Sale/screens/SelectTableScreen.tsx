// City Club HMS - Select Table Screen (Step 3)
// Floor plan with table selection and seat assignment

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { useSale } from '../context/SaleContext';
import type {Table} from '../types';

type ApiTable = {
  id: string;
  name: string;
  shape: 'circle' | 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  seats: number[];
  maxSeats: number;
  floorId: string;
  status?: string;
  activeOrder?: {
    id: number;
    status: string;
    itemCount: number;
    totalAmount: number;
  } | null;
};

type ApiFloor = {
  id: string;
  name: string;
  tables: ApiTable[];
};

type FloorResponse = {
  ok: boolean;
  floors?: ApiFloor[];
  error?: string;
};

function normalizeTableStatus(status?: string, hasOrder?: boolean): string {
  if (hasOrder) return 'open order';

  const normalized = String(status ?? '').trim().toLowerCase();

  if (!normalized) return 'available';
  if (normalized === 'free') return 'available';

  return normalized;
}

function getStatusLabel(status?: string, hasOrder?: boolean) {
  const normalized = normalizeTableStatus(status, hasOrder);

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getStatusClasses(status?: string, hasOrder?: boolean) {
  const normalized = normalizeTableStatus(status, hasOrder);

  if (normalized === 'open order') {
    return 'bg-red-500/15 border-red-500/30 text-red-300';
  }

  if (normalized === 'reserved') {
    return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
  }

  if (normalized === 'dirty') {
    return 'bg-orange-500/15 border-orange-500/30 text-orange-300';
  }

  return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
}

function toSelectableTable(table: ApiTable): Table {
  return {
    id: table.id,
    name: table.name,
    shape: table.shape,
    x: table.x,
    y: table.y,
    width: table.width,
    height: table.height,
    seats: [],
    maxSeats: table.maxSeats,
    floorId: table.floorId,
  };
}

interface TableCardProps {
  table: ApiTable;
  isSelected: boolean;
  onSelect: (table: ApiTable) => void;
}

function TableCard({ table, isSelected, onSelect }: TableCardProps) {
  const hasOrder = Boolean(table.activeOrder);

  return (
    <button
      type="button"
      onClick={() => onSelect(table)}
      className={cn(
        'rounded-2xl border p-4 text-left transition-all',
        'hover:scale-[1.01]',
        isSelected
          ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
          : 'border-white/10 bg-sale-card hover:bg-[#444]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">{table.name}</div>
          <div className="mt-1 text-xs text-white/50">
            Seats: {table.maxSeats}
          </div>
        </div>

        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-[11px] font-medium',
            getStatusClasses(table.status, hasOrder)
          )}
        >
          {getStatusLabel(table.status, hasOrder)}
        </span>
      </div>

      {table.activeOrder ? (
        <div className="mt-4 rounded-xl bg-black/20 p-3">
          <div className="text-xs text-white/50">
            Order #{table.activeOrder.id}
          </div>
          <div className="mt-1 text-sm font-medium text-white">
            {table.activeOrder.itemCount} item
            {table.activeOrder.itemCount !== 1 ? 's' : ''}
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            ${table.activeOrder.totalAmount.toFixed(2)}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-white/45">
          No active order
        </div>
      )}

      <div className="mt-4 text-xs text-white/45">
        Shape: {table.shape}
      </div>
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

  const [floors, setFloors] = React.useState<ApiFloor[]>([]);
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

  const handleTableSelect = (table: ApiTable) => {
    const selectableTable = toSelectableTable(table);

    if (selectedTable?.id === selectableTable.id) {
      selectTable(selectableTable, selectedSeats);
    } else {
      selectTable(selectableTable, []);
    }
  };

  const handleSeatToggle = (seatNum: number) => {
    if (!selectedTable) return;

    const newSeats = selectedSeats.includes(seatNum)
      ? selectedSeats.filter((s) => s !== seatNum)
      : [...selectedSeats, seatNum];

    selectTable(selectedTable, newSeats);
  };

  const selectedTableMeta = React.useMemo(() => {
    if (!selectedTable || !activeFloor) return null;
    return activeFloor.tables.find((table) => table.id === selectedTable.id) ?? null;
  }, [selectedTable, activeFloor]);

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

      <div className="flex-1 rounded-xl bg-sale-panel p-4 min-h-[320px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-white/40 text-sm">Loading tables...</p>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : !activeFloor || activeFloor.tables.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-white/40 text-sm">No tables configured for this floor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeFloor.tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                isSelected={selectedTable?.id === table.id}
                onSelect={handleTableSelect}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTable && (
        <div className="mt-4 p-4 bg-sale-panel rounded-xl">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-white font-semibold">
                Table {selectedTable.name}
              </h3>
              <p className="text-white/40 text-xs">
                {selectedTable.maxSeats} seats available
              </p>

              {selectedTableMeta?.activeOrder ? (
                <div className="mt-2 text-xs text-white/60">
                  Existing order #{selectedTableMeta.activeOrder.id} ·{' '}
                  {selectedTableMeta.activeOrder.itemCount} item
                  {selectedTableMeta.activeOrder.itemCount !== 1 ? 's' : ''} · $
                  {selectedTableMeta.activeOrder.totalAmount.toFixed(2)}
                </div>
              ) : (
                <div className="mt-2 text-xs text-white/60">
                  No active order on this table
                </div>
              )}
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
            Tap a table to view full details and select seats
          </p>
        </div>
      )}
    </div>
  );
}