import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
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

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id: paymentId, order: { locationId: auth.locationId } },
        select: {
          id: true,
          status: true,
          orderId: true,
          order: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              tableId: true,
            },
          },
        },
      });

      if (!payment) return { ok: false as const, status: 404, message: "Payment not found" };
      if (payment.order.status === "VOIDED") return { ok: false as const, status: 409, message: "Order is voided" };

      if (payment.status === "APPROVED") {
        return { ok: false as const, status: 409, message: "Approved payment cannot be voided. Use refund." };
      }

      if (payment.status === "DECLINED") {
        // No-op
      } else if (payment.status === "PENDING") {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "DECLINED", paidAt: null },
          select: { id: true },
        });
      } else {
        return { ok: false as const, status: 409, message: "Payment cannot be voided from current status" };
      }

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
        paymentId: payment.id,
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
