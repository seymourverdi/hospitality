'use client'

import * as React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Location   = { id: number; name: string }
type Category   = { id: number; name: string; locationId: number }
type KdsStation = { id: number; name: string }
type ModGroup   = { id: number; name: string; isRequired: boolean }

type MenuItem = {
  id: number
  locationId: number
  categoryId: number
  name: string
  sku: string | null
  description: string | null
  basePrice: string
  taxRate: string | null
  isAlcohol: boolean
  isActive: boolean
  allergens: string[]
  kdsStationId: number | null
  category: { id: number; name: string }
  location: { id: number; name: string }
  kdsStation: { id: number; name: string } | null
  modifierGroups: ModGroup[]
}

type MenuData = {
  ok: true
  locations: Location[]
  categories: Category[]
  kdsStations: KdsStation[]
  items: MenuItem[]
}

const ALLERGEN_LIST = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Soy', 'Fish', 'Shellfish', 'Sesame']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(price: string) {
  const n = parseFloat(price)
  return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`
}

function initials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

const CAT_COLORS = ['#7EB8F7','#A78BFA','#F472B6','#4ADE80','#FACC15','#3B82F6','#7C3AED','#EF4444','#22C55E','#F59E0B']
function catColor(id: number) { return CAT_COLORS[id % CAT_COLORS.length] ?? '#6B7280' }

// ─── Item Form (shared by Create + Edit) ─────────────────────────────────────

type ItemFormData = {
  name: string
  description: string
  basePrice: string
  locationId: string
  categoryId: string
  kdsStationId: string
  isActive: boolean
  isAlcohol: boolean
  allergens: string[]
}

function ItemForm({
  data, onChange, locations, categories, kdsStations,
}: {
  data: ItemFormData
  onChange: (patch: Partial<ItemFormData>) => void
  locations: Location[]
  categories: Category[]
  kdsStations: KdsStation[]
}) {
  const filteredCats = categories.filter(c => !data.locationId || c.locationId === Number(data.locationId))

  function toggleAllergen(a: string) {
    onChange({
      allergens: data.allergens.includes(a)
        ? data.allergens.filter(x => x !== a)
        : [...data.allergens, a],
    })
  }

  const inp = 'w-full h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 text-white placeholder:text-white/30 outline-none text-sm focus:border-white/30'
  const sel = 'w-full h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 text-white outline-none text-sm focus:border-white/30'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-white/40 mb-1 block">Name *</label>
          <input value={data.name} onChange={e => onChange({ name: e.target.value })} placeholder="Item name" className={inp} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Price *</label>
          <input value={data.basePrice} onChange={e => onChange({ basePrice: e.target.value })} placeholder="0.00" type="number" min="0" step="0.01" className={inp} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Location *</label>
          <select value={data.locationId} onChange={e => onChange({ locationId: e.target.value, categoryId: '' })} className={sel}>
            <option value="">— select —</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Category *</label>
          <select value={data.categoryId} onChange={e => onChange({ categoryId: e.target.value })} className={sel}>
            <option value="">— select —</option>
            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">KDS Station</label>
          <select value={data.kdsStationId} onChange={e => onChange({ kdsStationId: e.target.value })} className={sel}>
            <option value="">— none —</option>
            {kdsStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-white/40 mb-1 block">Description</label>
          <textarea value={data.description} onChange={e => onChange({ description: e.target.value })} placeholder="Optional description…" rows={2}
            className="w-full rounded-xl bg-neutral-700 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 outline-none text-sm resize-none focus:border-white/30" />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
          <input type="checkbox" checked={data.isActive} onChange={e => onChange({ isActive: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
          <input type="checkbox" checked={data.isAlcohol} onChange={e => onChange({ isAlcohol: e.target.checked })} className="w-4 h-4 rounded accent-amber-500" />
          Alcohol
        </label>
      </div>

      <div>
        <label className="text-xs text-white/40 mb-2 block">Allergens</label>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_LIST.map(a => (
            <button key={a} type="button" onClick={() => toggleAllergen(a)}
              className={`px-3 py-1 rounded-full text-xs transition border ${
                data.allergens.includes(a)
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
              }`}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateModal({ locations, categories, kdsStations, onCreated, onClose }: {
  locations: Location[]; categories: Category[]; kdsStations: KdsStation[]
  onCreated: () => void; onClose: () => void
}) {
  const [form, setForm] = React.useState<ItemFormData>({
    name: '', description: '', basePrice: '', locationId: String(locations[0]?.id ?? ''),
    categoryId: '', kdsStationId: '', isActive: true, isAlcohol: false, allergens: [],
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function patch(p: Partial<ItemFormData>) { setForm(f => ({ ...f, ...p })) }

  async function handleCreate() {
    if (!form.name.trim() || !form.locationId || !form.categoryId) {
      setError('Name, location and category are required'); return
    }
    try {
      setSaving(true); setError(null)
      const res = await fetch('/api/admin/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          basePrice: form.basePrice || '0',
          locationId: Number(form.locationId),
          categoryId: Number(form.categoryId),
          kdsStationId: form.kdsStationId ? Number(form.kdsStationId) : null,
          isActive: form.isActive,
          isAlcohol: form.isAlcohol,
          allergens: form.allergens,
        }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Failed')
      onCreated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full sm:w-[500px] bg-neutral-800 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">New Item</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-2xl leading-none">&times;</button>
        </div>
        <ItemForm data={form} onChange={patch} locations={locations} categories={categories} kdsStations={kdsStations} />
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white/60 hover:bg-white/15 transition">Cancel</button>
          <button onClick={() => void handleCreate()} disabled={saving}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
            {saving ? 'Creating…' : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ item, locations, categories, kdsStations, onSaved, onClose }: {
  item: MenuItem; locations: Location[]; categories: Category[]; kdsStations: KdsStation[]
  onSaved: () => void; onClose: () => void
}) {
  const [form, setForm] = React.useState<ItemFormData>({
    name: item.name,
    description: item.description ?? '',
    basePrice: item.basePrice,
    locationId: String(item.locationId),
    categoryId: String(item.categoryId),
    kdsStationId: item.kdsStationId ? String(item.kdsStationId) : '',
    isActive: item.isActive,
    isAlcohol: item.isAlcohol,
    allergens: item.allergens,
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function patch(p: Partial<ItemFormData>) { setForm(f => ({ ...f, ...p })) }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return }
    try {
      setSaving(true); setError(null)
      const res = await fetch(`/api/admin/menu/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          basePrice: form.basePrice || '0',
          locationId: Number(form.locationId),
          categoryId: Number(form.categoryId),
          kdsStationId: form.kdsStationId ? Number(form.kdsStationId) : null,
          isActive: form.isActive,
          isAlcohol: form.isAlcohol,
          allergens: form.allergens,
        }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Failed')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full sm:w-[500px] bg-neutral-800 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Edit Item</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-2xl leading-none">&times;</button>
        </div>
        <ItemForm data={form} onChange={patch} locations={locations} categories={categories} kdsStations={kdsStations} />
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        <div className="flex justify-between items-center mt-5">
          <button onClick={async () => {
            await fetch(`/api/admin/menu/items/${item.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: !item.isActive }),
            })
            onSaved()
          }} className={`px-3 py-1.5 rounded-lg text-xs transition ${item.isActive ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'}`}>
            {item.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white/60 hover:bg-white/15 transition">Cancel</button>
            <button onClick={() => void handleSave()} disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminMenuPage() {
  const [data, setData] = React.useState<MenuData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [activeCat, setActiveCat] = React.useState<number | null>(null)
  const [showCreate, setShowCreate] = React.useState(false)
  const [editItem, setEditItem] = React.useState<MenuItem | null>(null)

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/menu/items', { cache: 'no-store' })
      const d = await res.json() as MenuData | { ok: false }
      if (d.ok) setData(d as MenuData)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { void load() }, [])

  const items = React.useMemo(() => {
    if (!data) return []
    let list = data.items
    if (activeCat !== null) list = list.filter(i => i.categoryId === activeCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.category.name.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [data, activeCat, search])

  // Group by category for display
  const grouped = React.useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of items) {
      const key = item.category.name
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return map
  }, [items])

  const categories = data?.categories ?? []

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* ─── Header ─── */}
      <div className="sticky top-16 z-20 bg-neutral-950/95 backdrop-blur border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items…"
              className="w-full h-10 rounded-xl bg-neutral-800 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
            />
          </div>
          <button onClick={() => setShowCreate(true)}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition whitespace-nowrap">
            + New Item
          </button>
        </div>

        {/* Category chips */}
        <div className="max-w-5xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setActiveCat(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${activeCat === null ? 'bg-white text-neutral-900' : 'bg-white/10 text-white/60 hover:bg-white/15'}`}>
            All ({data?.items.length ?? 0})
          </button>
          {categories.map(c => {
            const count = data?.items.filter(i => i.categoryId === c.id).length ?? 0
            return (
              <button key={c.id} onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                  activeCat === c.id ? 'bg-white text-neutral-900' : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor(c.id) }} />
                {c.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">
        {loading ? (
          <div className="text-center text-white/30 py-20 text-sm">Loading…</div>
        ) : grouped.size === 0 ? (
          <div className="text-center text-white/30 py-20 text-sm">
            {search ? 'No items match your search' : 'No items yet — add your first'}
          </div>
        ) : (
          Array.from(grouped.entries()).map(([catName, catItems]) => (
            <div key={catName}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: catColor(catItems[0]?.categoryId ?? 0) }} />
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide">{catName}</h2>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-white/30">{catItems.length} item{catItems.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Items list */}
              <div className="rounded-2xl border border-white/8 bg-neutral-900 overflow-hidden">
                {catItems.map((item, idx) => (
                  <div key={item.id}
                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition cursor-pointer ${idx > 0 ? 'border-t border-white/5' : ''}`}
                    onClick={() => setEditItem(item)}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: catColor(item.categoryId) + '33', color: catColor(item.categoryId) }}>
                      {initials(item.name)}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.isAlcohol && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">🍷</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {item.kdsStation && (
                          <span className="text-[10px] text-white/30">{item.kdsStation.name}</span>
                        )}
                        {item.allergens.length > 0 && (
                          <span className="text-[10px] text-amber-500/60">{item.allergens.join(', ')}</span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <span className="text-sm font-semibold text-white/80 flex-shrink-0">{fmt(item.basePrice)}</span>

                    {/* Status */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${item.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      {item.isActive ? 'Active' : 'Off'}
                    </span>

                    {/* Edit chevron */}
                    <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Modals ─── */}
      {showCreate && data && (
        <CreateModal
          locations={data.locations}
          categories={data.categories}
          kdsStations={data.kdsStations}
          onCreated={() => { setShowCreate(false); void load() }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editItem && data && (
        <EditModal
          item={editItem}
          locations={data.locations}
          categories={data.categories}
          kdsStations={data.kdsStations}
          onSaved={() => { setEditItem(null); void load() }}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  )
}