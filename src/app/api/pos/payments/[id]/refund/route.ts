import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = { params: Promise<{ id: string }> };

type RefundBody = {
  amount: number | string;
  reason?: string;
  provider?: string | null;
  refundTransactionId?: string | null;
};

function parseId(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function toDecimal(input: unknown): Prisma.Decimal | null {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) return null;
    return new Prisma.Decimal(input);
  }
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    try {
      return new Prisma.Decimal(s);
    } catch {
      return null;
    }
  }
  return null;
}

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const paymentId = parseId(idParam);
    if (!paymentId) {
      return NextResponse.json({ error: "Invalid payment id" }, { status: 400 });
    }

    let body: RefundBody;
    try {
      body = (await req.json()) as RefundBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const amount = toDecimal(body.amount);
    if (!amount || amount.lte(0)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const provider = typeof body.provider === "string" ? body.provider.trim() : null;
    const refundTransactionId =
      typeof body.refundTransactionId === "string" ? body.refundTransactionId.trim() : null;

    const reason = typeof body.reason === "string" ? body.reason.trim() : null;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          id: paymentId,
          order: { locationId: auth.locationId },
        },
        select: {
          id: true,
          status: true,
          amount: true,
          orderId: true,
          shiftId: true,
          terminalId: true,
          order: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              tableId: true,
            },
          },
          refunds: {
            where: { status: "APPROVED" },
            select: { amount: true },
          },
        },
      });

      if (!payment) return { ok: false as const, status: 404, message: "Payment not found" };
      if (payment.order.status === "VOIDED") return { ok: false as const, status: 409, message: "Order is voided" };

      if (payment.status !== "APPROVED") {
        return { ok: false as const, status: 409, message: "Only APPROVED payments can be refunded" };
      }

      const refundedSoFar = payment.refunds.reduce((acc, r) => acc.add(r.amount), new Prisma.Decimal(0));
      const refundable = payment.amount.sub(refundedSoFar);

      if (amount.gt(refundable)) {
        return { ok: false as const, status: 400, message: "Refund amount exceeds refundable amount" };
      }

      const refund = await tx.paymentRefund.create({
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          shiftId: payment.shiftId ?? null,
          terminalId: payment.terminalId ?? null,
          amount: d2(amount),
          reason: reason || null,
          provider: provider,
          refundTransactionId: refundTransactionId,
          status: "APPROVED",
          refundedAt: new Date(),
        },
        select: {
          id: true,
          paymentId: true,
          amount: true,
          reason: true,
          provider: true,
          refundTransactionId: true,
          status: true,
          refundedAt: true,
          createdAt: true,
        },
      });

      const approvedPaymentsAgg = await tx.payment.aggregate({
        where: { orderId: payment.orderId, status: "APPROVED" },
        _sum: { amount: true },
      });

      const approvedRefundsAgg = await tx.paymentRefund.aggregate({
        where: { orderId: payment.orderId, status: "APPROVED" },
        _sum: { amount: true },
      });

      const approvedPayments = approvedPaymentsAgg._sum.amount ?? new Prisma.Decimal(0);
      const approvedRefunds = approvedRefundsAgg._sum.amount ?? new Prisma.Decimal(0);

      const netApproved = approvedPayments.sub(approvedRefunds);
      const remaining = payment.order.totalAmount.sub(netApproved);
      const isPaid = remaining.lte(0);

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: isPaid ? "PAID" : netApproved.gt(0) ? "PARTIALLY_PAID" : "OPEN",
          closedAt: isPaid ? new Date() : null,
          closedByUserId: isPaid ? auth.userId : null,
        },
        select: { id: true },
      });

      if (payment.order.tableId) {
        if (isPaid) {
          await tx.table.update({
            where: { id: payment.order.tableId },
            data: { status: "AVAILABLE", activeOrderId: null },
            select: { id: true },
          });
        } else {
          await tx.table.update({
            where: { id: payment.order.tableId },
            data: { status: "BUSY", activeOrderId: payment.orderId },
            select: { id: true },
          });
        }
      }

      return {
        ok: true as const,
        refund,
        orderId: payment.orderId,
        approvedTotal: d2(netApproved).toString(),
        remaining: d2(remaining).toString(),
        isPaid,
      };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
