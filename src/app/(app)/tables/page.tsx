'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout';

type SaleTable = {
  id: string;
  name: string;
  shape: 'circle' | 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  seats: number[];
  maxSeats: number;
  floorId: string;
  status?: string;
  activeOrder?: {
    id: number;
    status: string;
    itemCount: number;
    totalAmount: number;
  } | null;
};

type SaleFloor = {
  id: string;
  name: string;
  tables: SaleTable[];
};

type SaleTablesResponse = {
  ok: boolean;
  floors?: SaleFloor[];
  error?: string;
};

function getStatusClasses(status?: string, hasOrder?: boolean) {
  if (hasOrder) {
    return 'bg-red-500/15 border-red-500/30 text-red-300';
  }

  const normalized = String(status ?? '').toLowerCase();

  if (normalized === 'reserved') {
    return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
  }

  if (normalized === 'dirty') {
    return 'bg-orange-500/15 border-orange-500/30 text-orange-300';
  }

  return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
}

function getStatusLabel(status?: string, hasOrder?: boolean) {
  if (hasOrder) return 'open order';

  const normalized = String(status ?? '').toLowerCase();
  if (!normalized) return 'available';
  return normalized;
}

export default function TablesPage() {
  const router = useRouter();

  const [floors, setFloors] = React.useState<SaleFloor[]>([]);
  const [activeFloorId, setActiveFloorId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyTableId, setBusyTableId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const loadTables = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sale/tables', {
        method: 'GET',
        cache: 'no-store',
      });

      const data = (await res.json()) as SaleTablesResponse;

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load tables');
      }

      const nextFloors = data.floors ?? [];
      setFloors(nextFloors);
      setActiveFloorId((current) => current ?? nextFloors[0]?.id ?? null);
    } catch (err) {
      console.error('Failed to load tables page data', err);
      setError(err instanceof Error ? err.message : 'Failed to load tables');
      setFloors([]);
      setActiveFloorId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTables();
  }, [loadTables]);

  const activeFloor = React.useMemo(() => {
    if (!activeFloorId) return null;
    return floors.find((floor) => floor.id === activeFloorId) ?? null;
  }, [floors, activeFloorId]);

  const totalTables = React.useMemo(
    () => floors.reduce((sum, floor) => sum + floor.tables.length, 0),
    [floors]
  );

  const occupiedTables = React.useMemo(
    () =>
      floors.reduce((sum, floor) => {
        return sum + floor.tables.filter((table) => Boolean(table.activeOrder)).length;
      }, 0),
    [floors]
  );

  const availableTables = Math.max(0, totalTables - occupiedTables);

  const handleOpenSale = React.useCallback(
    (table: SaleTable) => {
      router.push(`/sale?tableId=${table.id}`);
    },
    [router]
  );

  const handlePayAndClose = React.useCallback(
    async (table: SaleTable) => {
      if (!table.activeOrder) {
        return;
      }

      setBusyTableId(table.id);
      setError(null);
      setMessage(null);

      try {
        const res = await fetch(`/api/sale/orders/${table.activeOrder.id}/pay-close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.NEXT_PUBLIC_SALE_API_KEY
              ? {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SALE_API_KEY}`,
                }
              : {}),
          },
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to pay and close order');
        }

        setMessage(`Table ${table.name} closed successfully`);
        await loadTables();
      } catch (err) {
        console.error('Failed to pay and close table', err);
        setError(err instanceof Error ? err.message : 'Failed to pay and close order');
      } finally {
        setBusyTableId(null);
      }
    },
    [loadTables]
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar
        title="Table Management"
        subtitle="Live floor status and active orders"
        user={{
          name: 'Manager Mike',
          email: 'mike@cityclub.com',
          role: 'manager',
        }}
      />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total tables</div>
              <div className="mt-2 text-3xl font-semibold">{totalTables}</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Available</div>
              <div className="mt-2 text-3xl font-semibold">{availableTables}</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Open orders</div>
              <div className="mt-2 text-3xl font-semibold">{occupiedTables}</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Refresh</div>
              <button
                type="button"
                onClick={() => void loadTables()}
                className="mt-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Reload tables
              </button>
            </div>
          </div>

          {message ? (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <div className="flex flex-wrap gap-2">
                {floors.map((floor) => (
                  <button
                    key={floor.id}
                    type="button"
                    onClick={() => setActiveFloorId(floor.id)}
                    className={[
                      'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      activeFloor?.id === floor.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-accent',
                    ].join(' ')}
                  >
                    {floor.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center min-h-[320px] text-muted-foreground">
                  Loading tables...
                </div>
              ) : !activeFloor ? (
                <div className="flex items-center justify-center min-h-[320px] text-muted-foreground">
                  No floor data found
                </div>
              ) : activeFloor.tables.length === 0 ? (
                <div className="flex items-center justify-center min-h-[320px] text-muted-foreground">
                  No tables configured for this area
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {activeFloor.tables.map((table) => {
                    const hasOrder = Boolean(table.activeOrder);
                    const isBusy = busyTableId === table.id;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => handleOpenSale(table)}
                        className="rounded-2xl border border-border bg-background p-4 text-left transition-transform hover:scale-[1.01] hover:border-primary/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold">{table.name}</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              Seats: {table.maxSeats}
                            </div>
                          </div>

                          <span
                            className={[
                              'rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
                              getStatusClasses(table.status, hasOrder),
                            ].join(' ')}
                          >
                            {getStatusLabel(table.status, hasOrder)}
                          </span>
                        </div>

                        {table.activeOrder ? (
                          <div className="mt-4 rounded-xl bg-muted/50 p-3">
                            <div className="text-xs text-muted-foreground">
                              Order #{table.activeOrder.id}
                            </div>
                            <div className="mt-1 text-sm font-medium">
                              {table.activeOrder.itemCount} item
                              {table.activeOrder.itemCount !== 1 ? 's' : ''}
                            </div>
                            <div className="mt-1 text-sm font-semibold">
                              ${table.activeOrder.totalAmount.toFixed(2)}
                            </div>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handlePayAndClose(table);
                              }}
                              className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
                            >
                              {isBusy ? 'Closing...' : 'Pay & Close'}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 text-sm text-muted-foreground">
                            No active order
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Shape: {table.shape}
                          </span>
                          <span className="font-medium">
                            {table.activeOrder ? 'Resume order' : 'Open sale'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}