'use client'

import * as React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminLocation = { id: number; name: string }
type AdminRole = { id: number; name: string }

type AdminUser = {
  id: number
  locationId: number
  firstName: string
  lastName: string
  pinCode: string
  email: string | null
  phone: string | null
  roleId: number
  isActive: boolean
  avatarColor: string | null
  location: AdminLocation
  role: AdminRole
}

type UsersResponse = { ok: true; users: AdminUser[]; locations: AdminLocation[]; roles: AdminRole[] }

// ─── Avatar colors palette ────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { id: 'blue-light',   hex: '#7EB8F7' },
  { id: 'purple-light', hex: '#A78BFA' },
  { id: 'pink-light',   hex: '#F472B6' },
  { id: 'green-light',  hex: '#4ADE80' },
  { id: 'yellow-light', hex: '#FACC15' },
  { id: 'blue',         hex: '#3B82F6' },
  { id: 'purple',       hex: '#7C3AED' },
  { id: 'red',          hex: '#EF4444' },
  { id: 'green',        hex: '#22C55E' },
  { id: 'yellow',       hex: '#F59E0B' },
]

// ─── Avatar component ─────────────────────────────────────────────────────────

function UserAvatar({ user, size = 36 }: { user: Pick<AdminUser, 'firstName' | 'lastName' | 'avatarColor'>; size?: number }) {
  const color = user.avatarColor ?? '#6B7280'
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
  return (
    <div
      style={{ width: size, height: size, backgroundColor: color, borderRadius: '50%', fontSize: size * 0.38, fontWeight: 600 }}
      className="flex items-center justify-center text-white flex-shrink-0 select-none"
    >
      {initials}
    </div>
  )
}

// ─── Select User Modal ────────────────────────────────────────────────────────

function SelectUserModal({
  users,
  onLogin,
  onAddUser,
  onClose,
}: {
  users: AdminUser[]
  onLogin: (user: AdminUser) => Promise<void>
  onAddUser: () => void
  onClose: () => void
}) {
  const [selected, setSelected] = React.useState<AdminUser | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleLogin() {
    if (!selected) return
    setLoading(true)
    await onLogin(selected)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[420px] bg-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Select User</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none">&times;</button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {users.filter(u => u.isActive).map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelected(user)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
                selected?.id === user.id
                  ? 'bg-neutral-900 ring-1 ring-white/20'
                  : 'bg-neutral-700/60 hover:bg-neutral-700'
              }`}
            >
              <UserAvatar user={user} size={36} />
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium block">{user.firstName} {user.lastName}</span>
                <span className="text-white/40 text-xs">{user.role.name}</span>
              </div>
              {selected?.id === user.id && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
          <button type="button" onClick={onAddUser} className="px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:bg-white/10 transition">
            Add User
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white/70 transition">
              Cancel
            </button>
            <button type="button" disabled={!selected || loading} onClick={() => void handleLogin()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
              {loading ? 'Logging in…' : 'Login as User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared form fields ────────────────────────────────────────────────────────

function UserFormFields({
  firstName, setFirstName,
  lastName, setLastName,
  pinCode, setPinCode,
  locationId, setLocationId,
  roleId, setRoleId,
  isActive, setIsActive,
  locations, roles,
}: {
  firstName: string; setFirstName: (v: string) => void
  lastName: string; setLastName: (v: string) => void
  pinCode: string; setPinCode: (v: string) => void
  locationId: string; setLocationId: (v: string) => void
  roleId: string; setRoleId: (v: string) => void
  isActive: boolean; setIsActive: (v: boolean) => void
  locations: AdminLocation[]; roles: AdminRole[]
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name"
          className="h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 text-white placeholder:text-white/30 outline-none text-sm" />
        <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name"
          className="h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 text-white placeholder:text-white/30 outline-none text-sm" />
      </div>
      <div className="space-y-3 mb-3">
        <input value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="PIN Code" maxLength={8}
          className="w-full h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 text-white placeholder:text-white/30 outline-none text-sm" />
        <select value={locationId} onChange={e => setLocationId(e.target.value)}
          className="w-full h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 text-white outline-none text-sm">
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={roleId} onChange={e => setRoleId(e.target.value)}
          className="w-full h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 text-white outline-none text-sm">
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-500" />
          Active
        </label>
      </div>
    </>
  )
}

// ─── Color step ───────────────────────────────────────────────────────────────

function ColorStep({
  firstName, lastName, avatarColor, setAvatarColor,
}: {
  firstName: string; lastName: string
  avatarColor: string | null; setAvatarColor: (v: string) => void
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4 opacity-60 pointer-events-none">
        <div className="h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 flex items-center text-white text-sm">{firstName}</div>
        <div className="h-11 rounded-xl bg-neutral-700 border border-white/10 px-3 flex items-center text-white text-sm">{lastName}</div>
      </div>
      {avatarColor && (
        <div className="flex justify-center mb-4">
          <UserAvatar user={{ firstName, lastName, avatarColor }} size={64} />
        </div>
      )}
      <p className="text-xs text-white/50 mb-3">Select Color</p>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {AVATAR_COLORS.map(c => (
          <button key={c.id} type="button" onClick={() => setAvatarColor(c.hex)}
            style={{ backgroundColor: c.hex }}
            className={`h-14 rounded-xl transition ${avatarColor === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-800' : 'hover:opacity-90'}`}
          />
        ))}
      </div>
    </>
  )
}

// ─── Create User Modal ────────────────────────────────────────────────────────

function CreateUserModal({
  locations, roles, onCreated, onClose,
}: {
  locations: AdminLocation[]
  roles: AdminRole[]
  onCreated: () => void
  onClose: () => void
}) {
  const [step, setStep] = React.useState<'form' | 'color'>('form')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [pinCode, setPinCode] = React.useState('')
  const [locationId, setLocationId] = React.useState(String(locations[0]?.id ?? ''))
  const [roleId, setRoleId] = React.useState(String(roles[0]?.id ?? ''))
  const [isActive, setIsActive] = React.useState(true)
  const [avatarColor, setAvatarColor] = React.useState<string | null>(AVATAR_COLORS[0]?.hex ?? null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleCreate() {
    try {
      setSaving(true); setError(null)
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), pinCode: pinCode.trim(), locationId: Number(locationId), roleId: Number(roleId), isActive, avatarColor }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Failed')
      onCreated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const canProceed = firstName.trim() && lastName.trim() && pinCode.trim() && locationId && roleId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[420px] bg-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Create User</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none">&times;</button>
        </div>

        {step === 'form' ? (
          <>
            <UserFormFields {...{ firstName, setFirstName, lastName, setLastName, pinCode, setPinCode, locationId, setLocationId, roleId, setRoleId, isActive, setIsActive, locations, roles }} />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <div className="flex justify-end">
              <button type="button" disabled={!canProceed} onClick={() => setStep('color')}
                className="px-5 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 disabled:opacity-40 text-sm text-white transition">
                Next →
              </button>
            </div>
          </>
        ) : (
          <>
            <ColorStep {...{ firstName, lastName, avatarColor, setAvatarColor }} />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep('form')}
                className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm text-white/70 transition">← Back</button>
              <button type="button" onClick={() => void handleCreate()} disabled={saving}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({
  user, locations, roles, onSaved, onClose,
}: {
  user: AdminUser
  locations: AdminLocation[]
  roles: AdminRole[]
  onSaved: () => void
  onClose: () => void
}) {
  const [step, setStep] = React.useState<'form' | 'color'>('form')
  const [firstName, setFirstName] = React.useState(user.firstName)
  const [lastName, setLastName] = React.useState(user.lastName)
  const [pinCode, setPinCode] = React.useState(user.pinCode)
  const [locationId, setLocationId] = React.useState(String(user.locationId))
  const [roleId, setRoleId] = React.useState(String(user.roleId))
  const [isActive, setIsActive] = React.useState(user.isActive)
  const [avatarColor, setAvatarColor] = React.useState<string | null>(user.avatarColor ?? AVATAR_COLORS[0]?.hex ?? null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSave() {
    try {
      setSaving(true); setError(null)
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), pinCode: pinCode.trim(), locationId: Number(locationId), roleId: Number(roleId), isActive, avatarColor }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Failed')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const canSave = firstName.trim() && lastName.trim() && pinCode.trim() && locationId && roleId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[420px] bg-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Edit User</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none">&times;</button>
        </div>

        {step === 'form' ? (
          <>
            <UserFormFields {...{ firstName, setFirstName, lastName, setLastName, pinCode, setPinCode, locationId, setLocationId, roleId, setRoleId, isActive, setIsActive, locations, roles }} />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep('color')}
                className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm text-white/70 transition">
                Change Color
              </button>
              <button type="button" disabled={!canSave || saving} onClick={() => void handleSave()}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        ) : (
          <>
            <ColorStep {...{ firstName, lastName, avatarColor, setAvatarColor }} />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep('form')}
                className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm text-white/70 transition">← Back</button>
              <button type="button" disabled={saving} onClick={() => void handleSave()}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm text-white font-medium transition">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [locations, setLocations] = React.useState<AdminLocation[]>([])
  const [roles, setRoles] = React.useState<AdminRole[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showSelect, setShowSelect] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null)

  async function loadUsers() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      const data = await res.json() as UsersResponse | { ok: false; error: string }
      if (!data.ok) throw new Error()
      setUsers(data.users)
      setLocations(data.locations)
      setRoles(data.roles)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { void loadUsers() }, [])

  function openCreate() { setShowSelect(false); setShowCreate(true) }

  async function handleLoginAs(user: AdminUser) {
    const res = await fetch('/api/admin/login-as', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json() as { ok: boolean; error?: string }
    if (data.ok) {
      window.location.href = '/stats'
    } else {
      alert(data.error ?? 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-white/50 mt-0.5">Manage staff users, roles and PIN codes</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowSelect(true)}
              className="px-4 py-2 rounded-lg bg-neutral-800 border border-white/10 hover:bg-neutral-700 text-sm transition">
              Select User
            </button>
            <button type="button" onClick={openCreate}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm transition">
              + New User
            </button>
          </div>
        </div>

        {/* User list */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/30 text-sm">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">No users yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition">
                  <UserAvatar user={user} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-white/40">{user.role.name} · {user.location.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button type="button" onClick={() => setEditingUser(user)}
                    className="px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-xs text-white/60 transition">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSelect && (
        <SelectUserModal
          users={users}
          onLogin={handleLoginAs}
          onAddUser={openCreate}
          onClose={() => setShowSelect(false)}
        />
      )}

      {showCreate && (
        <CreateUserModal
          locations={locations}
          roles={roles}
          onCreated={() => { setShowCreate(false); void loadUsers() }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          locations={locations}
          roles={roles}
          onSaved={() => { setEditingUser(null); void loadUsers() }}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  )
}