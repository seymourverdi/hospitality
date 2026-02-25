import { NextResponse } from "next/server";
import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Body = {
  sourceOrderId: number;
};

function parsePositiveInt(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function toPositiveInt(v: unknown): number | null {
  if (typeof v !== "number") return null;
  if (!Number.isInteger(v) || v <= 0) return null;
  return v;
}

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const targetOrderId = parsePositiveInt(idParam);
    if (!targetOrderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

    const body = (await req.json().catch(() => null)) as Body | null;
    const sourceOrderId = toPositiveInt(body?.sourceOrderId);
    if (!sourceOrderId) return NextResponse.json({ error: "sourceOrderId is required" }, { status: 400 });

    if (sourceOrderId === targetOrderId) {
      return NextResponse.json({ error: "sourceOrderId must be different" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const [target, source] = await Promise.all([
        tx.order.findFirst({
          where: { id: targetOrderId, locationId: auth.locationId },
          select: {
            id: true,
            status: true,
            tableId: true,
            totalAmount: true,
          },
        }),
        tx.order.findFirst({
          where: { id: sourceOrderId, locationId: auth.locationId },
          select: {
            id: true,
            status: true,
            tableId: true,
            totalAmount: true,
          },
        }),
      ]);

      if (!target) return { ok: false as const, status: 404, message: "Target order not found" };
      if (!source) return { ok: false as const, status: 404, message: "Source order not found" };

      if (target.status === OrderStatus.PAID || target.status === OrderStatus.VOIDED) {
        return { ok: false as const, status: 409, message: "Target order cannot be merged" };
      }
      if (source.status === OrderStatus.PAID || source.status === OrderStatus.VOIDED) {
        return { ok: false as const, status: 409, message: "Source order cannot be merged" };
      }

      // Move items
      const movedItems = await tx.orderItem.updateMany({
        where: { orderId: source.id },
        data: { orderId: target.id },
      });

      // Recalculate totals for target based on its items (finalPrice * quantity is already baked in finalPrice per item row)
      // In your schema finalPrice is per-line item, not per-unit (based on your existing responses).
      const agg = await tx.orderItem.aggregate({
        where: { orderId: target.id },
        _sum: { finalPrice: true, discountAmount: true },
      });

      const subtotal = agg._sum.finalPrice ?? new Prisma.Decimal(0);
      const discount = agg._sum.discountAmount ?? new Prisma.Decimal(0);

      // For now keep service/tax = 0 (same behavior as current endpoints)
      const service = new Prisma.Decimal(0);
      const tax = new Prisma.Decimal(0);

      const newTotal = subtotal.sub(discount).add(service).add(tax);

      await tx.order.update({
        where: { id: target.id },
        data: {
          subtotalAmount: d2(subtotal),
          discountAmount: d2(discount),
          serviceChargeAmount: d2(service),
          taxAmount: d2(tax),
          totalAmount: d2(newTotal),
        },
        select: { id: true },
      });

      // Void source order
      await tx.order.update({
        where: { id: source.id },
        data: {
          status: OrderStatus.VOIDED,
          closedAt: new Date(),
          closedByUserId: auth.userId,
          // keep tableId as-is for history; table will be freed below if it still points to it
        },
        select: { id: true },
      });

      // Free source table if it is still bound to source order as active
      if (source.tableId) {
        const table = await tx.table.findFirst({
          where: { id: source.tableId, locationId: auth.locationId, isActive: true },
          select: { id: true, activeOrderId: true, status: true },
        });

        if (table && table.activeOrderId === source.id) {
          await tx.table.update({
            where: { id: table.id },
            data: { status: "AVAILABLE", activeOrderId: null },
            select: { id: true },
          });
        }
      }

      return {
        ok: true as const,
        targetOrderId: target.id,
        sourceOrderId: source.id,
        movedItemsCount: movedItems.count,
        newTotals: {
          subtotalAmount: d2(subtotal).toString(),
          discountAmount: d2(discount).toString(),
          serviceChargeAmount: d2(service).toString(),
          taxAmount: d2(tax).toString(),
          totalAmount: d2(newTotal).toString(),
        },
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
