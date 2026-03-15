'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import type { PosTable } from '@/modules/pos/types/table'
import { selectTableAndOpenOrder } from '@/modules/pos/lib/client/select-table-and-open-order'

type Props = {
  tables: PosTable[]
}

export default function TablesScreen({ tables }: Props) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect(tableId: string) {
    if (busyId) {
      return
    }

    setBusyId(tableId)
    setError(null)

    try {
      const result = await selectTableAndOpenOrder(tableId)

      if (!result.ok) {
        setError(result.error || 'Failed to open order')
        return
      }

      router.push('/pos' as Route)
    } catch (err) {
      console.error('Table selection failed', err)
      setError('Unexpected error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Tables</h1>

        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {tables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => handleSelect(table.id)}
              disabled={busyId === table.id}
              className="rounded-xl border p-4 text-left"
            >
              <div className="text-lg font-semibold">{table.name}</div>

              <div className="mt-2 text-sm text-neutral-600">
                Status: {table.status}
              </div>

              <div className="text-sm text-neutral-600">
                Seats: {table.seats ?? '-'}
              </div>

              <div className="mt-3 text-sm">
                {busyId === table.id ? 'Opening...' : 'Open'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}