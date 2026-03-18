'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { useSale } from '../context/SaleContext';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    totalAmount: number | string;
  } | null;
};

type ApiFloor = {
  id: string;
  name: string;
  tables: ApiTable[];
};

type TableLayout = {
  id: number;
  x: number;
  y: number;
  shape: 'square' | 'round';
  seats: number;
};

// ─── SVG Table shapes ─────────────────────────────────────────────────────────

function SeatPip({ angle, size }: { angle: number; size: number }) {
  const r = (angle * Math.PI) / 180;
  const d = size / 2 + 9;
  const cx = size / 2 + Math.cos(r) * d;
  const cy = size / 2 + Math.sin(r) * d;
  return <rect x={cx - 6} y={cy - 4} width={12} height={8} rx={4} fill="#4a4a4a" />;
}

function TableSVG({ name, shape, seats, isSelected, hasOrder }: {
  name: string; shape: 'square' | 'round'; seats: number;
  isSelected: boolean; hasOrder: boolean;
}) {
  const s = 68;
  const fill   = isSelected ? '#1e3a2a' : hasOrder ? '#3a1e1e' : '#2e2e2e';
  const stroke = isSelected ? '#22c55e' : hasOrder ? '#c0392b' : '#4a4a4a';
  const color  = isSelected ? '#4ade80' : hasOrder ? '#f88' : '#ccc';

  const clamp = Math.min(Math.max(seats, 2), 6);
  const angles = shape === 'round'
    ? Array.from({ length: clamp }, (_, i) => (i * 360) / clamp - 90)
    : clamp === 2 ? [-90, 90]
    : clamp === 3 ? [-90, 0, 90]
    : [-90, 0, 90, 180];

  return (
    <svg width={s + 32} height={s + 32} style={{ overflow: 'visible', display: 'block' }}>
      <g transform="translate(16,16)">
        {angles.map((a, i) => <SeatPip key={i} angle={a} size={s} />)}
        {shape === 'round'
          ? <circle cx={s/2} cy={s/2} r={s/2} fill={fill} stroke={stroke} strokeWidth={2} />
          : <rect x={0} y={0} width={s} height={s} rx={8} fill={fill} stroke={stroke} strokeWidth={2} />}
        <text x={s/2} y={s/2 + 1} textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize={13} fontWeight="600" style={{ pointerEvents: 'none' }}>
          {name}
        </text>
      </g>
    </svg>
  );
}

// ─── Seat selector ────────────────────────────────────────────────────────────

function SeatSelector({ maxSeats, selectedSeats, onSeatToggle }: {
  maxSeats: number; selectedSeats: number[]; onSeatToggle: (n: number) => void;
}) {
  return (
    <div>
      <p className="text-white/60 text-sm mb-3">Select Seat(s):</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: maxSeats }, (_, i) => i + 1).map(n => (
          <button key={n} type="button" onClick={() => onSeatToggle(n)}
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all',
              selectedSeats.includes(n) ? 'bg-primary text-black' : 'bg-sale-card text-white hover:bg-[#444]'
            )}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SelectTableScreenProps { className?: string }

export function SelectTableScreen({ className }: SelectTableScreenProps) {
  const { state, selectTable } = useSale();
  const { selectedTable, selectedSeats } = state;

  const [floors, setFloors]         = React.useState<ApiFloor[]>([]);
  const [activeFloorId, setActiveFloorId] = React.useState<string | null>(null);
  const [layouts, setLayouts]       = React.useState<Map<number, TableLayout>>(new Map());
  const [loading, setLoading]       = React.useState(true);
  const [error, setError]           = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [tablesRes, layoutRes] = await Promise.all([
          fetch('/api/sale/tables', { cache: 'no-store' }),
          fetch('/api/admin/tables/layout', { cache: 'no-store' }),
        ]);

        const tablesData = await tablesRes.json() as { ok: boolean; floors?: ApiFloor[]; error?: string };

        // safe JSON for layout (may not exist)
        const layoutText = await layoutRes.text();
        let layoutData: { ok: boolean; layouts?: TableLayout[] } = { ok: false };
        try { layoutData = JSON.parse(layoutText) as typeof layoutData; } catch { /* ignore */ }

        if (!cancelled) {
          const nextFloors = tablesData.floors ?? [];
          setFloors(nextFloors);
          setActiveFloorId(nextFloors[0]?.id ?? null);

          // Build layout map
          const savedMap = new Map<number, TableLayout>(
            (layoutData.layouts ?? []).map(l => [l.id, l])
          );
          // Default positions for tables without saved layout
          nextFloors.forEach(floor => {
            floor.tables.forEach((t, i) => {
              const numId = Number(t.id);
              if (!savedMap.has(numId)) {
                const cols = 3;
                savedMap.set(numId, {
                  id: numId,
                  x: 80 + (i % cols) * 180,
                  y: 60 + Math.floor(i / cols) * 160,
                  shape: t.shape === 'circle' ? 'round' : 'square',
                  seats: Math.min(t.maxSeats, 6),
                });
              }
            });
          });
          setLayouts(savedMap);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tables');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const activeFloor = floors.find(f => f.id === activeFloorId) ?? null;

  function handleTableSelect(table: ApiTable) {
    const t = {
      id: table.id, name: table.name,
      maxSeats: table.maxSeats, floorId: table.floorId,
      shape: table.shape, x: table.x, y: table.y,
      width: table.width, height: table.height,
      seats: (table.seats ?? []).map((n: number) => ({ number: n, occupied: false })), status: table.status,
      activeOrder: table.activeOrder ? {
        id: table.activeOrder.id, status: table.activeOrder.status,
        itemCount: table.activeOrder.itemCount,
        totalAmount: table.activeOrder.totalAmount,
      } : null,
    };
    selectTable(t, selectedTable?.id === table.id ? selectedSeats : []);
  }

  function handleSeatToggle(n: number) {
    if (!selectedTable) return;
    const t = activeFloor?.tables.find(t => t.id === selectedTable.id);
    if (!t) return;
    const newSeats = selectedSeats.includes(n) ? selectedSeats.filter(s => s !== n) : [...selectedSeats, n];
    selectTable({ ...selectedTable }, newSeats);
  }

  const selectedTableMeta = activeFloor?.tables.find(t => t.id === selectedTable?.id) ?? null;

  return (
    <div className={cn('flex-1 flex flex-col bg-sale-bg p-4 overflow-hidden', className)}>
      {/* Floor tabs */}
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        {floors.map(floor => (
          <button key={floor.id} type="button" onClick={() => setActiveFloorId(floor.id)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeFloor?.id === floor.id ? 'bg-primary text-black' : 'bg-sale-card text-white hover:bg-[#444]')}>
            {floor.name}
          </button>
        ))}
      </div>

      {/* Floor plan canvas */}
      <div className="flex-1 rounded-xl bg-sale-panel overflow-auto relative min-h-[320px]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}>
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
          <div style={{ position: 'relative', minHeight: 400, minWidth: 600 }}>
            {activeFloor.tables.map(table => {
              const numId  = Number(table.id);
              const layout = layouts.get(numId);
              if (!layout) return null;

              const isSelected = selectedTable?.id === table.id;
              const hasOrder   = !!table.activeOrder;

              return (
                <div key={table.id}
                  style={{ position: 'absolute', left: layout.x, top: layout.y, cursor: 'pointer' }}
                  onClick={() => handleTableSelect(table)}>
                  <TableSVG
                    name={table.name}
                    shape={layout.shape}
                    seats={layout.seats}
                    isSelected={isSelected}
                    hasOrder={hasOrder}
                  />
                  {/* Status badge below table */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    {hasOrder ? (
                      <span style={{ fontSize: 10, backgroundColor: 'rgba(192,57,43,0.8)', color: '#fff', borderRadius: 8, padding: '1px 8px' }}>
                        Open order
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80', borderRadius: 8, padding: '1px 8px' }}>
                        Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected table info + seat selector */}
      {selectedTable && (
        <div className="mt-4 p-4 bg-sale-panel rounded-xl flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-white font-semibold">Table {selectedTable.name}</h3>
              <p className="text-white/40 text-xs">{selectedTable.maxSeats} seats available</p>
              {selectedTableMeta?.activeOrder ? (
                <div className="mt-1 text-xs text-white/60">
                  Existing order #{selectedTableMeta.activeOrder.id} · {selectedTableMeta.activeOrder.itemCount} item{selectedTableMeta.activeOrder.itemCount !== 1 ? 's' : ''} · ${Number(selectedTableMeta.activeOrder.totalAmount || 0).toFixed(2)}
                </div>
              ) : (
                <div className="mt-1 text-xs text-white/50">No active order on this table</div>
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
        <div className="mt-4 p-4 bg-sale-panel rounded-xl text-center flex-shrink-0">
          <p className="text-white/40 text-sm">Tap a table to view details and select seats</p>
        </div>
      )}
    </div>
  );
}