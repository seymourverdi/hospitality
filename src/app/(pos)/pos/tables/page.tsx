"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequirePosAuth from "@/components/pos/RequirePosAuth";
import { authFetch, assertOk, clearPosToken } from "@/lib/pos/auth-client";
import { clearSelectedTableId, setSelectedTableId } from "@/lib/pos/pos-state";

type TableRow = {
  id: number;
  name: string;
  capacity: number;
  status: string;
  isActive: boolean;
  activeOrderId: number | null;
};

type AreaRow = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  tables: TableRow[];
};

type TablesResponse = {
  ok: true;
  areas: AreaRow[];
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function TablesPage() {
  return (
    <RequirePosAuth>
      <TablesPageInner />
    </RequirePosAuth>
  );
}

function TablesPageInner() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyTableId, setBusyTableId] = useState<number | null>(null);

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

      if (msg.toLowerCase().includes("unauthorized")) {
        clearPosToken();
        clearSelectedTableId();
        router.replace("/");
        return;
      }

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

  async function pickTable(tableId: number) {
    setBusyTableId(tableId);
    setError(null);

    try {
      setSelectedTableId(tableId);

      await authFetch(`/api/pos/tables/${tableId}/open-order`, {
        method: "POST",
        body: JSON.stringify({ orderType: "DINE_IN" }),
      }).then((res) => assertOk(res));

      router.replace("/pos");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
    } finally {
      setBusyTableId(null);
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
          </div>
        ) : null}
      </div>

      <div className="mt-6 border-t border-white/10" />

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-sm text-white/60">Loading…</div>
        ) : areas.length === 0 ? (
          <div className="text-sm text-white/60">No tables returned by API.</div>
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
                      const busy = busyTableId === t.id;
                      const disabled = busyTableId !== null && busyTableId !== t.id;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => pickTable(t.id)}
                          className={cx(
                            "rounded-2xl border p-4 text-left transition",
                            "bg-white/5 hover:bg-white/10 active:bg-white/15",
                            "border-white/10",
                            disabled && "opacity-50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-base font-semibold">{t.name}</div>
                            <div className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
                              {busy ? "Opening…" : t.status}
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-white/60">
                            Capacity: {t.capacity}
                          </div>

                          {t.activeOrderId ? (
                            <div className="mt-2 text-xs text-white/60">
                              Active order: <span className="text-white/80">#{t.activeOrderId}</span>
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