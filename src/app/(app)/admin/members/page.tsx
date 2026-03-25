'use client';

import * as React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type MembershipLevel = 'SILVER' | 'GOLD' | 'VIP';

type Member = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  totalSpent: number;
  createdAt: string;
  membership: {
    id: number;
    membershipNumber: string | null;
    membershipLevel: MembershipLevel;
    discountPercent: number | null;
    isActive: boolean;
  } | null;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string;
  membershipNumber: string;
  membershipLevel: MembershipLevel | '';
  discountPercent: string;
};

const LEVELS: MembershipLevel[] = ['SILVER', 'GOLD', 'VIP'];

const LEVEL_COLORS: Record<MembershipLevel, string> = {
  SILVER: 'bg-slate-500/20 text-slate-300',
  GOLD:   'bg-yellow-500/20 text-yellow-300',
  VIP:    'bg-purple-500/20 text-purple-300',
};

const emptyForm: FormData = {
  firstName: '', lastName: '', email: '', phone: '', note: '',
  membershipNumber: '', membershipLevel: '', discountPercent: '',
};

// ─── Modal ────────────────────────────────────────────────────────────────────

function MemberModal({
  member, onClose, onSaved,
}: {
  member: Member | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!member;
  const [form, setForm] = React.useState<FormData>(() =>
    member ? {
      firstName:        member.firstName,
      lastName:         member.lastName,
      email:            member.email ?? '',
      phone:            member.phone ?? '',
      note:             member.note ?? '',
      membershipNumber: member.membership?.membershipNumber ?? '',
      membershipLevel:  member.membership?.membershipLevel ?? '',
      discountPercent:  member.membership?.discountPercent != null ? String(member.membership.discountPercent) : '',
    } : { ...emptyForm }
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState('');

  function set(k: keyof FormData, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const payload = {
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim(),
        email:            form.email.trim() || null,
        phone:            form.phone.trim() || null,
        note:             form.note.trim() || null,
        membershipNumber: form.membershipNumber.trim() || undefined,
        membershipLevel:  form.membershipLevel || undefined,
        discountPercent:  form.discountPercent ? Number(form.discountPercent) : null,
      };

      const res = await fetch(
        isEdit ? `/api/admin/members/${member.id}` : '/api/admin/members',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? 'Failed to save'); return; }
      onSaved();
    } finally { setSaving(false); }
  }

  const fieldCls = "flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neutral-800 border border-white/8";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[520px] bg-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-semibold text-white">{isEdit ? 'Edit Member' : 'New Member'}</span>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className={fieldCls}>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                placeholder="First Name *" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
            </div>
            <div className={fieldCls}>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                placeholder="Last Name *" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
            </div>
          </div>

          {/* Email / Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className={fieldCls}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="Email" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
            </div>
            <div className={fieldCls}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/></svg>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="Phone" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
            </div>
          </div>

          {/* Note */}
          <div className={fieldCls}>
            <textarea value={form.note} onChange={e => set('note', e.target.value)}
              placeholder="Note (optional)" rows={2}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none resize-none" />
          </div>

          <div className="border-t border-white/8 pt-3">
            <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">Membership</p>
            <div className="grid grid-cols-3 gap-3">
              {/* Level */}
              <div className={fieldCls}>
                <select value={form.membershipLevel} onChange={e => set('membershipLevel', e.target.value as MembershipLevel | '')}
                  className="flex-1 bg-transparent text-sm text-white outline-none">
                  <option value="" className="bg-neutral-800">No Membership</option>
                  {LEVELS.map(l => <option key={l} value={l} className="bg-neutral-800">{l}</option>)}
                </select>
              </div>
              {/* Account # */}
              <div className={fieldCls}>
                <input value={form.membershipNumber} onChange={e => set('membershipNumber', e.target.value)}
                  placeholder="Account #" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
              </div>
              {/* Discount */}
              <div className={fieldCls}>
                <span className="text-white/30 text-sm">%</span>
                <input value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)}
                  placeholder="Discount" type="number" min="0" max="100"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm text-white/70 transition">Cancel</button>
          <button type="button" onClick={() => void handleSave()} disabled={saving}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-sm text-white font-medium transition">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch]   = React.useState('');
  const [modal, setModal]     = React.useState<'new' | Member | null>(null);
  const [deleting, setDeleting] = React.useState<number | null>(null);

  async function loadMembers() {
    try {
      setLoading(true);
      const res  = await fetch('/api/admin/members', { cache: 'no-store' });
      const data = await res.json() as { ok: boolean; members?: Member[] };
      if (data.ok && data.members) setMembers(data.members);
    } finally { setLoading(false); }
  }

  React.useEffect(() => { void loadMembers(); }, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this member? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      void loadMembers();
    } finally { setDeleting(null); }
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      (m.email ?? '').toLowerCase().includes(q) ||
      (m.membership?.membershipNumber ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-49px)]">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-lg bg-neutral-800">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-white/40">{members.length} members</span>
          <button type="button" onClick={() => setModal('new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white font-medium transition">
            + Add Member
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="grid gap-2 px-6 py-2 text-xs text-white/40 font-medium border-b border-white/5 flex-shrink-0"
        style={{ gridTemplateColumns: '1fr 130px 90px 90px 90px 130px 70px 60px' }}>
        <span>Name</span>
        <span>Account #</span>
        <span>Level</span>
        <span>Discount</span>
        <span>Spent</span>
        <span>Email</span>
        <span>Status</span>
        <span></span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-white/20 text-sm">
              {members.length === 0 ? 'No members yet' : 'No results'}
            </span>
            {members.length === 0 && (
              <button type="button" onClick={() => setModal('new')}
                className="text-emerald-400 text-sm hover:underline">Add first member</button>
            )}
          </div>
        ) : (
          filtered.map(m => {
            const lvl = m.membership?.membershipLevel;
            return (
              <div key={m.id}
                className="grid gap-2 items-center px-6 py-2.5 border-b border-white/5 hover:bg-white/[0.02] transition"
                style={{ gridTemplateColumns: '1fr 130px 90px 90px 90px 130px 70px 60px' }}>

                {/* Name */}
                <div>
                  <p className="text-sm text-white/90 font-medium">{m.firstName} {m.lastName}</p>
                  {m.phone && <p className="text-xs text-white/30">{m.phone}</p>}
                </div>

                {/* Account # */}
                <span className="text-xs text-white/50 font-mono">
                  {m.membership?.membershipNumber ?? '—'}
                </span>

                {/* Level */}
                {lvl ? (
                  <span className={`text-xs px-2 py-0.5 rounded font-medium w-fit ${LEVEL_COLORS[lvl]}`}>{lvl}</span>
                ) : (
                  <span className="text-xs text-white/20">—</span>
                )}

                {/* Discount */}
                <span className="text-xs text-white/60">
                  {m.membership?.discountPercent != null ? `${m.membership.discountPercent}%` : '—'}
                </span>

                {/* Spent */}
                <span className="text-xs text-emerald-400 font-medium">${m.totalSpent.toLocaleString()}</span>

                {/* Email */}
                <span className="text-xs text-white/40 truncate">{m.email ?? '—'}</span>

                {/* Status */}
                <span className={`text-xs px-2 py-0.5 rounded w-fit ${m.membership?.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {m.membership ? (m.membership.isActive ? 'Active' : 'Inactive') : 'Guest'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setModal(m)}
                    className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button type="button" onClick={() => void handleDelete(m.id)}
                    disabled={deleting === m.id}
                    className="p-1.5 rounded hover:bg-red-500/20 text-white/20 hover:text-red-400 disabled:opacity-40 transition">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <MemberModal
          member={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); void loadMembers(); }}
        />
      )}
    </div>
  );
}