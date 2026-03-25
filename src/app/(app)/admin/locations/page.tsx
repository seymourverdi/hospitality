'use client'

import * as React from 'react'

type AdminLocation = {
  id: number
  name: string
  code: string | null
  timezone: string | null
  address: string | null
  phone: string | null
  isActive: boolean
}

type LocationFormState = {
  name: string
  code: string
  timezone: string
  address: string
  phone: string
  isActive: boolean
}

const initialForm: LocationFormState = {
  name: '',
  code: '',
  timezone: '',
  address: '',
  phone: '',
  isActive: true,
}

export default function AdminLocationsPage() {
  const [items, setItems] = React.useState<AdminLocation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [form, setForm] = React.useState<LocationFormState>(initialForm)

  async function loadLocations() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/admin/locations', { cache: 'no-store' })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load locations')
      }

      setItems(data.locations)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void loadLocations()
  }, [])

  function startCreate() {
    setEditingId(null)
    setForm(initialForm)
    setError(null)
  }

  function startEdit(item: AdminLocation) {
    setEditingId(item.id)
    setForm({
      name: item.name ?? '',
      code: item.code ?? '',
      timezone: item.timezone ?? '',
      address: item.address ?? '',
      phone: item.phone ?? '',
      isActive: item.isActive,
    })
    setError(null)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        timezone: form.timezone.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        isActive: form.isActive,
      }

      const res = await fetch(
        editingId ? `/api/admin/locations/${editingId}` : '/api/admin/locations',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save location')
      }

      setEditingId(null)
      setForm(initialForm)
      await loadLocations()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Locations</h1>
            <p className="text-sm text-white/60 mt-1">
              Create and manage restaurant locations
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"
          >
            New Location
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? `Edit Location #${editingId}` : 'Create Location'}
            </h2>

            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  placeholder="Main Restaurant"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  placeholder="MAIN"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Timezone</label>
                <input
                  value={form.timezone}
                  onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  placeholder="America/Denver"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  placeholder="Street, City"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  placeholder="+380..."
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>

                <button
                  type="button"
                  onClick={startCreate}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Location List</h2>
              <button
                type="button"
                onClick={() => void loadLocations()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-5 text-sm text-white/60">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-5 text-sm text-white/60">No locations yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/60">
                    <tr>
                      <th className="text-left px-4 py-3">ID</th>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Code</th>
                      <th className="text-left px-4 py-3">Timezone</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-white/10">
                        <td className="px-4 py-3">{item.id}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.code ?? '-'}</td>
                        <td className="px-4 py-3">{item.timezone ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              item.isActive ? 'text-emerald-400' : 'text-red-400'
                            }
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}