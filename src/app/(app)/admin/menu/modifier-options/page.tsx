'use client'

import * as React from 'react'

type AdminGroup = {
  id: number
  name: string
  locationId: number
}

type AdminOption = {
  id: number
  modifierGroupId: number
  name: string
  priceDelta: string | null
  sortOrder: number | null
  isActive: boolean
  modifierGroup: {
    id: number
    name: string
  }
}

type OptionsResponse = {
  ok: true
  groups: AdminGroup[]
  options: AdminOption[]
}

type OptionFormState = {
  modifierGroupId: string
  name: string
  priceDelta: string
  sortOrder: string
  isActive: boolean
}

const initialForm: OptionFormState = {
  modifierGroupId: '',
  name: '',
  priceDelta: '',
  sortOrder: '',
  isActive: true,
}

export default function AdminModifierOptionsPage() {
  const [groups, setGroups] = React.useState<AdminGroup[]>([])
  const [options, setOptions] = React.useState<AdminOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>('all')
  const [form, setForm] = React.useState<OptionFormState>(initialForm)

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedGroupId !== 'all') params.set('modifierGroupId', selectedGroupId)

      const res = await fetch(`/api/admin/menu/modifier-options?${params.toString()}`, {
        cache: 'no-store',
      })
      const data = (await res.json()) as OptionsResponse | { ok: false; error: string }

      if (!res.ok || !data.ok) {
        throw new Error('error' in data ? data.error : 'Failed to load modifier options')
      }

      setGroups(data.groups)
      setOptions(data.options)
      setForm((prev) => ({
        ...prev,
        modifierGroupId: prev.modifierGroupId || String(data.groups[0]?.id ?? ''),
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load modifier options')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void loadData()
  }, [selectedGroupId])

  function resetForm() {
    setEditingId(null)
    setForm({
      ...initialForm,
      modifierGroupId: String(groups[0]?.id ?? ''),
    })
  }

  function startEdit(option: AdminOption) {
    setEditingId(option.id)
    setForm({
      modifierGroupId: String(option.modifierGroupId),
      name: option.name,
      priceDelta: option.priceDelta ?? '',
      sortOrder: option.sortOrder == null ? '' : String(option.sortOrder),
      isActive: option.isActive,
    })
    setError(null)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const payload = {
        modifierGroupId: Number(form.modifierGroupId),
        name: form.name.trim(),
        priceDelta: form.priceDelta.trim() || null,
        sortOrder: form.sortOrder.trim() === '' ? null : Number(form.sortOrder),
        isActive: form.isActive,
      }

      const res = await fetch(
        editingId
          ? `/api/admin/menu/modifier-options/${editingId}`
          : '/api/admin/menu/modifier-options',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save modifier option')
      }

      resetForm()
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save modifier option')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Modifier Options</h1>
          <p className="text-sm text-white/60 mt-1">
            Manage options inside modifier groups
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <label className="block text-sm text-white/70 mb-1">Group Filter</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
          >
            <option value="all">All groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? `Edit Option #${editingId}` : 'Create Modifier Option'}
            </h2>

            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Modifier Group</label>
                <select
                  value={form.modifierGroupId}
                  onChange={(e) => setForm((prev) => ({ ...prev, modifierGroupId: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  required
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
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

              <div>
                <label className="block text-sm text-white/70 mb-1">Price Delta</label>
                <input
                  value={form.priceDelta}
                  onChange={(e) => setForm((prev) => ({ ...prev, priceDelta: e.target.value }))}
                  className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                  placeholder="0.50"
                />
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
              <h2 className="text-lg font-semibold">Modifier Options</h2>
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
            ) : options.length === 0 ? (
              <div className="p-5 text-sm text-white/60">No modifier options yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/60">
                    <tr>
                      <th className="text-left px-4 py-3">ID</th>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Group</th>
                      <th className="text-left px-4 py-3">Price Delta</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((option) => (
                      <tr key={option.id} className="border-t border-white/10">
                        <td className="px-4 py-3">{option.id}</td>
                        <td className="px-4 py-3">{option.name}</td>
                        <td className="px-4 py-3">{option.modifierGroup.name}</td>
                        <td className="px-4 py-3">{option.priceDelta ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span className={option.isActive ? 'text-emerald-400' : 'text-red-400'}>
                            {option.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => startEdit(option)}
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