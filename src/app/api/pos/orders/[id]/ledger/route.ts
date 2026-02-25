import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function parseSince(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parseLimit(value: string | null): number {
  if (!value) return 500;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return 500;
  return Math.min(n, 2000);
}

type LedgerEventType =
  | "PAYMENT_PENDING"
  | "PAYMENT_APPROVED"
  | "PAYMENT_DECLINED"
  | "REFUND_APPROVED";

type LedgerEvent = {
  type: LedgerEventType;
  id: number;
  orderId: number;
  amount: string;
  paymentMethod?: string | null;
  provider?: string | null;
  transactionId?: string | null;

  paymentId?: number | null;
  refundTransactionId?: string | null;
  reason?: string | null;

  status: string;
  at: string;
};

function parseTypesParam(value: string | null): Set<LedgerEventType> | null {
  if (!value) return null;
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as LedgerEventType[];
  if (!parts.length) return null;
  return new Set(parts);
}

export async function GET(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const orderId = parseId(idParam);
    if (!orderId) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const url = new URL(req.url);
    const since = parseSince(url.searchParams.get("since"));
    const limit = parseLimit(url.searchParams.get("limit"));
    const typesFilter = parseTypesParam(url.searchParams.get("types"));

    const order = await prisma.order.findFirst({
      where: { id: orderId, locationId: auth.locationId },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const [payments, refunds] = await prisma.$transaction([
      prisma.payment.findMany({
        where: {
          orderId,
          ...(since ? { createdAt: { gte: since } } : {}),
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: limit,
        select: {
          id: true,
          orderId: true,
          amount: true,
          paymentMethod: true,
          provider: true,
          transactionId: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      prisma.paymentRefund.findMany({
        where: {
          orderId,
          ...(since ? { createdAt: { gte: since } } : {}),
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: limit,
        select: {
          id: true,
          orderId: true,
          paymentId: true,
          amount: true,
          reason: true,
          provider: true,
          refundTransactionId: true,
          status: true,
          refundedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const paymentEvents: LedgerEvent[] = payments.map((p) => {
      const type: LedgerEventType =
        p.status === "APPROVED"
          ? "PAYMENT_APPROVED"
          : p.status === "DECLINED"
          ? "PAYMENT_DECLINED"
          : "PAYMENT_PENDING";

      return {
        type,
        id: p.id,
        orderId: p.orderId,
        amount: p.amount.toString(),
        paymentMethod: p.paymentMethod,
        provider: p.provider ?? null,
        transactionId: p.transactionId ?? null,
        status: p.status,
        at: (p.paidAt ?? p.createdAt).toISOString(),
      };
    });

    const refundEvents: LedgerEvent[] = refunds
      .filter((r) => r.status === "APPROVED")
      .map((r) => ({
        type: "REFUND_APPROVED",
        id: r.id,
        orderId: r.orderId,
        amount: r.amount.toString(),
        paymentMethod: null,
        provider: r.provider ?? null,
        transactionId: null,
        paymentId: r.paymentId ?? null,
        refundTransactionId: r.refundTransactionId ?? null,
        reason: r.reason ?? null,
        status: r.status,
        at: (r.refundedAt ?? r.createdAt).toISOString(),
      }));

    let events = [...paymentEvents, ...refundEvents].sort((a, b) => {
      const ta = Date.parse(a.at);
      const tb = Date.parse(b.at);
      if (ta !== tb) return ta - tb;
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.id - b.id;
    });

    if (typesFilter) {
      events = events.filter((e) => typesFilter.has(e.type));
    }

    if (events.length > limit) {
      events = events.slice(0, limit);
    }

    return NextResponse.json({ orderId, events });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
