"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { assertOk, authFetch } from "@/lib/pos/auth-client";

type TableStatus = "AVAILABLE" | "BUSY" | "RESERVED" | "INACTIVE";

type ApiTable = {
  id: number;
  name: string;
  capacity: number | null;
  status: TableStatus;
  isActive: boolean;
  activeOrderId: number | null;
  activeOrder: null | {
    id: number;
    status: string;
    orderType: string;
    openedAt: string;
    closedAt: string | null;
    note: string | null;
    totalAmount: string;
    counts: { items: number; payments: number };
    remaining: string;
    isPaid: boolean;
  };
};

type ApiArea = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  tables: ApiTable[];
};

type TablesResponse = {
  ok: true;
  areas: ApiArea[];
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function TablesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<ApiArea[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/pos/tables");
      const data = await assertOk<TablesResponse>(res);
      setAreas(data.areas || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load tables";
      setError(msg);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totalTables = useMemo(
    () => areas.reduce((acc, a) => acc + (a.tables?.length || 0), 0),
    [areas]
  );

  async function openTable(t: ApiTable) {
    
    if (t.activeOrderId) {
      router.push(`/pos?orderId=${t.activeOrderId}&tableId=${t.id}`);
      return;
    }

    
    try {
      const res = await authFetch("/api/pos/orders", {
        method: "POST",
        body: JSON.stringify({
          orderType: "DINE_IN",
          tableId: t.id,
        }),
      });

      const data = await assertOk<{ ok: true; order: { id: number } }>(res);
      router.push(`/pos?orderId=${data.order.id}&tableId=${t.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to open table";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="px-6 pt-6">
        <div className="text-2xl font-semibold">Select Table</div>
        <div className="mt-1 text-sm text-white/60">Tap a table to open an order</div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={load}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15 active:bg-white/20"
          >
            Refresh
          </button>
          <div className="text-sm text-white/50">Tables: {totalTables}</div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
            <div className="mt-2 text-xs text-red-200/70">
             Check: The browser actually stores the token (DevTools Console):{" "}
              <span className="text-red-100">localStorage.getItem("pos_token")</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 border-t border-white/10" />

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-sm text-white/60">Loading…</div>
        ) : areas.length === 0 ? (
          <div className="text-sm text-white/60">
            No tables returned by API. Check the answer: GET <span className="text-white/80">/api/pos/tables</span>
          </div>
        ) : (
          <div className="space-y-8">
            {areas
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((area) => (
                <div key={area.id}>
                  <div className="text-sm font-semibold tracking-wide text-white/80">
                    {area.name.toUpperCase()}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {area.tables.map((t) => {
                      const busy = t.status === "BUSY" || !!t.activeOrderId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => openTable(t)}
                          className={cx(
                            "rounded-2xl border p-4 text-left transition",
                            "bg-white/5 hover:bg-white/10 active:bg-white/15",
                            busy ? "border-white/20" : "border-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-lg font-semibold">{t.name}</div>
                            <div
                              className={cx(
                                "rounded-full px-2 py-1 text-xs",
                                busy ? "bg-white/10 text-white/70" : "bg-emerald-500/15 text-emerald-200"
                              )}
                            >
                              {busy ? "Busy" : "Available"}
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-white/60">
                            Capacity: {t.capacity ?? "-"}
                          </div>

                          {t.activeOrder ? (
                            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
                              <div className="text-xs text-white/60">
                                Order #{t.activeOrder.id} • {t.activeOrder.status}
                              </div>
                              <div className="mt-1 text-xs text-white/60">
                                Items: {t.activeOrder.counts.items} • Remaining: {t.activeOrder.remaining}
                              </div>
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
