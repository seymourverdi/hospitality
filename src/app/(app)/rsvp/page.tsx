'use client';

import * as React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Reservation = {
  id: number;
  guestName: string | null;
  guestPhone: string | null;
  reservationTime: string;
  partySize: number;
  status: string;
  serviceType: string | null;
  note: string | null;
  tables: { id: number; name: string }[];
};

type ApiTable = { id: number; name: string; capacity: number; areaId: number; isActive: boolean };
type ApiArea  = { id: number; name: string };

type TableLayout = { id: number; x: number; y: number; shape: 'square' | 'round'; seats: number };

type RsvpConfig = {
  allowGuestOverride: boolean
  showTablesOption: boolean
  allowAllDayMenu: boolean
  allowSocialLunch: boolean
  allowMixed: boolean
}

const DEFAULT_RSVP_CONFIG: RsvpConfig = {
  allowGuestOverride: true, showTablesOption: true,
  allowAllDayMenu: true, allowSocialLunch: true, allowMixed: true,
}

// ─── Status colours ───────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  PENDING:   '#3b82f6',
  CONFIRMED: '#22c55e',
  SEATED:    '#a855f7',
  CANCELLED: '#ef4444',
  NO_SHOW:   '#f97316',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', SEATED: 'Seated',
  CANCELLED: 'Cancelled', NO_SHOW: 'No Show',
};

// ─── Table shape SVG ──────────────────────────────────────────────────────────

function SeatPip({ angle, size }: { angle: number; size: number }) {
  const r = (angle * Math.PI) / 180;
  const d = size / 2 + 9;
  return <rect x={size/2 + Math.cos(r)*d - 6} y={size/2 + Math.sin(r)*d - 4} width={12} height={8} rx={4} fill="#4a4a4a" />;
}

function TableSVG({ name, shape, seats, selected, occupied }: {
  name: string; shape: 'square' | 'round'; seats: number;
  selected?: boolean; occupied?: boolean;
}) {
  const s = 66;
  const fill = selected ? '#1e3a2a' : occupied ? '#3a1e1e' : '#2e2e2e';
  const stroke = selected ? '#22c55e' : occupied ? '#c0392b' : '#4a4a4a';
  const angles = shape === 'round'
    ? Array.from({ length: Math.max(seats,4) }, (_,i) => i*360/Math.max(seats,4) - 90)
    : seats === 2 ? [-90,90] : seats === 3 ? [-90,0,90] : [-90,0,90,180];
  return (
    <svg width={s+32} height={s+32} style={{ overflow: 'visible', display: 'block' }}>
      <g transform="translate(16,16)">
        {angles.map((a,i) => <SeatPip key={i} angle={a} size={s} />)}
        {shape === 'round'
          ? <circle cx={s/2} cy={s/2} r={s/2} fill={fill} stroke={stroke} strokeWidth={1.5}/>
          : <rect x={0} y={0} width={s} height={s} rx={7} fill={fill} stroke={stroke} strokeWidth={1.5}/>}
        <text x={s/2} y={s/2+1} textAnchor="middle" dominantBaseline="middle"
          fill={selected ? '#4ade80' : occupied ? '#f88' : '#ccc'} fontSize={12} fontWeight="600"
          style={{ pointerEvents: 'none' }}>{name}</text>
      </g>
    </svg>
  );
}

// ─── Floor map (Step 2) ───────────────────────────────────────────────────────

function FloorMap({ tables, layouts, areas, selectedTableIds, occupiedTableIds, onToggle }: {
  tables: ApiTable[];
  layouts: Map<number, TableLayout>;
  areas: ApiArea[];
  selectedTableIds: number[];
  occupiedTableIds: number[];
  onToggle: (id: number) => void;
}) {
  // Derive the default areaId from first available table or area
  const defaultAreaId = areas[0]?.id ?? tables[0]?.areaId ?? null;
  const [areaId, setAreaId] = React.useState<number | null>(null);
  const currentAreaId = areaId ?? defaultAreaId;
  // If no currentAreaId, show all tables; otherwise filter by area
  const visibleTables = currentAreaId
    ? tables.filter(t => t.areaId === currentAreaId && t.isActive)
    : tables.filter(t => t.isActive);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Area tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid #2a2a2a' }}>
        {areas.map(a => (
          <button key={a.id} type="button" onClick={() => setAreaId(a.id)}
            style={{
              padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
              backgroundColor: a.id === currentAreaId ? '#3a3a3a' : 'transparent',
              color: a.id === currentAreaId ? '#fff' : '#888',
            }}>{a.name}</button>
        ))}
      </div>
      {/* Canvas */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'auto',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '26px 26px', minHeight: 300,
      }}>
        {visibleTables.map(table => {
          const layout = layouts.get(table.id);
          if (!layout) return null;
          const isSelected = selectedTableIds.includes(table.id);
          return (
            <div key={table.id} style={{ position: 'absolute', left: layout.x, top: layout.y, cursor: 'pointer' }}
              onClick={() => onToggle(table.id)}>
              <TableSVG name={table.name} shape={layout.shape} seats={layout.seats} selected={isSelected} occupied={occupiedTableIds.includes(table.id) && !isSelected} />
              {isSelected && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                  <span style={{ fontSize: 10, backgroundColor: '#22c55e', color: '#fff', borderRadius: 8, padding: '1px 8px' }}>Selected</span>
                </div>
              )}
              {!isSelected && occupiedTableIds.includes(table.id) && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                  <span style={{ fontSize: 10, backgroundColor: 'rgba(192,57,43,0.8)', color: '#fff', borderRadius: 8, padding: '1px 8px' }}>Reserved</span>
                </div>
              )}
            </div>
          );
        })}
        {visibleTables.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13 }}>
            No tables in this area
          </div>
        )}
      </div>
      {/* Bottom seat strip */}
      {selectedTableIds.length > 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#1a1a1a' }}>
          {selectedTableIds.map(tid => {
            const t = tables.find(x => x.id === tid);
            return t ? (
              <div key={tid} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', backgroundColor: '#2a2a2a', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#ccc', fontWeight: 600 }}>{t.name}</span>
                {Array.from({ length: t.capacity }, (_, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: i === 0 ? '#22c55e' : '#444', border: '1px solid #555' }} />
                ))}
                <button type="button" onClick={() => onToggle(t.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── New Reservation form (right panel) ──────────────────────────────────────

function NewReservationPanel({ step, onStepChange, tables, layouts, areas, onCreated, rsvpConfig = DEFAULT_RSVP_CONFIG }: {
  step: 1 | 2;
  onStepChange: (s: 1 | 2) => void;
  tables: ApiTable[];
  layouts: Map<number, TableLayout>;
  areas: ApiArea[];
  onCreated: () => void;
  rsvpConfig?: RsvpConfig;
}) {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName]   = React.useState('');
  const [date, setDate]     = React.useState('');
  const [time, setTime]     = React.useState('');
  const [guests, setGuests] = React.useState('2');
  const [note, setNote]     = React.useState('');
  const [serviceType, setServiceType] = React.useState<string[]>(['ALL_DAY_MENU','SOCIAL_LUNCH','MIXED']);
  const [selectedTableIds, setSelectedTableIds] = React.useState<number[]>([]);
  const [occupiedTableIds, setOccupiedTableIds] = React.useState<number[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  function toggleService(s: string) {
    setServiceType(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function toggleTable(id: number) {
    // Don't allow selecting occupied tables
    if (occupiedTableIds.includes(id)) return;
    setSelectedTableIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function loadOccupiedTables(forDate: string, forTime: string) {
    if (!forDate) return;
    try {
      const dt = new Date(`${forDate}T${forTime || '12:00'}`);
      // Check reservations ±2 hours around selected time
      const from = new Date(dt.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const to   = new Date(dt.getTime() + 2 * 60 * 60 * 1000).toISOString();
      const res = await fetch(`/api/admin/reservations?from=${from}&to=${to}`, { cache: 'no-store' });
      const data = await safeJson(res) as { ok: boolean; reservations?: Reservation[] };
      if (data.ok && data.reservations) {
        const ids = data.reservations.flatMap(r => r.tables.map(t => t.id));
        setOccupiedTableIds(ids);
      }
    } catch { /* silent */ }
  }

  async function handleSubmit() {
    try {
      setSaving(true); setError(null);
      // Validate: if guest override is not allowed, name is required
      if (!rsvpConfig.allowGuestOverride && !firstName.trim()) {
        setError('Member name is required (Guest override is disabled)')
        return
      }
      // Use current time if not provided
      const dateStr = date || new Date().toISOString().split('T')[0];
      const timeStr = time || '12:00';
      const dt = new Date(`${dateStr}T${timeStr}`);
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestFirstName: firstName.trim() || undefined,
          guestLastName: lastName.trim() || undefined,
          reservationTime: dt.toISOString(),
          partySize: Number(guests),
          serviceType: (serviceType[0] ?? null) as 'ALL_DAY_MENU' | 'SOCIAL_LUNCH' | 'MIXED' | null,
          note: note.trim() || undefined,
          tableIds: selectedTableIds,
        }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error);
      // reset
      setFirstName(''); setLastName(''); setDate(''); setTime('');
      setGuests('2'); setNote(''); setSelectedTableIds([]); setOccupiedTableIds([]); setServiceType(['ALL_DAY_MENU','SOCIAL_LUNCH','MIXED']);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onStepChange(1);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally { setSaving(false); }
  }

  const selectedTable = tables.find(t => selectedTableIds[0] === t.id);

  const fieldStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '0 12px', height: 44, borderRadius: 10,
    backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
  };

  return (
    <div style={{ width: 340, flexShrink: 0, borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', backgroundColor: '#161616', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>New Reservation</h2>
        {success && (
          <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 12, color: '#4ade80' }}>
            ✓ Reservation created successfully
          </div>
        )}
      </div>

      {/* Step 1: form */}
      {step === 1 && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Date */}
          <div style={fieldStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 13, outline: 'none' }} />
          </div>

          {/* Member / Guest name */}
          <div style={{ ...fieldStyle, border: `1px solid ${!rsvpConfig.allowGuestOverride && !firstName.trim() ? '#ef444466' : '#3a3a3a'}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <input value={firstName} onChange={e => setFirstName(e.target.value)}
              placeholder={rsvpConfig.allowGuestOverride ? 'Member Name (optional)' : 'Member Name (required)'}
              style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 13, outline: 'none' }} />
          </div>

          {/* Time + Guests + Table */}
          <div style={{ display: 'grid', gridTemplateColumns: rsvpConfig.showTablesOption ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
            <div style={{ ...fieldStyle, padding: '0 10px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 11, outline: 'none', width: 0 }} />
            </div>
            <div style={{ ...fieldStyle, padding: '0 10px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
              <input type="number" min="1" max="20" value={guests} onChange={e => setGuests(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 12, outline: 'none', width: 0 }} />
            </div>
            {rsvpConfig.showTablesOption && (
              <button type="button" onClick={() => { void loadOccupiedTables(date, time); onStepChange(2); }}
                style={{ ...fieldStyle, padding: '0 10px', cursor: 'pointer', border: `1px solid ${selectedTable ? '#22c55e' : '#3a3a3a'}`, backgroundColor: selectedTable ? '#1e3a2a' : '#2a2a2a', color: selectedTable ? '#4ade80' : '#666', fontSize: 11 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                {selectedTable ? selectedTable.name : 'Table'}
              </button>
            )}
          </div>

          {/* Notes */}
          <div style={fieldStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Reservation Notes"
              style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 13, outline: 'none' }} />
          </div>

          {/* Service type — only show types allowed by rsvpConfig */}
          {(() => {
            const allTypes = [
              { val: 'ALL_DAY_MENU' as const, label: 'All-Day Menu', allowed: rsvpConfig.allowAllDayMenu },
              { val: 'SOCIAL_LUNCH' as const, label: 'Social Lunch', allowed: rsvpConfig.allowSocialLunch },
              { val: 'MIXED'        as const, label: 'Mixed',         allowed: rsvpConfig.allowMixed },
            ].filter(t => t.allowed)
            if (allTypes.length === 0) return null
            return (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {allTypes.map(({ val, label }) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 12, color: '#aaa' }}>
                    <div onClick={() => toggleService(val)}
                      style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: serviceType.includes(val) ? '#22c55e' : '#333', border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {serviceType.includes(val) && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2 2L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </div>
                    {label}
                  </label>
                ))}
              </div>
            )
          })()}

          {error && <p style={{ fontSize: 11, color: '#f87171', margin: 0 }}>{error}</p>}
        </div>
      )}

      {/* Step 2: floor map */}
      {step === 2 && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <FloorMap tables={tables} layouts={layouts} areas={areas}
            selectedTableIds={selectedTableIds} occupiedTableIds={occupiedTableIds} onToggle={toggleTable} />
        </div>
      )}

      {/* Bottom bar — always visible */}
      <div style={{ padding: '10px 18px', borderTop: '1px solid #2a2a2a', backgroundColor: '#111', flexShrink: 0 }}>
        {/* Stepper + summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 11 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>1</div>
          <span style={{ color: step === 1 ? '#ccc' : '#555' }}>Enter Details</span>
          {rsvpConfig.showTablesOption && <>
            <span style={{ color: '#333', margin: '0 2px' }}>·····</span>
            <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: step === 2 ? '#22c55e' : '#333', color: step === 2 ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>2</div>
            <span style={{ color: step === 2 ? '#ccc' : '#555' }}>Select Table</span>
          </>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, color: '#888' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>{guests}</span>
            {date && <span>{new Date(date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
            {time && <span>{time}</span>}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => onStepChange(1)}
            style={{ padding: '9px 16px', borderRadius: 8, backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>
            ← Back
          </button>
          {/* If tables disabled OR already on step 1 without tables: show Submit directly */}
          {step === 1 && rsvpConfig.showTablesOption ? (
            <button type="button" onClick={() => { void loadOccupiedTables(date, time); onStepChange(2); }}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, backgroundColor: '#22c55e', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Next →
            </button>
          ) : (
            <button type="button" onClick={() => void handleSubmit()} disabled={saving}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, backgroundColor: saving ? '#555' : '#22c55e', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Submit →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Row colours (left border) ────────────────────────────────────────────────

const ROW_BORDER_COLORS = ['#3b82f6','#a855f7','#22c55e','#f59e0b','#ef4444','#ec4899','#06b6d4'];

// ─── Main page ────────────────────────────────────────────────────────────────

// Safe JSON parse — returns { ok: false } if response is not valid JSON (e.g. 404 HTML)
const safeJson = async (res: Response) => {
  const text = await res.text();
  try { return JSON.parse(text) as unknown; } catch { return { ok: false }; }
};

export default function RsvpPage() {
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [tables, setTables]   = React.useState<ApiTable[]>([]);
  const [areas, setAreas]     = React.useState<ApiArea[]>([]);
  const [layouts, setLayouts] = React.useState<Map<number, TableLayout>>(new Map());
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch]   = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [step, setStep] = React.useState<1|2>(1);
  const [statusMenu, setStatusMenu] = React.useState<{ id: number; x: number; y: number } | null>(null);
  const [rsvpConfig, setRsvpConfig] = React.useState<RsvpConfig>(DEFAULT_RSVP_CONFIG);

  async function loadAll() {
    try {
      const [rsvpRes, tablesRes, layoutRes, settingsRes] = await Promise.all([
        fetch('/api/admin/reservations', { cache: 'no-store' }),
        fetch('/api/admin/tables', { cache: 'no-store' }),
        fetch('/api/admin/tables/layout', { cache: 'no-store' }),
        fetch('/api/admin/settings', { cache: 'no-store' }),
      ]);

      const rsvpData      = await safeJson(rsvpRes)      as { ok: boolean; reservations?: Reservation[] };
      const tablesData    = await safeJson(tablesRes)    as { ok: boolean; areas?: ApiArea[]; tables?: ApiTable[] };
      const layoutData    = await safeJson(layoutRes)    as { ok: boolean; layouts?: TableLayout[] };
      const settingsData  = await safeJson(settingsRes)  as { ok: boolean; settings?: { rsvpConfig?: Partial<RsvpConfig> } };
      if (settingsData.ok && settingsData.settings?.rsvpConfig) {
        setRsvpConfig(prev => ({ ...prev, ...settingsData.settings!.rsvpConfig }));
      }

      if (rsvpData.ok) setReservations(rsvpData.reservations ?? []);
      if (tablesData.ok) {
        const allTables = (tablesData.tables ?? []).filter(t => t.isActive);
        const allAreas = tablesData.areas ?? [];
        setAreas(allAreas);
        setTables(allTables);
      }
      if (layoutData.ok) {
        const savedMap = new Map<number, TableLayout>(
          (layoutData.layouts ?? []).map(l => [l.id, l])
        );
        // Default positions for tables without saved layout
        const allTables = (tablesData.tables ?? []).filter(t => t.isActive);
        const cols = 3;
        allTables.forEach((t, i) => {
          if (!savedMap.has(t.id)) {
            savedMap.set(t.id, {
              id: t.id, shape: t.capacity > 6 ? 'round' : 'square',
              seats: Math.min(t.capacity, 6),
              x: 100 + (i % cols) * 200, y: 80 + Math.floor(i / cols) * 180,
            });
          }
        });
        setLayouts(savedMap);
      }
    } finally { setLoading(false); }
  }

  React.useEffect(() => { void loadAll(); }, []);

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/admin/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setStatusMenu(null);
    void loadAll();
  }

  async function handleDelete() {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} reservation(s)?`)) return;
    await Promise.all(selectedIds.map(id => fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' })));
    setSelectedIds([]);
    void loadAll();
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleAll() {
    setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(r => r.id));
  }

  const filtered = reservations.filter(r =>
    !search || (r.guestName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a', color: '#fff', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left: reservations list ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 260px', padding: '0 12px', height: 36, borderRadius: 8, backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Reservations"
                style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 13, outline: 'none' }} />
            </div>

            {selectedIds.length > 0 && (
              <button type="button" onClick={() => void handleDelete()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 36, borderRadius: 8, backgroundColor: '#ef4444', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                🗑 Delete
              </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 36, borderRadius: 8, backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                May 1 – May 26
              </button>
              <button type="button"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 36, borderRadius: 8, backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>
                Monthly
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <button type="button"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 36, borderRadius: 8, backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>
                Export
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr 80px 100px 1fr 160px 120px', gap: 8, padding: '8px 14px', borderBottom: '1px solid #222', flexShrink: 0 }}>
            {['', 'Name', 'Date', 'Time', 'Guests', 'Location', 'Notes', 'Server'].map((h, i) => (
              <div key={i} style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                {i === 0
                  ? <div onClick={toggleAll} style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: selectedIds.length === filtered.length && filtered.length > 0 ? '#22c55e' : '#333', border: '1px solid #555', cursor: 'pointer' }} />
                  : h}
                {i > 0 && i < 7 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#444', fontSize: 13 }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#444', fontSize: 13 }}>No reservations</div>
            ) : (
              filtered.map((r, idx) => {
                const { date, time } = formatDateTime(r.reservationTime);
                const isSelected = selectedIds.includes(r.id);
                const borderColor = ROW_BORDER_COLORS[idx % ROW_BORDER_COLORS.length] ?? '#3b82f6';
                return (
                  <div key={r.id} onClick={() => toggleSelect(r.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '36px 1fr 1fr 80px 100px 1fr 160px 120px',
                      gap: 8, padding: '10px 14px', cursor: 'pointer',
                      borderBottom: '1px solid #222',
                      borderLeft: `3px solid ${borderColor}`,
                      backgroundColor: isSelected ? 'rgba(34,197,94,0.06)' : 'transparent',
                    }}>
                    {/* Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: isSelected ? '#22c55e' : '#333', border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2 2L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                      </div>
                    </div>
                    {/* Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: borderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(r.guestName ?? '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, color: '#ddd' }}>{r.guestName ?? 'Guest'}</span>
                    </div>
                    {/* Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#aaa' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span style={{ fontSize: 11 }}>{date}</span>
                    </div>
                    {/* Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {time}
                    </div>
                    {/* Guests */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                      {r.partySize}
                    </div>
                    {/* Location / Tables */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {r.tables.map(t => t.name).join(', ') || '—'}
                    </div>
                    {/* Notes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa', overflow: 'hidden' }}>
                      {r.note && <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.note}</span>
                      </>}
                    </div>
                    {/* Status — clickable */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setStatusMenu({ id: r.id, x: e.clientX, y: e.clientY }); }}
                        style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          backgroundColor: (STATUS_COLOR[r.status] ?? '#666') + '30',
                          color: STATUS_COLOR[r.status] ?? '#666',
                        }}>{STATUS_LABEL[r.status] ?? r.status} ▾</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: new reservation panel ── */}
        <NewReservationPanel
          step={step}
          onStepChange={setStep}
          tables={tables}
          layouts={layouts}
          areas={areas}
          onCreated={() => void loadAll()}
          rsvpConfig={rsvpConfig}
        />
      {/* Status context menu */}
      {statusMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setStatusMenu(null)} />
          <div style={{
            position: 'fixed', left: statusMenu.x, top: statusMenu.y,
            backgroundColor: '#1e1e1e', border: '1px solid #3a3a3a',
            borderRadius: 10, padding: '4px 0', zIndex: 50,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: 160,
          }}>
            {Object.entries(STATUS_LABEL).map(([status, label]) => (
              <button key={status} type="button"
                onClick={() => void updateStatus(statusMenu.id, status)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 14px', border: 'none',
                  backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left',
                  color: STATUS_COLOR[status] ?? '#ccc', fontSize: 13,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: STATUS_COLOR[status] ?? '#666', flexShrink: 0, display: 'inline-block' }} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}