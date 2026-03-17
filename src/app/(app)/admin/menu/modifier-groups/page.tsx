'use client'

import * as React from 'react'

type AdminLocation = {
  id: number
  name: string
}

type AdminModifierGroup = {
  id: number
  locationId: number
  name: string
  minSelected: number | null
  maxSelected: number | null
  isRequired: boolean
  sortOrder: number | null
  isActive: boolean
  location: AdminLocation
}

type GroupsResponse = {
  ok: true
  locations: AdminLocation[]
  groups: AdminModifierGroup[]
}

type GroupFormState = {
  locationId: string
  name: string
  minSelected: string
  maxSelected: string
  isRequired: boolean
  sortOrder: string
  isActive: boolean
}

const initialForm: GroupFormState = {
  locationId: '',
  name: '',
  minSelected: '',
  maxSelected: '',
  isRequired: false,
  sortOrder: '',
  isActive: true,
}

export default function AdminModifierGroupsPage() {
  const [locations, setLocations] = React.useState<AdminLocation[]>([])
  const [groups, setGroups] = React.useState<AdminModifierGroup[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [selectedLocationId, setSelectedLocationId] = React.useState<string>('all')
  const [form, setForm] = React.useState<GroupFormState>(initialForm)

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedLocationId !== 'all') params.set('locationId', selectedLocationId)

      const res = await fetch(`/api/admin/menu/modifier-groups?${params.toString()}`, {
        cache: 'no-store',
      })
      const data = (await res.json()) as GroupsResponse | { ok: false; error: string }

      if (!res.ok || !data.ok) {
        throw new Error('error' in data ? data.error : 'Failed to load modifier groups')
      }

      setLocations(data.locations)
      setGroups(data.groups)
      setForm((prev) => ({
        ...prev,
        locationId: prev.locationId || String(data.locations[0]?.id ?? ''),
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load modifier groups')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void loadData()
  }, [selectedLocationId])

  function resetForm() {
    setEditingId(null)
    setForm({
      ...initialForm,
      locationId: String(locations[0]?.id ?? ''),
    })
  }

  function startEdit(group: AdminModifierGroup) {
    setEditingId(group.id)
    setForm({
      locationId: String(group.locationId),
      name: group.name,
      minSelected: group.minSelected == null ? '' : String(group.minSelected),
      maxSelected: group.maxSelected == null ? '' : String(group.maxSelected),
      isRequired: group.isRequired,
      sortOrder: group.sortOrder == null ? '' : String(group.sortOrder),
      isActive: group.isActive,
    })
    setError(null)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const payload = {
        locationId: Number(form.locationId),
        name: form.name.trim(),
        minSelected: form.minSelected.trim() === '' ? null : Number(form.minSelected),
        maxSelected: form.maxSelected.trim() === '' ? null : Number(form.maxSelected),
        isRequired: form.isRequired,
        sortOrder: form.sortOrder.trim() === '' ? null : Number(form.sortOrder),
        isActive: form.isActive,
      }

      const res = await fetch(
        editingId
          ? `/api/admin/menu/modifier-groups/${editingId}`
          : '/api/admin/menu/modifier-groups',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save modifier group')
      }

      resetForm()
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save modifier group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Modifier Groups</h1>
          <p className="text-sm text-white/60 mt-1">
            Manage modifier groups for menu items
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <label className="block text-sm text-white/70 mb-1">Location Filter</label>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
          >
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? `Edit Group #${editingId}` : 'Create Modifier Group'}
            </h2>

            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Location</label>
                <select
                  value={form.locationId}
                  onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  required
                >
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Min Selected</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minSelected}
                    onChange={(e) => setForm((prev) => ({ ...prev, minSelected: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Max Selected</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxSelected}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxSelected: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.isRequired}
                  onChange={(e) => setForm((prev) => ({ ...prev, isRequired: e.target.checked }))}
                />
                Required
              </label>

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
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Modifier Groups</h2>
              <button
                type="button"
                onClick={() => void loadData()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-5 text-sm text-white/60">Loading...</div>
            ) : groups.length === 0 ? (
              <div className="p-5 text-sm text-white/60">No modifier groups yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/60">
                    <tr>
                      <th className="text-left px-4 py-3">ID</th>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Location</th>
                      <th className="text-left px-4 py-3">Min</th>
                      <th className="text-left px-4 py-3">Max</th>
                      <th className="text-left px-4 py-3">Required</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <tr key={group.id} className="border-t border-white/10">
                        <td className="px-4 py-3">{group.id}</td>
                        <td className="px-4 py-3">{group.name}</td>
                        <td className="px-4 py-3">{group.location.name}</td>
                        <td className="px-4 py-3">{group.minSelected ?? '-'}</td>
                        <td className="px-4 py-3">{group.maxSelected ?? '-'}</td>
                        <td className="px-4 py-3">{group.isRequired ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">
                          <span className={group.isActive ? 'text-emerald-400' : 'text-red-400'}>
                            {group.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => startEdit(group)}
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