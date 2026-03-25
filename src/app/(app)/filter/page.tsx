'use client';

import * as React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category   = { id: number; name: string };
type KdsStation = { id: number; name: string };
type ModGroup   = { id: number; name: string; isRequired: boolean };

type MenuItem = {
  id: number;
  name: string;
  basePrice: string;
  isActive: boolean;
  category:   Category   | null;
  kdsStation: KdsStation | null;
  modifierGroups: ModGroup[];
  allergens: string[];
};

type AllModGroup = {
  id: number;
  name: string;
  isRequired: boolean;
  isActive: boolean;
  options?: { id: number; name: string; priceDelta: string | null }[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_ALLERGENS = ['Dairy','Nuts','Gluten','Egg','Soy','Fish','Sesame','Shellfish','Corn','Sulfites'];
const KEYBOARD_ROWS = [
  ['A','B','C','D','E','F','G'],
  ['H','I','J','K','L','M','N'],
  ['O','P','Q','R','S','T','U'],
  ['V','W','X','Y','Z','Space','⌫'],
];
const MOD_TYPES = ['Optional','Required','Forced'];

// ─── Virtual Keyboard ─────────────────────────────────────────────────────────

function VirtualKeyboard({ onKey }: { onKey: (k: string) => void }) {
  return (
    <div className="space-y-1.5 pt-2">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map(k => (
            <button key={k} type="button" onClick={() => onKey(k)}
              className="w-9 h-9 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs font-medium transition flex items-center justify-center">
              {k}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Allergens Modal ──────────────────────────────────────────────────────────

function AllergensModal({ item, onClose }: { item: MenuItem; onClose: (a: string[]) => void }) {
  const [selected, setSelected] = React.useState<string[]>(item.allergens ?? []);
  const [input, setInput]       = React.useState('');
  const [showKb, setShowKb]     = React.useState(false);

  function handleKey(k: string) {
    if (k === '⌫') setInput(p => p.slice(0,-1));
    else if (k === 'Space') setInput(p => p + ' ');
    else setInput(p => p + k);
  }

  function addAllergen() {
    const v = input.trim();
    if (v && !selected.includes(v)) setSelected(p => [...p, v]);
    setInput(''); setShowKb(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-semibold text-white">Select Allergens</span>
          <span className="text-xs text-white/40">Select allergens added to Product</span>
        </div>
        <div className="p-5 space-y-3">
          {/* Tag strip */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-8 p-2 rounded-lg bg-neutral-800">
            <button type="button" onClick={() => setSelected([])} className="text-white/30 hover:text-white/60">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            {PRESET_ALLERGENS.map(a => (
              <button key={a} type="button" onClick={() => setSelected(p => p.includes(a) ? p.filter(x=>x!==a) : [...p,a])}
                className={`px-2 py-0.5 rounded text-xs font-medium transition ${selected.includes(a) ? 'bg-emerald-600 text-white' : 'bg-neutral-600 text-white/60 hover:bg-neutral-500'}`}>
                {a}
              </button>
            ))}
            {selected.filter(a => !PRESET_ALLERGENS.includes(a)).map(a => (
              <span key={a} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-600 text-white">
                {a}
                <button type="button" onClick={() => setSelected(p => p.filter(x=>x!==a))}>×</button>
              </span>
            ))}
          </div>

          {/* Add input */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <input value={input} onChange={e => setInput(e.target.value)} onFocus={() => setShowKb(true)}
              placeholder="Add Allergen"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
            <button type="button" onClick={addAllergen}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-xs text-white font-medium">
              + Add
            </button>
          </div>
          {showKb && <VirtualKeyboard onKey={handleKey} />}
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
          <button type="button" onClick={() => setSelected([])}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-sm text-white transition">
            🗑 Remove
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => onClose(item.allergens)}
              className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm text-white/70 transition">Cancel</button>
            <button type="button" onClick={() => onClose(selected)}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-sm text-white font-medium transition">Apply Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Modifier Modal ───────────────────────────────────────────────────────

function NewModifierModal({ locationId, onClose, onSaved }: { locationId: number; onClose: () => void; onSaved: () => void }) {
  const [name, setName]           = React.useState('');
  const [type, setType]           = React.useState('Optional');
  const [optionType, setOptionType] = React.useState('Single');
  const [options, setOptions]     = React.useState<{ name: string; price: string }[]>([]);
  const [price, setPrice]         = React.useState('');
  const [count, setCount]         = React.useState('');
  const [saving, setSaving]       = React.useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/menu/modifier-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId, name: name.trim(),
          isRequired: type === 'Required' || type === 'Forced',
          maxSelected: optionType === 'Single' ? 1 : null,
        }),
      });
      const data = await res.json() as { ok: boolean; group?: { id: number } };
      if (data.ok && data.group && options.length > 0) {
        await Promise.all(options.filter(o => o.name.trim()).map(o =>
          fetch('/api/admin/menu/modifier-options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modifierGroupId: data.group!.id, name: o.name.trim(), priceDelta: o.price || '0' }),
          })
        ));
      }
      onSaved();
    } finally { setSaving(false); }
  }

  const fieldCls = "flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/8";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-semibold text-white">Attach Modifiers</span>
          <span className="text-xs text-white/40">New Modifier</span>
        </div>
        <div className="p-5 space-y-3">
          {/* Name */}
          <div className={fieldCls}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Modifier Name"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
          </div>
          {/* Type + Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className={fieldCls}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <select value={type} onChange={e => setType(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none">
                {MOD_TYPES.map(t => <option key={t} value={t} className="bg-neutral-800">{t}</option>)}
              </select>
            </div>
            <div className={fieldCls}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              <select value={optionType} onChange={e => setOptionType(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none">
                {['Single','Multiple'].map(t => <option key={t} value={t} className="bg-neutral-800">{t}</option>)}
              </select>
            </div>
          </div>
          {/* Options rows if Multiple */}
          {optionType === 'Multiple' && (
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-dashed border-white/20">
                    <input value={opt.name} onChange={e => setOptions(p => p.map((o,idx)=>idx===i?{...o,name:e.target.value}:o))}
                      placeholder="Option Name" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
                  </div>
                  <div className="flex items-center gap-1 w-24 px-3 py-2 rounded-lg bg-neutral-800 border border-dashed border-white/20">
                    <span className="text-white/30 text-xs">$</span>
                    <input value={opt.price} onChange={e => setOptions(p => p.map((o,idx)=>idx===i?{...o,price:e.target.value}:o))}
                      placeholder="0" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none w-0" />
                  </div>
                  <button type="button" onClick={() => setOptions(p=>p.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setOptions(p=>[...p,{name:'',price:''}])}
                className="text-xs text-white/40 hover:text-white/70">+ Add Option</button>
            </div>
          )}
          {/* Price + Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className={fieldCls}>
              <span className="text-white/30 text-sm">$</span>
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
            </div>
            <div className={fieldCls}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
              <input value={count} onChange={e => setCount(e.target.value)} placeholder="Count"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm text-white/70 transition">Cancel</button>
          <button type="button" onClick={() => void handleSave()} disabled={!name.trim() || saving}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-sm text-white font-medium transition">
            {saving ? 'Saving...' : 'Save Modifier'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attach Modifiers Modal ───────────────────────────────────────────────────

function AttachModifiersModal({ item, allGroups, locationId, onClose, onAttached }: {
  item: MenuItem; allGroups: AllModGroup[]; locationId: number;
  onClose: () => void; onAttached: () => void;
}) {
  const [search, setSearch]   = React.useState('');
  const [selected, setSelected] = React.useState<number[]>(item.modifierGroups.map(g=>g.id));
  const [showNew, setShowNew] = React.useState(false);
  const [showKb, setShowKb]   = React.useState(false);

  function handleKey(k: string) {
    if (k === '⌫') setSearch(p => p.slice(0,-1));
    else if (k === 'Space') setSearch(p => p + ' ');
    else setSearch(p => p + k);
  }

  const filtered = allGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  async function handleAttach() {
    // Remove old links then add new ones
    await fetch(`/api/admin/menu/items/${item.id}/modifier-groups`, { method: 'GET' });
    for (const groupId of selected) {
      await fetch(`/api/admin/menu/items/${item.id}/modifier-groups`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modifierGroupId: groupId }),
      });
    }
    onAttached();
  }

  if (showNew) {
    return <NewModifierModal locationId={locationId} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); onAttached(); }} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-semibold text-white">Attach Modifiers</span>
          <span className="text-xs text-white/40">Attach Modifiers to a Product</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setShowKb(true)}
              placeholder="Search Modifiers" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {filtered.map(g => (
              <label key={g.id}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition ${selected.includes(g.id) ? 'bg-neutral-700' : 'bg-neutral-800 hover:bg-neutral-700/50'}`}>
                <div onClick={() => setSelected(p => p.includes(g.id) ? p.filter(x=>x!==g.id) : [...p,g.id])}
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${selected.includes(g.id) ? 'bg-emerald-500' : 'bg-neutral-600'}`}>
                  {selected.includes(g.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-sm text-white flex-1">{g.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${g.isRequired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {g.isRequired ? 'Required' : 'Optional'}
                </span>
              </label>
            ))}
            {filtered.length === 0 && <p className="text-center text-white/30 text-sm py-4">No modifiers found</p>}
          </div>
          {showKb && <VirtualKeyboard onKey={handleKey} />}
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
          <button type="button" onClick={() => setShowNew(true)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white transition">
            + New Modifier
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm text-white/70 transition">Cancel</button>
            <button type="button" onClick={() => void handleAttach()}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-sm text-white font-medium transition">Attach Modifiers</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modifiers Library ────────────────────────────────────────────────────────

function ModifiersLibrary({ groups, locationId, onBack, onRefresh }: {
  groups: AllModGroup[]; locationId: number; onBack: () => void; onRefresh: () => void;
}) {
  const [search, setSearch] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);
  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  async function deleteGroup(id: number) {
    if (!confirm('Delete this modifier?')) return;
    await fetch(`/api/admin/menu/modifier-groups/${id}`, { method: 'DELETE' });
    onRefresh();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-white/70 transition">
          ← Back to Filter
        </button>
        <div className="flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded-lg bg-neutral-800">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Modifiers"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
        </div>
        <button type="button" onClick={() => setShowNew(true)}
          className="ml-auto flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white transition">
          + New Modifier
        </button>
      </div>

      {/* Header row */}
      <div className="grid gap-2 px-4 py-2 text-xs text-white/40 font-medium border-b border-white/5"
        style={{ gridTemplateColumns: '1fr 120px 100px 90px 80px 120px 40px' }}>
        <span>Modifiers</span><span>Type</span><span>Options</span><span>Price</span><span>Count</span><span>Settings</span><span></span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(g => (
          <div key={g.id} className="grid gap-2 items-center px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.02] transition"
            style={{ gridTemplateColumns: '1fr 120px 100px 90px 80px 120px 40px' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-neutral-700 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <span className="text-sm text-white">{g.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs px-2 py-0.5 rounded ${g.isRequired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {g.isRequired ? 'Required' : 'Optional'}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
              Single
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div className="text-xs text-white/50">$ 0.00</div>
            <div className="text-xs text-white/50">Count</div>
            <button type="button" className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-xs text-white/60 transition">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              Edit
            </button>
            <button type="button" onClick={() => void deleteGroup(g.id)} className="text-red-400 hover:text-red-300 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        ))}
      </div>

      {showNew && <NewModifierModal locationId={locationId} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); onRefresh(); }} />}
    </div>
  );
}

// ─── Main Filter Page ─────────────────────────────────────────────────────────

const safeJson = async (res: Response) => {
  const text = await res.text();
  try { return JSON.parse(text) as unknown; } catch { return { ok: false }; }
};

export default function FilterPage() {
  const [items, setItems]         = React.useState<MenuItem[]>([]);
  const [allGroups, setAllGroups] = React.useState<AllModGroup[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [kdsStations, setKdsStations] = React.useState<KdsStation[]>([]);
  const [locationId, setLocationId] = React.useState(1);
  const [search, setSearch]       = React.useState('');
  const [loading, setLoading]     = React.useState(true);
  const [showLibrary, setShowLibrary] = React.useState(false);
  // inline dropdowns
  const [openDropdown, setOpenDropdown] = React.useState<{ itemId: number; type: 'category' | 'routing' } | null>(null);

  // Modals
  const [allergensFor, setAllergensFor] = React.useState<MenuItem | null>(null);
  const [attachFor, setAttachFor]       = React.useState<MenuItem | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [itemsRes, groupsRes] = await Promise.all([
        fetch('/api/admin/menu/items', { cache: 'no-store' }),
        fetch('/api/admin/menu/modifier-groups', { cache: 'no-store' }),
      ]);
      const itemsData  = await safeJson(itemsRes)  as { ok: boolean; items?: MenuItem[]; locations?: { id: number }[] };
      const groupsData = await safeJson(groupsRes) as { ok: boolean; groups?: AllModGroup[] };

      if (itemsData.ok && itemsData.items) {
        setItems(itemsData.items.map(i => ({ ...i, allergens: (i as MenuItem).allergens ?? [] })));
        if (itemsData.locations?.[0]) setLocationId(itemsData.locations[0].id);
        if ((itemsData as { categories?: Category[] }).categories) setCategories((itemsData as { categories?: Category[] }).categories ?? []);
        if ((itemsData as { kdsStations?: KdsStation[] }).kdsStations) setKdsStations((itemsData as { kdsStations?: KdsStation[] }).kdsStations ?? []);
      }
      if (groupsData.ok && groupsData.groups) setAllGroups(groupsData.groups);
    } finally { setLoading(false); }
  }

  React.useEffect(() => { void loadData(); }, []);

  async function patchItem(id: number, data: Record<string, unknown>) {
    await fetch(`/api/admin/menu/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    void loadData();
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  if (showLibrary) {
    return (
      <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
        <ModifiersLibrary groups={allGroups} locationId={locationId} onBack={() => setShowLibrary(false)} onRefresh={() => void loadData()} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded-lg bg-neutral-800">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Products"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
        </div>
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 text-sm text-white/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Category Sort
        </button>
        <button type="button" onClick={() => setShowLibrary(true)}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-white/70 transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          Modifiers Library
        </button>
      </div>

      {/* Table header */}
      <div className="grid gap-2 px-4 py-2 text-xs text-white/40 font-medium border-b border-white/5 flex-shrink-0"
        style={{ gridTemplateColumns: '1fr 90px 130px 130px 90px 80px 90px 36px' }}>
        <span>Product Name (From Optix)</span>
        <span>Price</span><span>Allergens</span><span>Category</span>
        <span>Routing</span><span>Count</span><span>Mods</span><span></span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">No products found</div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="grid gap-2 items-center px-4 py-2 border-b border-white/5 hover:bg-white/[0.02] transition"
              style={{ gridTemplateColumns: '1fr 90px 130px 130px 90px 80px 90px 36px' }}>

              {/* Name */}
              <span className="text-sm text-white/80 truncate">{item.name}</span>

              {/* Price */}
              <div className="flex items-center gap-1 text-sm">
                <span className="text-emerald-500 text-xs">$</span>
                <span className={`font-medium ${parseFloat(item.basePrice) > 10 ? 'text-emerald-400' : 'text-white/70'}`}>
                  {parseFloat(item.basePrice).toFixed(2)}
                </span>
              </div>

              {/* Allergens */}
              <button type="button" onClick={() => setAllergensFor(item)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-white/50 transition w-fit">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                {item.allergens.length > 0 ? item.allergens.slice(0,2).join(', ') : 'Allergens'}
              </button>

              {/* Category */}
              <div className="relative">
                <button type="button"
                  onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown?.itemId === item.id && openDropdown.type === 'category' ? null : { itemId: item.id, type: 'category' }); }}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition">
                  <span>{item.category?.name ?? 'Category'}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openDropdown?.itemId === item.id && openDropdown.type === 'category' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 mt-1 z-50 bg-neutral-800 border border-white/10 rounded-lg shadow-xl py-1 min-w-36 max-h-48 overflow-y-auto">
                      {categories.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => { void patchItem(item.id, { categoryId: c.id }); setOpenDropdown(null); }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition ${item.category?.id === c.id ? 'text-emerald-400' : 'text-white/70'}`}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Routing */}
              <div className="relative">
                <button type="button"
                  onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown?.itemId === item.id && openDropdown.type === 'routing' ? null : { itemId: item.id, type: 'routing' }); }}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition">
                  <span>{item.kdsStation?.name ?? 'Target'}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openDropdown?.itemId === item.id && openDropdown.type === 'routing' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 mt-1 z-50 bg-neutral-800 border border-white/10 rounded-lg shadow-xl py-1 min-w-36">
                      <button type="button"
                        onClick={() => { void patchItem(item.id, { kdsStationId: null }); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition ${!item.kdsStation ? 'text-emerald-400' : 'text-white/70'}`}>
                        None
                      </button>
                      {kdsStations.map(s => (
                        <button key={s.id} type="button"
                          onClick={() => { void patchItem(item.id, { kdsStationId: s.id }); setOpenDropdown(null); }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition ${item.kdsStation?.id === s.id ? 'text-emerald-400' : 'text-white/70'}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Count */}
              <div className="flex items-center gap-1 text-xs text-white/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                {item.modifierGroups.length > 0 ? item.modifierGroups.length : '—'}
              </div>

              {/* Mods */}
              <button type="button" onClick={() => setAttachFor(item)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-white/50 transition">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                Edit
                {item.modifierGroups.length > 0 && (
                  <span className="ml-0.5 text-emerald-400">{item.modifierGroups.length}</span>
                )}
              </button>

              {/* Visibility */}
              <button type="button"
                onClick={() => void patchItem(item.id, { isActive: !item.isActive })}
                className={`transition flex items-center justify-center ${item.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-white/20 hover:text-white/50'}`}>
                {item.isActive ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {allergensFor && (
        <AllergensModal item={allergensFor} onClose={allergens => {
          setItems(p => p.map(i => i.id === allergensFor.id ? { ...i, allergens } : i));
          void patchItem(allergensFor.id, { allergens });
          setAllergensFor(null);
        }} />
      )}

      {attachFor && (
        <AttachModifiersModal
          item={attachFor}
          allGroups={allGroups}
          locationId={locationId}
          onClose={() => setAttachFor(null)}
          onAttached={() => { setAttachFor(null); void loadData(); }}
        />
      )}
    </div>
  );
}