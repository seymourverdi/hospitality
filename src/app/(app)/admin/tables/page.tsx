'use client'

import * as React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminLocation = { id: number; name: string }
type AdminArea = {
  id: number; locationId: number; name: string
  sortOrder: number | null; isActive: boolean
  location: AdminLocation; _count: { tables: number }
}
type AdminTable = {
  id: number; locationId: number; areaId: number
  name: string; capacity: number; status: string; isActive: boolean
  location: AdminLocation; area: { id: number; name: string }
}
type TablesResponse = {
  ok: true; locations: AdminLocation[]
  areas: AdminArea[]; tables: AdminTable[]
}

type TableLayout = {
  id: number; x: number; y: number
  shape: 'square' | 'round'; seats: number
}

// ─── Table shapes (SVG) ───────────────────────────────────────────────────────

function SeatPip({ angle, size }: { angle: number; size: number }) {
  const rad = (angle * Math.PI) / 180
  const dist = size / 2 + 10
  const cx = size / 2 + Math.cos(rad) * dist
  const cy = size / 2 + Math.sin(rad) * dist
  return <rect x={cx - 7} y={cy - 5} width={14} height={10} rx={5} fill="#4a4a4a" stroke="#555" strokeWidth={1} />
}

function TableShape({ name, shape, seats, isSelected, isNew }: {
  name: string; shape: 'square' | 'round'; seats: number
  isSelected: boolean; isNew?: boolean
}) {
  const size = 76
  const fill = isNew ? '#1e3a2a' : isSelected ? '#2a2a4a' : '#2e2e2e'
  const stroke = isNew ? '#22c55e' : isSelected ? '#6c6cdc' : '#4a4a4a'
  const textColor = isNew ? '#4ade80' : '#ccc'
  const clampedSeats = Math.min(Math.max(seats, 2), 6)
  const seatAngles = shape === 'round'
    ? Array.from({ length: clampedSeats }, (_, i) => (i * 360) / clampedSeats - 90)
    : clampedSeats === 2 ? [-90, 90]
    : clampedSeats === 3 ? [-90, 0, 90]
    : [-90, 0, 90, 180]

  return (
    <svg width={size + 40} height={size + 40} style={{ overflow: 'visible', display: 'block' }}>
      <g transform="translate(20,20)">
        {seatAngles.map((a, i) => <SeatPip key={i} angle={a} size={size} />)}
        {shape === 'round' ? (
          <>
            <circle cx={size/2} cy={size/2} r={size/2} fill={fill} stroke={stroke} strokeWidth={1.5} />
            <circle cx={size/2} cy={size/2} r={size/2 - 8} fill="none" stroke={stroke} strokeWidth={1} strokeDasharray="4 3" opacity={0.35} />
          </>
        ) : (
          <rect x={0} y={0} width={size} height={size} rx={8} fill={fill} stroke={stroke} strokeWidth={1.5} />
        )}
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          fill={textColor} fontSize={13} fontWeight="600" style={{ pointerEvents: 'none' }}>
          {name}
        </text>
      </g>
    </svg>
  )
}

// ─── Draggable table node ─────────────────────────────────────────────────────

function TableNode({ table, layout, isSelected, onClick, onDragEnd, onDelete }: {
  table: AdminTable; layout: TableLayout
  isSelected: boolean
  onClick: () => void
  onDragEnd: (id: number, x: number, y: number) => void
  onDelete: (id: number) => void
}) {
  const dragging = React.useRef(false)
  const offset = React.useRef({ x: 0, y: 0 })
  const moved = React.useRef(false)
  const nodeSize = 76 + 40

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true
    moved.current = false
    offset.current = { x: e.clientX - layout.x, y: e.clientY - layout.y }
    e.stopPropagation()
    e.preventDefault()
  }

  React.useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      moved.current = true
      onDragEnd(table.id, Math.max(10, e.clientX - offset.current.x), Math.max(10, e.clientY - offset.current.y))
    }
    function onMouseUp() {
      if (!moved.current && dragging.current) onClick()
      dragging.current = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [table.id, onDragEnd, onClick])

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute', left: layout.x, top: layout.y,
        width: nodeSize, cursor: 'grab', userSelect: 'none',
      }}
    >
      {/* Delete button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete(table.id) }}
        style={{
          position: 'absolute', top: -6, left: nodeSize / 2 - 10,
          width: 20, height: 20, borderRadius: '50%',
          backgroundColor: '#c0392b', border: '2px solid #1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, cursor: 'pointer',
        }}
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
          <line x1="1" y1="1" x2="9" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="9" y1="1" x2="1" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      <TableShape
        name={table.name} shape={layout.shape}
        seats={layout.seats} isSelected={isSelected}
      />

      {/* Capacity badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <span style={{ fontSize: 10, color: '#666', backgroundColor: '#222', border: '1px solid #333', borderRadius: 8, padding: '1px 8px' }}>
          {table.capacity} seats
        </span>
      </div>

      {/* Edit panel on select */}
      {isSelected && (
        <TableEditPanel table={table} layout={layout} />
      )}
    </div>
  )
}

// ─── Inline edit panel ────────────────────────────────────────────────────────

function TableEditPanel({ table, layout }: { table: AdminTable; layout: TableLayout }) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: '100%', left: '50%',
        transform: 'translateX(-50%)', marginTop: 8,
        backgroundColor: '#1e1e1e', border: '1px solid #444',
        borderRadius: 10, padding: '10px 14px', minWidth: 180,
        zIndex: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{table.name}</div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Area: {table.area.name}</div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Capacity: {table.capacity} seats</div>
      <div style={{ fontSize: 11, color: '#888' }}>
        Shape: <span style={{ color: '#aaa' }}>{layout.shape}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: '#555' }}>Drag to reposition</div>
    </div>
  )
}

// ─── Add table dropdown ───────────────────────────────────────────────────────

const TABLE_PRESETS = [
  { seats: 2, shape: 'square' as const, label: 'Square Table' },
  { seats: 2, shape: 'round'  as const, label: 'Round Table'  },
  { seats: 4, shape: 'square' as const, label: 'Square Table' },
  { seats: 4, shape: 'round'  as const, label: 'Round Table'  },
  { seats: 6, shape: 'round'  as const, label: 'Round Table'  },
  { seats: 8, shape: 'round'  as const, label: 'Round Table'  },
]

function AddTableDropdown({ onSelect }: { onSelect: (p: typeof TABLE_PRESETS[0]) => void }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white font-medium transition">
        + Add Table
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          backgroundColor: '#1e1e1e', border: '1px solid #444',
          borderRadius: 10, padding: '6px 0', zIndex: 100, minWidth: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        }}>
          {TABLE_PRESETS.map((p, i) => (
            <button key={i} type="button"
              onClick={() => { onSelect(p); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 14px',
                backgroundColor: 'transparent', border: 'none',
                color: '#ccc', fontSize: 13, cursor: 'pointer', gap: 12,
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: p.shape === 'round' ? '50%' : 4,
                  backgroundColor: '#333', border: '1px solid #555',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#aaa', flexShrink: 0,
                }}>{p.seats}</span>
                <span>{p.seats}-seat {p.label}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Create table modal ───────────────────────────────────────────────────────

function CreateTableModal({ areas, locations, preset, onSave, onClose }: {
  areas: AdminArea[]; locations: AdminLocation[]
  preset: typeof TABLE_PRESETS[0]
  onSave: (table: AdminTable, layout: TableLayout) => void
  onClose: () => void
}) {
  const [name, setName] = React.useState('')
  const [locationId, setLocationId] = React.useState(String(locations[0]?.id ?? ''))
  const [areaId, setAreaId] = React.useState(String(areas[0]?.id ?? ''))
  const [capacity, setCapacity] = React.useState(String(preset.seats))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const filteredAreas = areas.filter(a => String(a.locationId) === locationId)

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: Number(locationId),
          areaId: Number(areaId),
          name: name.trim(),
          capacity: Number(capacity),
          status: 'available',
          isActive: true,
        }),
      })
      const data = await res.json() as { ok: boolean; table?: { id: number }; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Failed')

      const newTable: AdminTable = {
        id: data.table!.id,
        locationId: Number(locationId),
        areaId: Number(areaId),
        name: name.trim(),
        capacity: Number(capacity),
        status: 'available',
        isActive: true,
        location: locations.find(l => l.id === Number(locationId)) ?? { id: Number(locationId), name: '' },
        area: areas.find(a => a.id === Number(areaId)) ?? { id: Number(areaId), name: '' },
      }
      const newLayout: TableLayout = {
        id: data.table!.id,
        x: 120 + Math.random() * 400,
        y: 80 + Math.random() * 300,
        shape: preset.shape,
        seats: Number(capacity),
      }
      onSave(newTable, newLayout)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[380px] bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Preview */}
        <div className="flex items-center justify-center py-6 bg-[#161616]">
          <TableShape name={name || '?'} shape={preset.shape} seats={Number(capacity)} isSelected={false} isNew />
        </div>

        <div className="p-5 space-y-3">
          <h3 className="text-base font-semibold text-white">New {preset.seats}-seat {preset.label}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Table Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="T1"
                className="w-full h-10 rounded-lg bg-neutral-800 border border-white/10 px-3 text-white text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Capacity</label>
              <input type="number" min="1" max="20" value={capacity} onChange={e => setCapacity(e.target.value)}
                className="w-full h-10 rounded-lg bg-neutral-800 border border-white/10 px-3 text-white text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Location</label>
            <select value={locationId} onChange={e => { setLocationId(e.target.value); setAreaId(String(areas.find(a => String(a.locationId) === e.target.value)?.id ?? '')) }}
              className="w-full h-10 rounded-lg bg-neutral-800 border border-white/10 px-3 text-white text-sm outline-none">
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Area</label>
            <select value={areaId} onChange={e => setAreaId(e.target.value)}
              className="w-full h-10 rounded-lg bg-neutral-800 border border-white/10 px-3 text-white text-sm outline-none">
              {filteredAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-white/60 transition">
              Cancel
            </button>
            <button type="button" onClick={() => void handleSave()} disabled={!name.trim() || saving}
              className="flex-1 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
              {saving ? 'Saving...' : 'Place Table'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Area selector tabs ───────────────────────────────────────────────────────

function AreaTabs({ areas, selectedId, onSelect, onAddArea }: {
  areas: AdminArea[]; selectedId: number | null
  onSelect: (id: number) => void; onAddArea: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      {areas.map(a => (
        <button key={a.id} type="button" onClick={() => onSelect(a.id)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            selectedId === a.id ? 'bg-neutral-700 text-white' : 'text-white/50 hover:text-white/80'
          }`}>
          {a.name}
          <span className="ml-1.5 text-xs text-white/30">{a._count.tables}</span>
        </button>
      ))}
      <button type="button" onClick={onAddArea}
        className="px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition">
        + Area
      </button>
    </div>
  )
}

// ─── Add area modal ───────────────────────────────────────────────────────────

function AddAreaModal({ locations, onSave, onClose }: {
  locations: AdminLocation[]; onSave: () => void; onClose: () => void
}) {
  const [name, setName] = React.useState('')
  const [locationId, setLocationId] = React.useState(String(locations[0]?.id ?? ''))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) { setError('Name required'); return }
    try {
      setSaving(true)
      const res = await fetch('/api/admin/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: Number(locationId), name: name.trim(), isActive: true }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Failed')
      onSave()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[320px] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/10 p-5">
        <h3 className="text-base font-semibold text-white mb-4">New Area</h3>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Area name (e.g. Main Hall)"
            className="w-full h-10 rounded-lg bg-neutral-800 border border-white/10 px-3 text-white text-sm outline-none" />
          <select value={locationId} onChange={e => setLocationId(e.target.value)}
            className="w-full h-10 rounded-lg bg-neutral-800 border border-white/10 px-3 text-white text-sm outline-none">
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-white/60 transition">Cancel</button>
            <button type="button" onClick={() => void handleSave()} disabled={!name.trim() || saving}
              className="flex-1 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Default layout ───────────────────────────────────────────────────────────

function generateDefaultLayout(tables: AdminTable[]): TableLayout[] {
  const cols = 3
  return tables.map((t, i) => ({
    id: t.id,
    x: 120 + (i % cols) * 220,
    y: 80 + Math.floor(i / cols) * 210,
    shape: t.capacity > 6 ? 'round' : 'square',
    seats: Math.min(t.capacity, 6),
  }))
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminTablesPage() {
  const [locations, setLocations] = React.useState<AdminLocation[]>([])
  const [areas, setAreas] = React.useState<AdminArea[]>([])
  const [tables, setTables] = React.useState<AdminTable[]>([])
  const [layouts, setLayouts] = React.useState<Map<number, TableLayout>>(new Map())
  const [selectedAreaId, setSelectedAreaId] = React.useState<number | null>(null)
  const [selectedTableId, setSelectedTableId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [pendingPreset, setPendingPreset] = React.useState<typeof TABLE_PRESETS[0] | null>(null)
  const [showAddArea, setShowAddArea] = React.useState(false)

  async function loadData() {
    try {
      setLoading(true)
      const [tablesRes, layoutRes] = await Promise.all([
        fetch('/api/admin/tables', { cache: 'no-store' }),
        fetch('/api/admin/tables/layout', { cache: 'no-store' }),
      ])
      const data = await tablesRes.json() as TablesResponse | { ok: false; error: string }
      const layoutData = await layoutRes.json() as { ok: boolean; layouts?: TableLayout[] }
      if (!data.ok) return
      setLocations(data.locations)
      setAreas(data.areas)
      setTables(data.tables)
      setSelectedAreaId(prev => prev ?? data.areas[0]?.id ?? null)

      // Build layout map: saved positions first, fallback to default
      const savedMap = new Map<number, TableLayout>(
        (layoutData.layouts ?? []).map(l => [l.id, l])
      )
      setLayouts(() => {
        const next = new Map(savedMap)
        const defaults = generateDefaultLayout(data.tables)
        for (const d of defaults) { if (!next.has(d.id)) next.set(d.id, d) }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { void loadData() }, [])

  // Debounced save to DB
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  function saveLayouts(map: Map<number, TableLayout>) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await fetch('/api/admin/tables/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layouts: Array.from(map.values()) }),
      })
    }, 600)
  }

  const areasTables = tables.filter(t => t.areaId === selectedAreaId)

  function handleDragEnd(id: number, x: number, y: number) {
    setLayouts(prev => {
      const next = new Map(prev)
      const cur = next.get(id)
      if (cur) next.set(id, { ...cur, x, y })
      saveLayouts(next)
      return next
    })
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this table?')) return
    await fetch(`/api/admin/tables/${id}`, { method: 'DELETE' })
    setTables(prev => prev.filter(t => t.id !== id))
    setLayouts(prev => {
      const next = new Map(prev)
      next.delete(id)
      saveLayouts(next)
      return next
    })
    if (selectedTableId === id) setSelectedTableId(null)
  }

  function handleTableCreated(table: AdminTable, layout: TableLayout) {
    setTables(prev => [...prev, table])
    setLayouts(prev => {
      const next = new Map(prev)
      next.set(layout.id, layout)
      saveLayouts(next)
      return next
    })
    setPendingPreset(null)
    setSelectedAreaId(table.areaId)
    // Update area count
    setAreas(prev => prev.map(a => a.id === table.areaId
      ? { ...a, _count: { tables: a._count.tables + 1 } } : a))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <AreaTabs
            areas={areas}
            selectedId={selectedAreaId}
            onSelect={id => { setSelectedAreaId(id); setSelectedTableId(null) }}
            onAddArea={() => setShowAddArea(true)}
          />
        </div>

        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-full bg-neutral-800 border border-white/10 text-xs text-white/50">
            North
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <AddTableDropdown onSelect={preset => setPendingPreset(preset)} />
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          minHeight: 'calc(100vh - 120px)',
        }}
        onClick={() => setSelectedTableId(null)}
      >
        {/* Compass labels */}
        <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>
          <div className="px-3 py-1 rounded-full bg-neutral-800 border border-white/10 text-xs text-white/40"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>West</div>
        </div>
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
          <div className="px-3 py-1 rounded-full bg-neutral-800 border border-white/10 text-xs text-white/40"
            style={{ writingMode: 'vertical-rl' }}>East</div>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="px-4 py-1 rounded-full bg-neutral-800 border border-white/10 text-xs text-white/50">South</div>
        </div>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">
            Loading...
          </div>
        ) : areasTables.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-white/20 text-sm">No tables in this area</div>
            <button type="button" onClick={() => setPendingPreset(TABLE_PRESETS[2]!)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white transition">
              + Add first table
            </button>
          </div>
        ) : (
          areasTables.map(table => {
            const layout = layouts.get(table.id)
            if (!layout) return null
            return (
              <TableNode
                key={table.id}
                table={table}
                layout={layout}
                isSelected={selectedTableId === table.id}
                onClick={() => setSelectedTableId(prev => prev === table.id ? null : table.id)}
                onDragEnd={handleDragEnd}
                onDelete={handleDelete}
              />
            )
          })
        )}

        {/* Stats strip bottom right */}
        {!loading && areasTables.length > 0 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-white/30">
            <span>{areasTables.length} table{areasTables.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{areasTables.reduce((s, t) => s + t.capacity, 0)} seats total</span>
          </div>
        )}
      </div>

      {/* Modals */}
      {pendingPreset && (
        <CreateTableModal
          areas={areas.filter(a => a.isActive)}
          locations={locations}
          preset={pendingPreset}
          onSave={handleTableCreated}
          onClose={() => setPendingPreset(null)}
        />
      )}

      {showAddArea && (
        <AddAreaModal
          locations={locations}
          onSave={() => { setShowAddArea(false); void loadData() }}
          onClose={() => setShowAddArea(false)}
        />
      )}
    </div>
  )
}