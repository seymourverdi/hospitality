import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string; itemId: string }>;
};

type Body = {
  reason?: string | null;
};

function parsePositiveInt(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

async function recalcOrderTotals(tx: Prisma.TransactionClient, orderId: number) {
  const agg = await tx.orderItem.aggregate({
    where: { orderId, status: "ACTIVE" },
    _sum: { finalPrice: true, discountAmount: true },
  });

  const subtotal = agg._sum.finalPrice ?? new Prisma.Decimal(0);
  const discount = agg._sum.discountAmount ?? new Prisma.Decimal(0);
  const service = new Prisma.Decimal(0);
  const tax = new Prisma.Decimal(0);
  const total = subtotal.sub(discount).add(service).add(tax);

  await tx.order.update({
    where: { id: orderId },
    data: {
      subtotalAmount: d2(subtotal),
      discountAmount: d2(discount),
      serviceChargeAmount: d2(service),
      taxAmount: d2(tax),
      totalAmount: d2(total),
    },
    select: { id: true },
  });

  return {
    subtotalAmount: d2(subtotal).toString(),
    discountAmount: d2(discount).toString(),
    serviceChargeAmount: d2(service).toString(),
    taxAmount: d2(tax).toString(),
    totalAmount: d2(total).toString(),
  };
}

type KdsCleanup = {
  removedTicketItem: boolean;
  affectedTicketId: number | null;
  cancelledTicket: boolean;
};

async function cleanupKdsForOrderItem(
  tx: Prisma.TransactionClient,
  locationId: number,
  orderItemId: number
): Promise<KdsCleanup> {
  const row = await tx.kitchenTicketItem.findFirst({
    where: { orderItemId },
    select: { ticketId: true },
  });

  if (!row) {
    return { removedTicketItem: false, affectedTicketId: null, cancelledTicket: false };
  }

  // Idempotent delete: even if already deleted by another request, deleteMany is safe.
  await tx.kitchenTicketItem.deleteMany({
    where: { orderItemId },
  });

  const affectedTicketId = row.ticketId;

  const remaining = await tx.kitchenTicketItem.count({
    where: { ticketId: affectedTicketId },
  });

  if (remaining > 0) {
    return { removedTicketItem: true, affectedTicketId, cancelledTicket: false };
  }

  const ticket = await tx.kitchenTicket.findFirst({
    where: { id: affectedTicketId, locationId },
    select: { id: true, status: true },
  });

  if (!ticket) {
    return { removedTicketItem: true, affectedTicketId, cancelledTicket: false };
  }

  if (ticket.status === "OPEN") {
    await tx.kitchenTicket.update({
      where: { id: ticket.id },
      data: { status: "CANCELLED" },
      select: { id: true },
    });
    return { removedTicketItem: true, affectedTicketId, cancelledTicket: true };
  }

  return { removedTicketItem: true, affectedTicketId, cancelledTicket: false };
}

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam, itemId: itemIdParam } = await ctx.params;
    const orderId = parsePositiveInt(idParam);
    const orderItemId = parsePositiveInt(itemIdParam);

    if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    if (!orderItemId) return NextResponse.json({ error: "Invalid orderItemId" }, { status: 400 });

    const body = (await req.json().catch(() => null)) as Body | null;
    const reason = typeof body?.reason === "string" ? body.reason.trim() : null;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: { id: true, status: true },
      });

      if (!order) return { ok: false as const, status: 404, message: "Order not found" };
      if (order.status === "VOIDED") return { ok: false as const, status: 409, message: "Order is voided" };
      if (order.status === "PAID") return { ok: false as const, status: 409, message: "Order is paid" };

      const item = await tx.orderItem.findFirst({
        where: { id: orderItemId, orderId },
        select: {
          id: true,
          status: true,
          quantity: true,
          basePrice: true,
          discountAmount: true,
          finalPrice: true,
          kdsStatus: true,
          voidedAt: true,
          voidedByUserId: true,
          voidReason: true,
          createdAt: true,
          updatedAt: true,
          menuItemId: true,
          seatNumber: true,
          comment: true,
        },
      });

      if (!item) return { ok: false as const, status: 404, message: "Order item not found" };

      // Always try to cleanup KDS link (safe + removes ghosts)
      const kdsCleanup = await cleanupKdsForOrderItem(tx, auth.locationId, item.id);

      if (item.status === "VOID") {
        const totals = await recalcOrderTotals(tx, orderId);
        return { ok: true as const, alreadyVoided: true, item, totals, kdsCleanup };
      }

      const updated = await tx.orderItem.update({
        where: { id: item.id },
        data: {
          status: "VOID",
          voidedAt: new Date(),
          voidedByUserId: auth.userId,
          voidReason: reason || null,
        },
        select: {
          id: true,
          status: true,
          voidedAt: true,
          voidedByUserId: true,
          voidReason: true,
          kdsStatus: true,
          menuItemId: true,
          seatNumber: true,
          quantity: true,
          basePrice: true,
          discountAmount: true,
          finalPrice: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const totals = await recalcOrderTotals(tx, orderId);

      return { ok: true as const, alreadyVoided: false, item: updated, totals, kdsCleanup };
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
