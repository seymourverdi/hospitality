import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

function parseId(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const paymentId = parseId(idParam);

    if (!paymentId) {
      return NextResponse.json({ error: "Invalid payment id" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          status: true,
          orderId: true,
          order: {
            select: {
              id: true,
              locationId: true,
              status: true,
              totalAmount: true,
              tableId: true,
            },
          },
        },
      });

      if (!payment || payment.order.locationId !== auth.locationId) {
        return { ok: false as const, status: 404, message: "Payment not found" };
      }

      if (payment.order.status === "VOIDED") {
        return { ok: false as const, status: 409, message: "Order is voided" };
      }

      if (payment.order.status === "PAID") {
        return { ok: false as const, status: 409, message: "Order already paid" };
      }

      if (payment.status === "APPROVED") {
        return { ok: true as const, updated: false, paymentId: payment.id, orderId: payment.orderId };
      }

      if (payment.status !== "PENDING") {
        return { ok: false as const, status: 409, message: "Payment is not pending" };
      }

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "APPROVED", paidAt: new Date() },
        select: { id: true },
      });

      const agg = await tx.payment.aggregate({
        where: { orderId: payment.orderId, status: "APPROVED" },
        _sum: { amount: true },
      });

      const approvedTotal = agg._sum.amount ?? new Prisma.Decimal(0);
      const remaining = payment.order.totalAmount.sub(approvedTotal);
      const isPaid = remaining.lte(0);

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: isPaid ? "PAID" : "PARTIALLY_PAID",
          closedAt: isPaid ? new Date() : null,
          closedByUserId: isPaid ? auth.userId : null,
        },
        select: { id: true },
      });

      if (isPaid && payment.order.tableId) {
        await tx.table.update({
          where: { id: payment.order.tableId },
          data: { status: "AVAILABLE", activeOrderId: null },
          select: { id: true },
        });
      }

      return {
        ok: true as const,
        updated: true,
        paymentId: payment.id,
        orderId: payment.orderId,
        approvedTotal: d2(approvedTotal).toString(),
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
