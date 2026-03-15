"use client";

import { useEffect, useMemo, useState } from "react";
import { Prisma } from "@prisma/client";
import { authFetch, assertOk } from "@/lib/pos/auth-client";

type PaymentMethod = "CASH" | "CARD" | "VOUCHER" | "ROOM" | "EXTERNAL";

type PaymentRow = {
  id: number;
  amount: string;
  tipAmount: string;
  paymentMethod: PaymentMethod;
  provider: string | null;
  transactionId: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

type PaymentsGetResponse = {
  ok: true;
  payments: PaymentRow[];
  summary: {
    subtotalAmount: string;
    taxAmount: string;
    totalAmount: string;
    approvedAmount: string;
    approvedTipAmount: string;
    remaining: string;
    isPaid: boolean;
  };
};

type PaymentsCreateResponse = {
  ok: true;
  payment: PaymentRow;
  summary: PaymentsGetResponse["summary"];
  order: { id: number; status: string; totalAmount: string };
};

type CloseResponse = { ok: true; order: { id: number; status: string; closedAt: string | null } };

type Props = {
  open: boolean;
  orderId: number;
  onClose: () => void;
  onAfterChange: () => Promise<void> | void;
};

function money(s: string): string {
  try {
    return new Prisma.Decimal(s).toDecimalPlaces(2).toString();
  } catch {
    return s;
  }
}

function clampTo2Decimals(input: string): string {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";
  const [a, b] = cleaned.split(".");
  const left = a ?? "";
  const right = (b ?? "").slice(0, 2);
  return right.length > 0 ? `${left}.${right}` : left;
}

async function fetchPayments(orderId: number) {
  const res = await authFetch(`/api/pos/orders/${orderId}/payments`, { method: "GET" });
  return assertOk<PaymentsGetResponse>(res);
}

async function createPayment(orderId: number, payload: { amount: string; tipAmount: string; paymentMethod: PaymentMethod }) {
  const res = await authFetch(`/api/pos/orders/${orderId}/payments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return assertOk<PaymentsCreateResponse>(res);
}

async function closeOrder(orderId: number) {
  const res = await authFetch(`/api/pos/orders/${orderId}/close`, { method: "POST" });
  return assertOk<CloseResponse>(res);
}

export default function PaymentsModal({ open, orderId, onClose, onAfterChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [busyPay, setBusyPay] = useState(false);
  const [busyClose, setBusyClose] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<PaymentsGetResponse["summary"] | null>(null);

  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState<string>("");
  const [tip, setTip] = useState<string>("");

  const remaining = useMemo(() => (summary ? money(summary.remaining) : "0.00"), [summary]);
  const isPaid = useMemo(() => Boolean(summary?.isPaid), [summary]);

  useEffect(() => {
    if (!open) return;

    let alive = true;

    async function run() {
      setError(null);
      setLoading(true);
      try {
        const data = await fetchPayments(orderId);
        if (!alive) return;

        setPayments(data.payments);
        setSummary(data.summary);

        const rem = money(data.summary.remaining);
        setAmount(rem === "0.00" ? "" : rem);
        setTip("");
        setMethod("CASH");
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [open, orderId]);

  if (!open) return null;

  async function handleAddPayment() {
    setError(null);

    const a = money(amount || "0");
    const t = money(tip || "0");

    const aDec = new Prisma.Decimal(a);
    const tDec = new Prisma.Decimal(t);

    if (aDec.lte(0)) {
      setError("Amount must be greater than 0.");
      return;
    }

    setBusyPay(true);
    try {
      const data = await createPayment(orderId, { amount: a, tipAmount: t, paymentMethod: method });
      setPayments((prev) => [data.payment, ...prev]);
      setSummary(data.summary);

      const rem = money(data.summary.remaining);
      setAmount(rem === "0.00" ? "" : rem);
      setTip("");

      await onAfterChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyPay(false);
    }
  }

  async function handleCloseOrder() {
    setError(null);
    setBusyClose(true);
    try {
      await closeOrder(orderId);
      await onAfterChange();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyClose(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-[720px] rounded-2xl border border-white/10 bg-neutral-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-sm text-white/60">Payments</div>
            <div className="text-lg font-semibold">Order #{orderId}</div>
          </div>

          <button
            className="rounded-xl bg-white/10 hover:bg-white/15 transition px-3 py-2 text-sm font-semibold"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Loading…</div>
          ) : (
            <>
              {summary ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Total</div>
                    <div className="mt-1 text-lg font-semibold">${money(summary.totalAmount)}</div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Paid</div>
                    <div className="mt-1 text-lg font-semibold">${money(summary.approvedAmount)}</div>
                    <div className="mt-1 text-xs text-white/50">Tip: ${money(summary.approvedTipAmount)}</div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/60">Remaining</div>
                    <div className="mt-1 text-lg font-semibold">${remaining}</div>
                    <div className="mt-1 text-xs text-white/50">{isPaid ? "Paid" : "Not paid"}</div>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-semibold">Add payment</div>

                <div className="mt-3 grid grid-cols-5 gap-2">
                  {(["CASH", "CARD", "VOUCHER", "ROOM", "EXTERNAL"] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      className={[
                        "rounded-xl px-3 py-2 text-xs font-semibold transition border",
                        m === method
                          ? "bg-white/15 border-white/20"
                          : "bg-white/5 hover:bg-white/10 border-white/10",
                      ].join(" ")}
                      onClick={() => setMethod(m)}
                      type="button"
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/60">Amount</div>
                    <input
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
                      value={amount}
                      onChange={(e) => setAmount(clampTo2Decimals(e.target.value))}
                      placeholder={remaining}
                      inputMode="decimal"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-white/60">Tip</div>
                    <input
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20"
                      value={tip}
                      onChange={(e) => setTip(clampTo2Decimals(e.target.value))}
                      placeholder="0.00"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 transition px-4 py-3 text-sm font-semibold disabled:opacity-50"
                    onClick={() => void handleAddPayment()}
                    disabled={busyPay || loading}
                    type="button"
                  >
                    {busyPay ? "Processing…" : "Add payment"}
                  </button>

                  <button
                    className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3 text-sm font-semibold disabled:opacity-50"
                    onClick={() => {
                      if (!summary) return;
                      setAmount(remaining === "0.00" ? "" : remaining);
                    }}
                    disabled={!summary || busyPay || loading}
                    type="button"
                  >
                    Fill remaining
                  </button>
                </div>

                {summary?.isPaid ? (
                  <div className="mt-4 flex items-center justify-end">
                    <button
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 py-3 text-sm font-semibold disabled:opacity-50"
                      onClick={() => void handleCloseOrder()}
                      disabled={busyClose || busyPay || loading}
                      type="button"
                    >
                      {busyClose ? "Closing…" : "Close order"}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold">Payments history</div>

                {payments.length === 0 ? (
                  <div className="mt-2 text-sm text-white/50">No payments yet</div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {payments.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold">
                              {p.paymentMethod} · ${money(p.amount)}
                            </div>
                            <div className="mt-1 text-xs text-white/60">
                              Tip: ${money(p.tipAmount)} · Status: {p.status}
                            </div>
                            {(p.provider || p.transactionId) ? (
                              <div className="mt-1 text-xs text-white/50">
                                {p.provider ? `Provider: ${p.provider}` : ""}
                                {p.provider && p.transactionId ? " · " : ""}
                                {p.transactionId ? `Txn: ${p.transactionId}` : ""}
                              </div>
                            ) : null}
                          </div>

                          <div className="text-xs text-white/50">
                            {new Date(p.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}