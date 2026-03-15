'use client'

import * as React from 'react'

type AdminLocation = {
  id: number
  name: string
}

type AdminArea = {
  id: number
  locationId: number
  name: string
  sortOrder: number | null
  isActive: boolean
  location: AdminLocation
  _count: {
    tables: number
  }
}

type AdminTable = {
  id: number
  locationId: number
  areaId: number
  name: string
  capacity: number
  status: string
  isActive: boolean
  location: AdminLocation
  area: {
    id: number
    name: string
  }
}

type TablesResponse = {
  ok: true
  locations: AdminLocation[]
  areas: AdminArea[]
  tables: AdminTable[]
}

type AreaFormState = {
  locationId: string
  name: string
  sortOrder: string
  isActive: boolean
}

type TableFormState = {
  locationId: string
  areaId: string
  name: string
  capacity: string
  status: string
  isActive: boolean
}

const initialAreaForm: AreaFormState = {
  locationId: '',
  name: '',
  sortOrder: '',
  isActive: true,
}

const initialTableForm: TableFormState = {
  locationId: '',
  areaId: '',
  name: '',
  capacity: '4',
  status: 'available',
  isActive: true,
}

export default function AdminTablesPage() {
  const [locations, setLocations] = React.useState<AdminLocation[]>([])
  const [areas, setAreas] = React.useState<AdminArea[]>([])
  const [tables, setTables] = React.useState<AdminTable[]>([])
  const [loading, setLoading] = React.useState(true)
  const [savingArea, setSavingArea] = React.useState(false)
  const [savingTable, setSavingTable] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [selectedLocationId, setSelectedLocationId] = React.useState<string>('all')
  const [selectedAreaId, setSelectedAreaId] = React.useState<string>('all')

  const [editingAreaId, setEditingAreaId] = React.useState<number | null>(null)
  const [editingTableId, setEditingTableId] = React.useState<number | null>(null)

  const [areaForm, setAreaForm] = React.useState<AreaFormState>(initialAreaForm)
  const [tableForm, setTableForm] = React.useState<TableFormState>(initialTableForm)

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedLocationId !== 'all') params.set('locationId', selectedLocationId)
      if (selectedAreaId !== 'all') params.set('areaId', selectedAreaId)

      const res = await fetch(`/api/admin/tables?${params.toString()}`, {
        cache: 'no-store',
      })
      const data = (await res.json()) as TablesResponse | { ok: false; error: string }

      if (!res.ok || !data.ok) {
        throw new Error('error' in data ? data.error : 'Failed to load tables admin data')
      }

      setLocations(data.locations)
      setAreas(data.areas)
      setTables(data.tables)

      const firstLocationId = String(data.locations[0]?.id ?? '')
      const firstAreaId = String(data.areas[0]?.id ?? '')

      setAreaForm((prev) => ({
        ...prev,
        locationId: prev.locationId || firstLocationId,
      }))

      setTableForm((prev) => ({
        ...prev,
        locationId: prev.locationId || firstLocationId,
        areaId: prev.areaId || firstAreaId,
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tables admin data')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void loadData()
  }, [selectedLocationId, selectedAreaId])

  const filteredAreasForTableForm = React.useMemo(() => {
    if (!tableForm.locationId) return areas
    return areas.filter((area) => String(area.locationId) === tableForm.locationId)
  }, [areas, tableForm.locationId])

  function resetAreaForm() {
    setEditingAreaId(null)
    setAreaForm({
      ...initialAreaForm,
      locationId: String(locations[0]?.id ?? ''),
    })
  }

  function resetTableForm() {
    const firstLocationId = String(locations[0]?.id ?? '')
    const matchingAreas = areas.filter((area) => String(area.locationId) === firstLocationId)
    setEditingTableId(null)
    setTableForm({
      ...initialTableForm,
      locationId: firstLocationId,
      areaId: String(matchingAreas[0]?.id ?? ''),
    })
  }

  function startEditArea(area: AdminArea) {
    setEditingAreaId(area.id)
    setAreaForm({
      locationId: String(area.locationId),
      name: area.name,
      sortOrder: area.sortOrder == null ? '' : String(area.sortOrder),
      isActive: area.isActive,
    })
    setError(null)
  }

  function startEditTable(table: AdminTable) {
    setEditingTableId(table.id)
    setTableForm({
      locationId: String(table.locationId),
      areaId: String(table.areaId),
      name: table.name,
      capacity: String(table.capacity),
      status: table.status,
      isActive: table.isActive,
    })
    setError(null)
  }

  async function submitAreaForm(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSavingArea(true)
      setError(null)

      const payload = {
        locationId: Number(areaForm.locationId),
        name: areaForm.name.trim(),
        sortOrder: areaForm.sortOrder.trim() === '' ? null : Number(areaForm.sortOrder),
        isActive: areaForm.isActive,
      }

      const res = await fetch(
        editingAreaId ? `/api/admin/areas/${editingAreaId}` : '/api/admin/areas',
        {
          method: editingAreaId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save area')
      }

      resetAreaForm()
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save area')
    } finally {
      setSavingArea(false)
    }
  }

  async function submitTableForm(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSavingTable(true)
      setError(null)

      const payload = {
        locationId: Number(tableForm.locationId),
        areaId: Number(tableForm.areaId),
        name: tableForm.name.trim(),
        capacity: Number(tableForm.capacity),
        status: tableForm.status.trim(),
        isActive: tableForm.isActive,
      }

      const res = await fetch(
        editingTableId ? `/api/admin/tables/${editingTableId}` : '/api/admin/tables',
        {
          method: editingTableId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save table')
      }

      resetTableForm()
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save table')
    } finally {
      setSavingTable(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Areas & Tables</h1>
          <p className="text-sm text-white/60 mt-1">
            Manage floors, dining areas and tables
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Location Filter</label>
              <select
                value={selectedLocationId}
                onChange={(e) => {
                  setSelectedLocationId(e.target.value)
                  setSelectedAreaId('all')
                }}
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

            <div>
              <label className="block text-sm text-white/70 mb-1">Area Filter</label>
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
              >
                <option value="all">All areas</option>
                {areas
                  .filter((area) => selectedLocationId === 'all' || String(area.locationId) === selectedLocationId)
                  .map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
              className="h-11 px-4 rounded-lg bg-white/10 hover:bg-white/15 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
              <h2 className="text-lg font-semibold mb-4">
                {editingAreaId ? `Edit Area #${editingAreaId}` : 'Create Area'}
              </h2>

              <form onSubmit={submitAreaForm} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Location</label>
                  <select
                    value={areaForm.locationId}
                    onChange={(e) => setAreaForm((prev) => ({ ...prev, locationId: e.target.value }))}
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
                  <label className="block text-sm text-white/70 mb-1">Area Name</label>
                  <input
                    value={areaForm.name}
                    onChange={(e) => setAreaForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                    placeholder="Dining Room"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Sort Order</label>
                  <input
                    value={areaForm.sortOrder}
                    onChange={(e) => setAreaForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                    placeholder="1"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={areaForm.isActive}
                    onChange={(e) => setAreaForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingArea}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition"
                  >
                    {savingArea ? 'Saving...' : editingAreaId ? 'Update Area' : 'Create Area'}
                  </button>

                  <button
                    type="button"
                    onClick={resetAreaForm}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Areas</h2>
              </div>

              {loading ? (
                <div className="p-5 text-sm text-white/60">Loading...</div>
              ) : areas.length === 0 ? (
                <div className="p-5 text-sm text-white/60">No areas yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-white/60">
                      <tr>
                        <th className="text-left px-4 py-3">ID</th>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Location</th>
                        <th className="text-left px-4 py-3">Tables</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areas.map((area) => (
                        <tr key={area.id} className="border-t border-white/10">
                          <td className="px-4 py-3">{area.id}</td>
                          <td className="px-4 py-3">{area.name}</td>
                          <td className="px-4 py-3">{area.location.name}</td>
                          <td className="px-4 py-3">{area._count.tables}</td>
                          <td className="px-4 py-3">
                            <span className={area.isActive ? 'text-emerald-400' : 'text-red-400'}>
                              {area.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => startEditArea(area)}
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

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
              <h2 className="text-lg font-semibold mb-4">
                {editingTableId ? `Edit Table #${editingTableId}` : 'Create Table'}
              </h2>

              <form onSubmit={submitTableForm} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Location</label>
                  <select
                    value={tableForm.locationId}
                    onChange={(e) => {
                      const nextLocationId = e.target.value
                      const nextAreas = areas.filter((area) => String(area.locationId) === nextLocationId)
                      setTableForm((prev) => ({
                        ...prev,
                        locationId: nextLocationId,
                        areaId: String(nextAreas[0]?.id ?? ''),
                      }))
                    }}
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
                  <label className="block text-sm text-white/70 mb-1">Area</label>
                  <select
                    value={tableForm.areaId}
                    onChange={(e) => setTableForm((prev) => ({ ...prev, areaId: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                    required
                  >
                    {filteredAreasForTableForm.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Table Name</label>
                  <input
                    value={tableForm.name}
                    onChange={(e) => setTableForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                    placeholder="T1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm((prev) => ({ ...prev, capacity: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Status</label>
                  <select
                    value={tableForm.status}
                    onChange={(e) => setTableForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none"
                    required
                  >
                    <option value="available">available</option>
                    <option value="occupied">occupied</option>
                    <option value="reserved">reserved</option>
                    <option value="blocked">blocked</option>
                    <option value="free">free</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={tableForm.isActive}
                    onChange={(e) => setTableForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingTable}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition"
                  >
                    {savingTable ? 'Saving...' : editingTableId ? 'Update Table' : 'Create Table'}
                  </button>

                  <button
                    type="button"
                    onClick={resetTableForm}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Tables</h2>
              </div>

              {loading ? (
                <div className="p-5 text-sm text-white/60">Loading...</div>
              ) : tables.length === 0 ? (
                <div className="p-5 text-sm text-white/60">No tables yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-white/60">
                      <tr>
                        <th className="text-left px-4 py-3">ID</th>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Location</th>
                        <th className="text-left px-4 py-3">Area</th>
                        <th className="text-left px-4 py-3">Capacity</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tables.map((table) => (
                        <tr key={table.id} className="border-t border-white/10">
                          <td className="px-4 py-3">{table.id}</td>
                          <td className="px-4 py-3">{table.name}</td>
                          <td className="px-4 py-3">{table.location.name}</td>
                          <td className="px-4 py-3">{table.area.name}</td>
                          <td className="px-4 py-3">{table.capacity}</td>
                          <td className="px-4 py-3">{table.status}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => startEditTable(table)}
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
    </div>
  )
}