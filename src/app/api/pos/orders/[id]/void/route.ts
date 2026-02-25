import { NextResponse } from "next/server";
import { OrderStatus, KitchenTicketStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parsePositiveInt(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const orderId = parsePositiveInt(idParam);
    if (!orderId) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: {
          id: true,
          status: true,
          tableId: true,
        },
      });

      if (!order) {
        return { ok: false as const, status: 404, message: "Order not found" };
      }

      if (order.status === OrderStatus.PAID) {
        return { ok: false as const, status: 409, message: "Paid order cannot be voided" };
      }

      if (order.status === OrderStatus.VOIDED) {
        return { ok: true as const, alreadyVoided: true };
      }

      // 1) Cancel all OPEN kitchen tickets for this order
      await tx.kitchenTicket.updateMany({
        where: {
          orderId: order.id,
          status: KitchenTicketStatus.OPEN,
        },
        data: {
          status: KitchenTicketStatus.CANCELLED,
        },
      });

      // 2) Void the order
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.VOIDED,
          closedAt: new Date(),
          closedByUserId: auth.userId,
        },
        select: { id: true },
      });

      // 3) Free the table
      if (order.tableId) {
        await tx.table.update({
          where: { id: order.tableId },
          data: {
            status: "AVAILABLE",
            activeOrderId: null,
          },
          select: { id: true },
        });
      }

      return { ok: true as const };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(
      {
        ok: true as const,
        ...(result.alreadyVoided ? { alreadyVoided: true } : {}),
      },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
