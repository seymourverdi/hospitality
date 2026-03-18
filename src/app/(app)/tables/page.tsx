'use client';

import * as React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveOrder = {
  id: number;
  status: string;
  totalAmount: string;
  openedAt: string;
  itemCount: number;
};

type ApiTable = {
  id: number;
  name: string;
  capacity: number;
  status: string;
  isActive: boolean;
  activeOrderId: number | null;
  activeOrder: ActiveOrder | null;
};

type ApiArea = {
  id: number;
  name: string;
  tables: ApiTable[];
};

// Layout positions stored in memory (in prod would be in DB / LocationSettings)
type TableLayout = {
  id: number;
  x: number;
  y: number;
  shape: 'square' | 'round';
  seats: number;
};

// ─── Table shapes ─────────────────────────────────────────────────────────────

function SeatPip({ angle, size }: { angle: number; size: number }) {
  const rad = (angle * Math.PI) / 180;
  const dist = size / 2 + 10;
  const cx = size / 2 + Math.cos(rad) * dist;
  const cy = size / 2 + Math.sin(rad) * dist;
  return (
    <rect
      x={cx - 7} y={cy - 5} width={14} height={10} rx={5}
      fill="#555" stroke="#666" strokeWidth={1}
    />
  );
}

function SquareTable({ name, size, seats, hasOrder, isSelected }: {
  name: string; size: number; seats: number;
  hasOrder: boolean; isSelected: boolean;
}) {
  const fill = hasOrder ? '#4a3030' : isSelected ? '#3a3a50' : '#3a3a3a';
  const stroke = hasOrder ? '#c0392b' : isSelected ? '#6c6cdc' : '#555';
  const seatAngles = seats === 2 ? [-90, 90] : seats === 3 ? [-90, 0, 90] : [-90, 0, 90, 180];

  return (
    <svg width={size + 40} height={size + 40} style={{ overflow: 'visible' }}>
      <g transform={`translate(20,20)`}>
        {seatAngles.map((a, i) => <SeatPip key={i} angle={a} size={size} />)}
        <rect x={0} y={0} width={size} height={size} rx={8}
          fill={fill} stroke={stroke} strokeWidth={1.5} />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          fill={hasOrder ? '#e88' : '#ccc'} fontSize={13} fontWeight="600">
          {name}
        </text>
      </g>
    </svg>
  );
}

function RoundTable({ name, size, seats, hasOrder, isSelected }: {
  name: string; size: number; seats: number;
  hasOrder: boolean; isSelected: boolean;
}) {
  const fill = hasOrder ? '#4a3030' : isSelected ? '#3a3a50' : '#3a3a3a';
  const stroke = hasOrder ? '#c0392b' : isSelected ? '#6c6cdc' : '#555';
  const r = size / 2;
  const seatCount = Math.max(seats, 4);
  const seatAngles = Array.from({ length: seatCount }, (_, i) => (i * 360) / seatCount - 90);

  return (
    <svg width={size + 40} height={size + 40} style={{ overflow: 'visible' }}>
      <g transform={`translate(20,20)`}>
        {seatAngles.map((a, i) => <SeatPip key={i} angle={a} size={size} />)}
        <circle cx={r} cy={r} r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />
        <circle cx={r} cy={r} r={r - 8} fill="none" stroke={stroke} strokeWidth={1}
          strokeDasharray="4 3" opacity={0.4} />
        <text x={r} y={r + 1} textAnchor="middle" dominantBaseline="middle"
          fill={hasOrder ? '#e88' : '#ccc'} fontSize={13} fontWeight="600">
          {name}
        </text>
      </g>
    </svg>
  );
}

// ─── Table popup ─────────────────────────────────────────────────────────────

function TablePopup({ table, onClose }: { table: ApiTable; onClose: () => void }) {
  const hasOrder = !!table.activeOrder;
  const order = table.activeOrder;

  function goToSale() {
    window.location.href = `/sale?tableId=${table.id}&orderId=${order?.id ?? ''}`;
  }

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1e1e1e', border: '1px solid #444',
        borderRadius: 12, padding: 0, minWidth: 200, maxWidth: 240,
        zIndex: 30, boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid #333',
        backgroundColor: hasOrder ? 'rgba(192,57,43,0.2)' : 'rgba(34,197,94,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{table.name}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
            backgroundColor: hasOrder ? 'rgba(192,57,43,0.4)' : 'rgba(34,197,94,0.2)',
            color: hasOrder ? '#f88' : '#4ade80',
          }}>
            {hasOrder ? 'Occupied' : 'Available'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
          {table.capacity} seats
        </div>
      </div>

      {hasOrder && order ? (
        <>
          {/* Order details */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #2a2a2a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#888' }}>Order #{order.id}</span>
              <span style={{ fontSize: 11, color: '#888' }}>
                {new Date(order.openedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#888' }}>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f88' }}>
                ${Number(order.totalAmount).toFixed(2)}
              </div>
            </div>
          </div>
          {/* Actions */}
          <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={goToSale}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                backgroundColor: '#22c55e', color: 'white',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              View Order →
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={goToSale}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              backgroundColor: '#2a2a2a', color: '#ccc',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              borderColor: '#444', borderWidth: 1, borderStyle: 'solid',
            }}
          >
            Open Order
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Table card (positioned on canvas) ───────────────────────────────────────

function TableNode({
  table, layout, users, editMode,
  isSelected, onClick, onDragEnd,
}: {
  table: ApiTable;
  layout: TableLayout;
  users: User[];
  editMode: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (id: number, x: number, y: number) => void;
}) {
  const hasOrder = !!table.activeOrder;
  const size = layout.shape === 'round' ? 80 : 80;
  const totalSize = size + 40;

  // Drag
  const dragging = React.useRef(false);
  const offset = React.useRef({ x: 0, y: 0 });

  function onMouseDown(e: React.MouseEvent) {
    if (!editMode) return;
    dragging.current = true;
    offset.current = { x: e.clientX - layout.x, y: e.clientY - layout.y };
    e.stopPropagation();
    e.preventDefault();
  }

  React.useEffect(() => {
    if (!editMode) return;
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      onDragEnd(table.id, e.clientX - offset.current.x, e.clientY - offset.current.y);
    }
    function onMouseUp() { dragging.current = false; }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [editMode, table.id, onDragEnd]);

  // Server assigned — find first user (placeholder)
  const assignedUser = hasOrder ? users[0] : null;

  return (
    <div
      style={{
        position: 'absolute',
        left: layout.x,
        top: layout.y,
        width: totalSize,
        cursor: editMode ? 'grab' : 'pointer',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => { e.stopPropagation(); if (!editMode) onClick(); }}
    >
      {/* Delete X in edit mode */}
      {editMode && (
        <div style={{
          position: 'absolute', top: -4, left: totalSize / 2 - 10,
          width: 20, height: 20, borderRadius: '50%',
          backgroundColor: '#c0392b', border: '2px solid #e74c3c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, cursor: 'pointer',
        }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <line x1="1" y1="1" x2="9" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="9" y1="1" x2="1" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      )}

      {layout.shape === 'round'
        ? <RoundTable name={table.name} size={size} seats={layout.seats} hasOrder={hasOrder} isSelected={isSelected} />
        : <SquareTable name={table.name} size={size} seats={layout.seats} hasOrder={hasOrder} isSelected={isSelected} />
      }

      {/* Server badge below table */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        {hasOrder && assignedUser ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: '#2a2a2a', border: '1px solid #444',
            borderRadius: 12, padding: '2px 8px',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              backgroundColor: assignedUser.avatarColor ?? '#666',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 700, color: 'white',
            }}>
              {assignedUser.firstName[0]}{assignedUser.lastName[0]}
            </div>
            <span style={{ fontSize: 11, color: '#aaa' }}>
              {assignedUser.firstName} {assignedUser.lastName[0]}.
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: '#2a2a2a', border: '1px solid #444',
            borderRadius: 12, padding: '2px 8px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            <span style={{ fontSize: 11, color: '#666' }}>Assign</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        )}
      </div>

      {/* Popup on select */}
      {isSelected && !editMode && (
        <TablePopup
          table={table}
          onClose={() => {}}
        />
      )}
    </div>
  );
}

// ─── Add Table dropdown ───────────────────────────────────────────────────────

const TABLE_PRESETS = [
  { seats: 2, shape: 'round'  as const, label: 'Round Table' },
  { seats: 2, shape: 'square' as const, label: 'Square Table' },
  { seats: 3, shape: 'round'  as const, label: 'Round Table' },
  { seats: 3, shape: 'square' as const, label: 'Square Table' },
  { seats: 4, shape: 'round'  as const, label: 'Round Table' },
  { seats: 4, shape: 'square' as const, label: 'Square Table' },
  { seats: 5, shape: 'round'  as const, label: 'Round Table' },
];

function AddTableDropdown({ onAdd }: { onAdd: (preset: typeof TABLE_PRESETS[0]) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8,
          backgroundColor: '#2a2a2a', border: '1px solid #444',
          color: '#ccc', fontSize: 13, cursor: 'pointer',
        }}
      >
        Add Table
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          backgroundColor: '#222', border: '1px solid #444', borderRadius: 10,
          padding: '6px 0', zIndex: 100, minWidth: 180,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {TABLE_PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onAdd(p); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '7px 14px',
                backgroundColor: 'transparent', border: 'none',
                color: '#ccc', fontSize: 13, cursor: 'pointer', gap: 12,
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#333')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  backgroundColor: '#333', border: '1px solid #555',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#aaa', flexShrink: 0,
                }}>{p.seats}</span>
                <span>{p.label}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Types for users ──────────────────────────────────────────────────────────

type User = {
  id: number;
  firstName: string;
  lastName: string;
  avatarColor: string | null;
};

// ─── Default layout generator ─────────────────────────────────────────────────

function generateDefaultLayout(tables: ApiTable[]): TableLayout[] {
  const cols = 3;
  const spacingX = 220;
  const spacingY = 200;
  const startX = 120;
  const startY = 80;

  return tables.map((t, i) => ({
    id: t.id,
    x: startX + (i % cols) * spacingX,
    y: startY + Math.floor(i / cols) * spacingY,
    shape: t.name.toLowerCase().includes('ct') || t.capacity > 6 ? 'round' : 'square',
    seats: Math.min(t.capacity, 4),
  }));
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TablesPage() {
  const [areas, setAreas] = React.useState<ApiArea[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedAreaId, setSelectedAreaId] = React.useState<number | null>(null);
  const [layouts, setLayouts] = React.useState<Map<number, TableLayout>>(new Map());
  const [editMode, setEditMode] = React.useState(false);
  const [selectedTableId, setSelectedTableId] = React.useState<number | null>(null);
  const [showAreaDropdown, setShowAreaDropdown] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  // Load tables — use admin API (no auth required)
  async function loadTables() {
    try {
      const res = await fetch('/api/admin/tables', { cache: 'no-store' });
      const data = await res.json() as {
        ok: boolean;
        areas?: { id: number; name: string; locationId: number; isActive: boolean }[];
        tables?: { id: number; name: string; capacity: number; status: string; isActive: boolean; areaId: number; activeOrderId?: number | null }[];
      };
      if (data.ok && data.areas && data.tables) {
        const built: ApiArea[] = data.areas.map(a => ({
          id: a.id,
          name: a.name,
          tables: (data.tables ?? [])
            .filter(t => t.areaId === a.id && t.isActive)
            .map((t: { id: number; name: string; capacity: number; status: string; isActive: boolean; areaId: number; activeOrderId?: number | null; activeOrder?: { id: number; status: string; totalAmount: string; openedAt: string; itemCount: number } | null }) => ({
              id: t.id,
              name: t.name,
              capacity: t.capacity,
              status: t.status,
              isActive: t.isActive,
              activeOrderId: t.activeOrderId ?? null,
              activeOrder: t.activeOrder ?? null,
            })),
        })).filter(a => a.tables.length > 0);

        setAreas(built);
        setSelectedAreaId(prev => prev ?? built[0]?.id ?? null);
        setLayouts(() => {
          // Load saved positions from localStorage first
          let saved = new Map<number, TableLayout>();
          try {
            const raw = localStorage.getItem('hms_table_layouts');
            if (raw) saved = new Map(JSON.parse(raw) as Array<[number, TableLayout]>);
          } catch { /* ignore */ }

          const next = new Map(saved);
          // Fill in any tables that don't have a saved position
          for (const area of built) {
            const defaults = generateDefaultLayout(area.tables);
            for (const d of defaults) {
              if (!next.has(d.id)) next.set(d.id, d);
            }
          }
          return next;
        });
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }

  // Load users for server badges
  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json() as { ok: boolean; users?: User[] };
      if (data.ok && data.users) setUsers(data.users);
    } catch { /* silent */ }
  }

  React.useEffect(() => {
    void loadTables();
    void loadUsers();
    const id = setInterval(() => void loadTables(), 15000);
    return () => clearInterval(id);
  }, []);

  const currentArea = areas.find(a => a.id === selectedAreaId) ?? areas[0];
  const tables = currentArea?.tables ?? [];

  function handleDragEnd(tableId: number, x: number, y: number) {
    setLayouts(prev => {
      const next = new Map(prev);
      const cur = next.get(tableId);
      if (cur) next.set(tableId, { ...cur, x: Math.max(0, x), y: Math.max(0, y) });
      return next;
    });
  }

  function handleAddTable(preset: typeof TABLE_PRESETS[0]) {
    // Add to canvas at center — in real app would create via API
    const fakeId = Date.now();
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.offsetWidth / 2 - 60 : 300;
    const cy = canvas ? canvas.offsetHeight / 2 - 60 : 200;
    setLayouts(prev => {
      const next = new Map(prev);
      next.set(fakeId, { id: fakeId, x: cx, y: cy, shape: preset.shape, seats: preset.seats });
      return next;
    });
  }

  function saveLayout() {
    // In prod: POST layout positions to LocationSettings
    setEditMode(false);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a', color: 'white', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        {/* Location / Area selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowAreaDropdown(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              backgroundColor: '#2a2a2a', border: '1px solid #444',
              color: '#ccc', fontSize: 13, cursor: 'pointer',
            }}
          >
            {currentArea?.name ?? 'Location'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showAreaDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              backgroundColor: '#222', border: '1px solid #444', borderRadius: 8,
              zIndex: 100, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              {areas.map(a => (
                <button key={a.id} type="button"
                  onClick={() => { setSelectedAreaId(a.id); setShowAreaDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left',
                    backgroundColor: a.id === selectedAreaId ? '#333' : 'transparent',
                    border: 'none', color: '#ccc', fontSize: 13, cursor: 'pointer',
                  }}>
                  {a.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {editMode && <AddTableDropdown onAdd={handleAddTable} />}

        {/* North label */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '3px 14px', borderRadius: 12, backgroundColor: '#2a2a2a', border: '1px solid #444', fontSize: 12, color: '#888' }}>
            North
          </div>
        </div>

        {/* Edit / Save */}
        {editMode ? (
          <button type="button" onClick={saveLayout}
            style={{ padding: '6px 18px', borderRadius: 8, backgroundColor: '#22c55e', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Save Layout
          </button>
        ) : (
          <button type="button" onClick={() => setEditMode(true)}
            style={{ padding: '6px 14px', borderRadius: 8, backgroundColor: '#2a2a2a', border: '1px solid #444', color: '#ccc', fontSize: 13, cursor: 'pointer' }}>
            Edit Layout
          </button>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        onClick={() => setSelectedTableId(null)}
      >
        {/* West label */}
        <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center' }}>
          <div style={{ padding: '3px 14px', borderRadius: 12, backgroundColor: '#2a2a2a', border: '1px solid #444', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
            West
          </div>
        </div>
        {/* East label */}
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'center' }}>
          <div style={{ padding: '3px 14px', borderRadius: 12, backgroundColor: '#2a2a2a', border: '1px solid #444', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
            East
          </div>
        </div>

        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
            Loading tables...
          </div>
        ) : tables.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
            No tables in this area
          </div>
        ) : (
          tables.map(table => {
            const layout = layouts.get(table.id);
            if (!layout) return null;
            return (
              <TableNode
                key={table.id}
                table={table}
                layout={layout}
                users={users}
                editMode={editMode}
                isSelected={selectedTableId === table.id}
                onClick={() => setSelectedTableId(prev => prev === table.id ? null : table.id)}
                onDragEnd={handleDragEnd}
              />
            );
          })
        )}

        {/* South label */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ padding: '3px 14px', borderRadius: 12, backgroundColor: '#2a2a2a', border: '1px solid #444', fontSize: 12, color: '#888' }}>
            South
          </div>
        </div>
      </div>
    </div>
  );
}