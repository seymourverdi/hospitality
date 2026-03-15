"use client";

import { useMemo, useState } from "react";
import { Prisma } from "@prisma/client";
import { authFetch, assertOk } from "@/lib/pos/auth-client";
import ModifiersModal from "@/components/pos/ModifiersModal";
import PaymentsModal from "@/components/pos/PaymentsModal";

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

type OrderItemView = {
  id: number;
  menuItemId: number;
  quantity: number;
  finalPrice: string;
  status?: string;
  kdsStatus?: string;
  menuItem: { id: number; name: string; sku?: string | null };
  modifiers?: ModifierLine[];
};

type Order = {
  id: number;
  status: string;
  tableId: number | null;
  table?: { id: number; name: string } | null;
  totals: {
    subtotalAmount: string;
    discountAmount: string;
    serviceChargeAmount: string;
    taxAmount: string;
    totalAmount: string;
  };
  items: OrderItemView[];
};

type Props = {
  order: Order | null;
  onRefresh: () => Promise<void> | void;
};

function money(s: string): string {
  try {
    return new Prisma.Decimal(s).toDecimalPlaces(2).toString();
  } catch {
    return s;
  }
}

type ModifierDisplayLine = {
  groupName: string;
  optionNames: string[];
};

function buildModifierDisplayLines(mods: ModifierLine[] | undefined): ModifierDisplayLine[] {
  if (!mods || mods.length === 0) return [];

  const map = new Map<string, string[]>();

  for (const m of mods) {
    const groupName = m.option.group.name;
    const optionName = m.option.name;

    const prev = map.get(groupName) ?? [];
    prev.push(optionName);
    map.set(groupName, prev);
  }

  return Array.from(map.entries()).map(([groupName, optionNames]) => ({
    groupName,
    optionNames,
  }));
}

async function voidItem(orderId: number, itemId: number, reason: string) {
  const res = await authFetch(`/api/pos/orders/${orderId}/items/${itemId}/void`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });

  return assertOk<{
    ok: true;
    alreadyVoided: boolean;
    item: { id: number; status: string };
    totals: unknown;
    kdsCleanup: {
      removedTicketItem: boolean;
      affectedTicketId: number | null;
      cancelledTicket: boolean;
    };
  }>(res);
}

async function sendToKitchen(orderId: number) {
  const res = await authFetch(`/api/pos/orders/${orderId}/send-to-kitchen`, {
    method: "POST",
  });

  return assertOk<{
    ok: true;
    skippedAlreadySentCount: number;
    totalSentCount: number;
  }>(res);
}

export default function OrderPanel({ order, onRefresh }: Props) {
  const [busyVoidItemId, setBusyVoidItemId] = useState<number | null>(null);
  const [busySend, setBusySend] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [modsOpen, setModsOpen] = useState(false);
  const [modsItem, setModsItem] = useState<OrderItemView | null>(null);

  const [payOpen, setPayOpen] = useState(false);

  const lines = useMemo(() => order?.items ?? [], [order]);

  const hasActiveItems = useMemo(() => {
    return lines.some((it) => (it.status ?? "ACTIVE") !== "VOID");
  }, [lines]);

  const canSendToKitchen = useMemo(() => {
    if (!order) return false;
    if (!hasActiveItems) return false;
    if (busySend) return false;
    if (order.status === "PAID" || order.status === "VOIDED") return false;
    return true;
  }, [order, hasActiveItems, busySend]);

  const sendDisabledReason = useMemo(() => {
    if (!order) return "No active order";
    if (!hasActiveItems) return "No active items";
    if (order.status === "PAID") return "Order is paid";
    if (order.status === "VOIDED") return "Order is voided";
    return null;
  }, [order, hasActiveItems]);

  async function handleVoid(itemId: number) {
    if (!order) return;

    const reason = window.prompt("Void reason (required):", "Mistake")?.trim() ?? "";
    if (!reason) return;

    setError(null);
    setInfo(null);
    setBusyVoidItemId(itemId);

    try {
      const data = await voidItem(order.id, itemId, reason);

      if (data.kdsCleanup.cancelledTicket) {
        setInfo("Item voided. Related kitchen ticket was cancelled.");
      } else if (data.kdsCleanup.removedTicketItem) {
        setInfo("Item voided. Removed it from kitchen ticket.");
      } else if (data.kdsCleanup.affectedTicketId) {
        setInfo(`Item voided. Kitchen ticket #${data.kdsCleanup.affectedTicketId} updated.`);
      } else {
        setInfo("Item voided.");
      }

      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyVoidItemId(null);
    }
  }

  async function handleSendToKitchen() {
    if (!order) return;

    setError(null);
    setInfo(null);
    setBusySend(true);

    try {
      const data = await sendToKitchen(order.id);
      if (data.totalSentCount > 0) {
        setInfo(`Sent ${data.totalSentCount} item(s) to kitchen.`);
      } else {
        setInfo("Nothing to send.");
      }
      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusySend(false);
    }
  }

  function openModifiers(item: OrderItemView) {
    setError(null);
    setInfo(null);
    setModsItem(item);
    setModsOpen(true);
  }

  const total = order ? money(order.totals.totalAmount) : "0.00";

  return (
    <div className="h-full border-l border-white/10 bg-black">
      <ModifiersModal
        open={modsOpen}
        orderId={order?.id ?? 0}
        itemId={modsItem?.id ?? 0}
        menuItemId={modsItem?.menuItemId ?? 0}
        itemName={modsItem?.menuItem?.name ?? "Item"}
        initialModifiers={modsItem?.modifiers ?? []}
        onClose={() => {
          setModsOpen(false);
          setModsItem(null);
        }}
        onSaved={async () => {
          setModsOpen(false);
          setModsItem(null);
          await onRefresh();
        }}
      />

      {order ? (
        <PaymentsModal
          open={payOpen}
          orderId={order.id}
          onClose={() => setPayOpen(false)}
          onAfterChange={() => onRefresh()}
        />
      ) : null}

      <div className="p-4 border-b border-white/10 bg-white/[0.03]">
        <div className="text-sm text-white/60">Active order</div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">{order ? `#${order.id}` : "—"}</div>

          <button
            className="rounded-xl bg-white/10 hover:bg-white/15 transition px-3 py-2 text-sm font-semibold disabled:opacity-50"
            onClick={() => void onRefresh()}
            disabled={!order || busySend}
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-white/60">Total</div>
          <div className="text-lg font-semibold">${total}</div>
        </div>

        {info ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            {info}
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 py-3 text-sm font-semibold disabled:opacity-50"
            onClick={() => void handleSendToKitchen()}
            disabled={!canSendToKitchen}
            title={sendDisabledReason ?? undefined}
            type="button"
          >
            {busySend ? "Sending..." : "Send to kitchen"}
          </button>

          <button
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 transition px-4 py-3 text-sm font-semibold disabled:opacity-50"
            disabled={!order || busySend}
            onClick={() => setPayOpen(true)}
            type="button"
          >
            Pay
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {lines.length === 0 ? (
          <div className="text-sm text-white/50">No items</div>
        ) : (
          lines.map((it) => {
            const isVoided = (it.status ?? "ACTIVE") === "VOID";
            const busyVoid = busyVoidItemId === it.id;

            const modifierLines = buildModifierDisplayLines(it.modifiers);

            return (
              <div key={it.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{it.menuItem.name}</div>

                    <div className="mt-1 text-xs text-white/60">
                      Qty: {it.quantity} · ${money(it.finalPrice)}
                    </div>

                    <div className="mt-1 text-xs text-white/50">
                      Status: {isVoided ? "VOID" : "ACTIVE"}
                      {it.kdsStatus ? ` · KDS: ${it.kdsStatus}` : ""}
                    </div>

                    {modifierLines.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {modifierLines.map((ml) => (
                          <div key={ml.groupName} className="text-xs text-white/70">
                            {ml.groupName}: {ml.optionNames.join(", ")}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-2">
                      <button
                        className="rounded-xl bg-white/10 hover:bg-white/15 transition px-3 py-2 text-xs font-semibold disabled:opacity-50"
                        onClick={() => openModifiers(it)}
                        disabled={!order || isVoided || busySend}
                        type="button"
                      >
                        Edit modifiers
                      </button>
                    </div>
                  </div>

                  <button
                    className="rounded-xl bg-white/10 hover:bg-white/15 transition px-3 py-2 text-xs font-semibold disabled:opacity-50"
                    onClick={() => void handleVoid(it.id)}
                    disabled={!order || busyVoid || isVoided || busySend}
                    type="button"
                  >
                    {isVoided ? "Voided" : busyVoid ? "Voiding..." : "Void"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}