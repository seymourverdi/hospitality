import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

function parseId(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const ticketId = parseId(idParam);

    if (!ticketId) {
      return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.kitchenTicket.findFirst({
        where: { id: ticketId, locationId: auth.locationId },
        select: { id: true, status: true },
      });

      if (!ticket) return { ok: false as const, status: 404, message: "Ticket not found" };

      if (ticket.status !== "OPEN") {
        return { ok: true as const, updated: false, bumpedItems: 0 };
      }

      const ticketItems = await tx.kitchenTicketItem.findMany({
        where: { ticketId: ticket.id },
        select: { orderItemId: true },
      });

      const orderItemIds = ticketItems.map((x) => x.orderItemId);

      let bumpedItems = 0;

      if (orderItemIds.length > 0) {
        const upd = await tx.orderItem.updateMany({
          where: {
            id: { in: orderItemIds },
            status: "ACTIVE",
            kdsStatus: { in: ["PENDING", "IN_PROGRESS", "READY"] },
          },
          data: { kdsStatus: "SERVED" },
        });

        bumpedItems = upd.count;
      }

      await tx.kitchenTicket.update({
        where: { id: ticket.id },
        data: { status: "COMPLETED" },
        select: { id: true },
      });

      return { ok: true as const, updated: true, bumpedItems };
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
