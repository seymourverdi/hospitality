"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch, assertOk } from "@/lib/pos/auth-client";

type ModifierLine = {
  id: number;
  modifierOptionId: number;
  priceDelta: string | null;
  option: {
    id: number;
    name: string;
    group: { id: number; name: string };
  };
};

type ModifierOption = {
  id: number;
  name: string;
  priceDelta: string | null;
  sortOrder: number | null;
};

type ModifierGroup = {
  id: number;
  name: string;
  isRequired: boolean;
  minSelected: number | null;
  maxSelected: number | null;
  sortOrder: number | null;
  options: ModifierOption[];
};

type GroupsResponse = {
  ok: true;
  menuItemId: number;
  groups: ModifierGroup[];
};

type Props = {
  open: boolean;
  orderId: number;
  itemId: number;
  menuItemId: number;
  itemName: string;
  initialModifiers: ModifierLine[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function groupLimits(g: ModifierGroup): { min: number; max: number; mode: "single" | "multi" } {
  const max = g.maxSelected ?? (g.isRequired ? 1 : 999);
  const min = g.minSelected ?? (g.isRequired ? 1 : 0);
  const maxClamped = clamp(max, 0, 999);
  const minClamped = clamp(min, 0, maxClamped);
  const mode: "single" | "multi" = maxClamped <= 1 ? "single" : "multi";
  return { min: minClamped, max: maxClamped, mode };
}

function computeExtra(groups: ModifierGroup[], selected: Set<number>): string {
  let sum = 0;

  for (const g of groups) {
    for (const o of g.options) {
      if (!selected.has(o.id)) continue;
      if (!o.priceDelta) continue;
      const n = Number(o.priceDelta);
      if (Number.isFinite(n)) sum += n;
    }
  }

  return sum.toFixed(2);
}

async function fetchGroups(menuItemId: number) {
  const res = await authFetch(`/api/pos/menu/items/${menuItemId}/modifier-groups`, { method: "GET" });
  return assertOk<GroupsResponse>(res);
}

async function replaceModifiers(orderId: number, itemId: number, modifierOptionIds: number[]) {
  const res = await authFetch(`/api/pos/orders/${orderId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      action: "replaceModifiers",
      modifierOptionIds,
    }),
  });

  return assertOk<{ ok: true }>(res);
}

export default function ModifiersModal({
  open,
  orderId,
  itemId,
  menuItemId,
  itemName,
  initialModifiers,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const initialSelected = useMemo(() => {
    return new Set(initialModifiers.map((m) => m.option.id));
  }, [initialModifiers]);

  const extra = useMemo(() => computeExtra(groups, selected), [groups, selected]);

  const validation = useMemo(() => {
    const perGroup: Array<{ groupId: number; ok: boolean; message: string | null }> = [];

    for (const g of groups) {
      const { min, max } = groupLimits(g);
      const picked = g.options.filter((o) => selected.has(o.id)).length;

      if (picked < min) {
        perGroup.push({
          groupId: g.id,
          ok: false,
          message: `Select at least ${min}.`,
        });
        continue;
      }

      if (picked > max) {
        perGroup.push({
          groupId: g.id,
          ok: false,
          message: `Select at most ${max}.`,
        });
        continue;
      }

      perGroup.push({ groupId: g.id, ok: true, message: null });
    }

    const allOk = perGroup.every((x) => x.ok);
    return { allOk, perGroup };
  }, [groups, selected]);

  useEffect(() => {
    if (!open) return;

    let alive = true;

    async function run() {
      setLoading(true);
      setSaving(false);
      setError(null);

      setSelected(new Set(initialSelected));

      try {
        const data = await fetchGroups(menuItemId);
        if (!alive) return;
        setGroups(data.groups);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error");
        setGroups([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [open, menuItemId, initialSelected]);

  function toggleOption(group: ModifierGroup, optionId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      const { mode } = groupLimits(group);

      if (mode === "single") {
        for (const o of group.options) next.delete(o.id);
        next.add(optionId);
        return next;
      }

      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);

      const { max } = groupLimits(group);
      if (max >= 0) {
        const picked = group.options.filter((o) => next.has(o.id));
        if (picked.length > max) {
          next.delete(optionId);
        }
      }

      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function handleSave() {
    if (saving) return;

    setError(null);

    if (!validation.allOk) {
      setError("Please fix modifier selection rules.");
      return;
    }

    setSaving(true);

    try {
      const modifierOptionIds = Array.from(selected.values());
      await replaceModifiers(orderId, itemId, modifierOptionIds);
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-[740px] rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <div className="text-xs text-white/60">Modifiers</div>
            <div className="mt-1 text-lg font-semibold">{itemName}</div>
            <div className="mt-1 text-xs text-white/60">Extra: ${extra}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-2 text-sm font-semibold disabled:opacity-50"
              onClick={clearAll}
              disabled={loading || saving}
              type="button"
            >
              Clear
            </button>

            <button
              className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-2 text-sm font-semibold disabled:opacity-50"
              onClick={onClose}
              disabled={saving}
              type="button"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
              Loading modifiers...
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
              No modifiers for this item.
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => {
                const { min, max, mode } = groupLimits(g);
                const picked = g.options.filter((o) => selected.has(o.id)).length;
                const ruleText = mode === "single" ? "Single" : `Multi ${min}-${max}`;

                const groupValidation = validation.perGroup.find((x) => x.groupId === g.id);
                const groupError = groupValidation && !groupValidation.ok ? groupValidation.message : null;

                return (
                  <div key={g.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{g.name}</div>
                        <div className="mt-1 text-xs text-white/60">
                          {ruleText} · Selected {picked}
                        </div>
                      </div>

                      <div className="text-xs text-white/50">{mode === "single" ? "Single" : "Multiple"}</div>
                    </div>

                    {groupError && (
                      <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-100">
                        {groupError}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {g.options.map((o) => {
                        const isOn = selected.has(o.id);
                        const deltaText =
                          o.priceDelta && Number(o.priceDelta) !== 0
                            ? ` (+$${Number(o.priceDelta).toFixed(2)})`
                            : "";

                        return (
                          <button
                            key={o.id}
                            className={[
                              "rounded-xl px-3 py-2 text-sm font-semibold transition border",
                              isOn
                                ? "bg-white/15 border-white/20"
                                : "bg-white/5 hover:bg-white/10 border-white/10",
                            ].join(" ")}
                            onClick={() => toggleOption(g, o.id)}
                            disabled={saving}
                            type="button"
                          >
                            {o.name}
                            <span className="text-white/60">{deltaText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="text-xs text-white/60">Review selections and confirm.</div>

            <div className="flex items-center gap-3">
              <button
                className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-2 text-sm font-semibold disabled:opacity-50"
                onClick={onClose}
                disabled={saving}
                type="button"
              >
                Cancel
              </button>

              <button
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-5 py-2 text-sm font-semibold disabled:opacity-50"
                onClick={() => void handleSave()}
                disabled={saving || loading || groups.length === 0}
                type="button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}