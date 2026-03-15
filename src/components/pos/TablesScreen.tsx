"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequirePosAuth from "@/components/pos/RequirePosAuth";
import { authFetch, assertOk, clearPosToken } from "@/lib/pos/auth-client";
import { clearSelectedTableId, setSelectedTableId } from "@/lib/pos/pos-state";

type ApiTable = {
  id: number;
  name: string;
  capacity: number | null;
  status: string;
  isActive: boolean;
  activeOrderId: number | null;
};

type ApiArea = {
  id: number;
  name: string;
  sortOrder: number | null;
  isActive: boolean;
  tables: ApiTable[];
};

type TablesResponse = {
  ok: true;
  areas: ApiArea[];
};

type OpenOrderResponse = {
  ok: true;
  reused?: boolean;
  order: {
    id: number;
    tableId: number | null;
    status: string;
    orderType: string;
  };
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function parseError(e: unknown): string {
  return e instanceof Error ? e.message : "Error";
}

export default function TablesScreen() {
  return (
    <RequirePosAuth>
      <TablesScreenInner />
    </RequirePosAuth>
  );
}

function TablesScreenInner() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<ApiArea[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch("/api/pos/tables", { method: "GET" });
      const data = await assertOk<TablesResponse>(res);
      setAreas(data.areas ?? []);
    } catch (e) {
      const msg = parseError(e);
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
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalTables = useMemo(() => {
    return areas.reduce((acc, a) => acc + (a.tables?.length ?? 0), 0);
  }, [areas]);

  const sortedAreas = useMemo(() => {
    return [...areas]
      .filter((a) => a.isActive)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [areas]);

  async function openTable(tableId: number) {
    setError(null);
    setOpeningId(tableId);

    try {
      setSelectedTableId(tableId);

      const res = await authFetch(`/api/pos/tables/${tableId}/open-order`, {
        method: "POST",
        body: JSON.stringify({ orderType: "DINE_IN" }),
      });

      await assertOk<OpenOrderResponse>(res);

      router.push("/pos");
    } catch (e) {
      const msg = parseError(e);
      setError(msg);

      if (msg.toLowerCase().includes("unauthorized")) {
        clearPosToken();
        clearSelectedTableId();
        router.replace("/");
        return;
      }
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Select Table</div>
            <div className="mt-1 text-sm text-white/60">Tap a table to open an order</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading || openingId !== null}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 active:bg-white/20 disabled:opacity-60"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => router.push("/pos")}
              disabled={openingId !== null}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 active:bg-white/20 disabled:opacity-60"
            >
              Back to POS
            </button>

            <div className="text-sm text-white/60">Tables: {totalTables}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            Loading tables...
          </div>
        ) : sortedAreas.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            No active areas returned by API.
          </div>
        ) : (
          <div className="space-y-8">
            {sortedAreas.map((area) => (
              <div key={area.id}>
                <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  {area.name}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(area.tables ?? [])
                    .filter((t) => t.isActive)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((t) => {
                      const busy = openingId === t.id;
                      const hasActive = !!t.activeOrderId;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => void openTable(t.id)}
                          disabled={openingId !== null && openingId !== t.id}
                          className={cx(
                            "rounded-2xl border p-4 text-left transition",
                            "bg-white/[0.04] hover:bg-white/[0.06] active:bg-white/[0.08]",
                            "border-white/10 disabled:opacity-60"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-lg font-semibold">{t.name}</div>
                            <div className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                              {busy ? "Opening..." : hasActive ? "Busy" : "Open"}
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-white/60">
                            Capacity: {t.capacity ?? "—"}
                          </div>

                          {t.activeOrderId ? (
                            <div className="mt-3 text-xs text-white/60">
                              Active order #{t.activeOrderId}
                            </div>
                          ) : (
                            <div className="mt-3 text-xs text-white/40">No active order</div>
                          )}
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