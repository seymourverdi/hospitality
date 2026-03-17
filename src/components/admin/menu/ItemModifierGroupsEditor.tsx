'use client'

import * as React from 'react'

type ModifierGroup = {
    id: number
    name: string
    isRequired: boolean
    minSelected: number | null
    maxSelected: number | null
    isActive: boolean
}

type AvailableGroup = {
    id: number
    name: string
    locationId: number
}

interface ItemModifierGroupsEditorProps {
    itemId: number | null
    itemLocationId: number | null
    availableGroups: AvailableGroup[]
}

export function ItemModifierGroupsEditor({
    itemId,
    itemLocationId,
    availableGroups,
}: ItemModifierGroupsEditorProps) {
    const [linkedGroups, setLinkedGroups] = React.useState<ModifierGroup[]>([])
    const [selectedGroupId, setSelectedGroupId] = React.useState<string>('')
    const [loading, setLoading] = React.useState(false)
    const [saving, setSaving] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const groupsForLocation = React.useMemo(() => {
        if (!itemLocationId) return []
        return availableGroups.filter((group) => group.locationId === itemLocationId)
    }, [availableGroups, itemLocationId])

    async function loadLinkedGroups(currentItemId: number) {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(`/api/admin/menu/items/${currentItemId}/modifier-groups`, {
                cache: 'no-store',
            })
            const data = await res.json()

            if (!res.ok || !data.ok) {
                throw new Error(data.error || 'Failed to load linked modifier groups')
            }

            setLinkedGroups(data.groups)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load linked modifier groups')
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        if (!itemId) {
            setLinkedGroups([])
            setSelectedGroupId('')
            return
        }

        void loadLinkedGroups(itemId)
    }, [itemId])

    React.useEffect(() => {
        const firstGroup = groupsForLocation[0]

        if (firstGroup && !selectedGroupId) {
            setSelectedGroupId(String(firstGroup.id))
        }
    }, [groupsForLocation, selectedGroupId])

    async function handleLink() {
        if (!itemId || !selectedGroupId) return

        try {
            setSaving(true)
            setError(null)

            const res = await fetch(`/api/admin/menu/items/${itemId}/modifier-groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modifierGroupId: Number(selectedGroupId),
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.ok) {
                throw new Error(data.error || 'Failed to link modifier group')
            }

            await loadLinkedGroups(itemId)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to link modifier group')
        } finally {
            setSaving(false)
        }
    }

    async function handleUnlink(groupId: number) {
        if (!itemId) return

        try {
            setSaving(true)
            setError(null)

            const res = await fetch(`/api/admin/menu/items/${itemId}/modifier-groups/${groupId}`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (!res.ok || !data.ok) {
                throw new Error(data.error || 'Failed to unlink modifier group')
            }

            await loadLinkedGroups(itemId)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to unlink modifier group')
        } finally {
            setSaving(false)
        }
    }

    if (!itemId) {
        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <h2 className="text-lg font-semibold mb-2">Linked Modifier Groups</h2>
                <p className="text-sm text-white/60">
                    Select or edit a menu item first to manage linked modifier groups.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5 space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Linked Modifier Groups</h2>
                <p className="text-sm text-white/60 mt-1">
                    Attach or detach modifier groups for this item.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
                <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="h-11 rounded-lg bg-neutral-950 border border-white/10 px-3 outline-none flex-1"
                >
                    {groupsForLocation.length === 0 ? (
                        <option value="">No groups for this location</option>
                    ) : (
                        groupsForLocation.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))
                    )}
                </select>

                <button
                    type="button"
                    onClick={handleLink}
                    disabled={saving || !selectedGroupId}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition"
                >
                    {saving ? 'Saving...' : 'Link Group'}
                </button>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 bg-white/5 text-sm font-medium">
                    Current Links
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-white/60">Loading...</div>
                ) : linkedGroups.length === 0 ? (
                    <div className="p-4 text-sm text-white/60">No linked modifier groups</div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {linkedGroups.map((group) => (
                            <div
                                key={group.id}
                                className="p-4 flex items-center justify-between gap-4"
                            >
                                <div>
                                    <div className="font-medium">{group.name}</div>
                                    <div className="text-xs text-white/60 mt-1">
                                        Required: {group.isRequired ? 'Yes' : 'No'} | Min: {group.minSelected ?? '-'} | Max:{' '}
                                        {group.maxSelected ?? '-'} | {group.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void handleUnlink(group.id)}
                                    disabled={saving}
                                    className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 disabled:opacity-50 transition"
                                >
                                    Unlink
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}