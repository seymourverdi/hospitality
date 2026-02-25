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

type Totals = {
  approvedPayments: string;
  approvedRefunds: string;
  netApproved: string;
  remaining: string;
};

type TxFail = {
  ok: false;
  status: number;
  message: string;
  totals?: Totals;
};

type TxOk = {
  ok: true;
  order: {
    id: number;
    status: string;
    closedAt: Date | null;
    closedByUserId: number | null;
    tableId: number | null;
    totalAmount: Prisma.Decimal;
  };
  totals: Totals;
};

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const orderId = parseId(idParam);
    if (!orderId) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const result = await prisma.$transaction<TxOk | TxFail>(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          tableId: true,
        },
      });

      if (!order) return { ok: false, status: 404, message: "Order not found" };
      if (order.status === "VOIDED") return { ok: false, status: 409, message: "Order is voided" };

      const payAgg = await tx.payment.aggregate({
        where: { orderId, status: "APPROVED" },
        _sum: { amount: true },
      });
      const approvedPayments = payAgg._sum.amount ?? new Prisma.Decimal(0);

      const refundAgg = await tx.paymentRefund.aggregate({
        where: { orderId, status: "APPROVED" },
        _sum: { amount: true },
      });
      const approvedRefunds = refundAgg._sum.amount ?? new Prisma.Decimal(0);

      const netApproved = approvedPayments.sub(approvedRefunds);
      const remaining = order.totalAmount.sub(netApproved);
      const isPaid = remaining.lte(0);

      const totals: Totals = {
        approvedPayments: d2(approvedPayments).toString(),
        approvedRefunds: d2(approvedRefunds).toString(),
        netApproved: d2(netApproved).toString(),
        remaining: d2(remaining).toString(),
      };

      if (!isPaid) {
        return {
          ok: false,
          status: 409,
          message: "Order is not fully paid",
          totals,
        };
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          closedAt: new Date(),
          closedByUserId: auth.userId,
        },
        select: {
          id: true,
          status: true,
          closedAt: true,
          closedByUserId: true,
          tableId: true,
          totalAmount: true,
        },
      });

      if (updated.tableId) {
        await tx.table.update({
          where: { id: updated.tableId },
          data: { status: "AVAILABLE", activeOrderId: null },
          select: { id: true },
        });
      }

      return {
        ok: true,
        order: updated,
        totals,
      };
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, totals: result.totals },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
