import { NextResponse } from "next/server";
import { KdsStatus, KitchenTicketStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Body = {
  status: KitchenTicketStatus; // OPEN | COMPLETED | CANCELLED
};

function parsePositiveInt(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const ticketId = parsePositiveInt(idParam);
    if (!ticketId) return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const target = body.status;
    const allowed: KitchenTicketStatus[] = ["OPEN", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(target)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.kitchenTicket.findFirst({
        where: { id: ticketId, locationId: auth.locationId },
        select: {
          id: true,
          status: true,
          items: { select: { orderItemId: true } },
        },
      });

      if (!ticket) return { ok: false as const, status: 404, message: "Ticket not found" };
      if (ticket.status !== "OPEN") {
        return { ok: false as const, status: 409, message: "Ticket is not OPEN" };
      }

      if (target === "OPEN") {
        return { ok: true as const, ticketId: ticket.id, status: ticket.status };
      }

      if (target === "CANCELLED") {
        const updated = await tx.kitchenTicket.update({
          where: { id: ticket.id },
          data: { status: "CANCELLED" },
          select: { id: true, status: true },
        });

        return { ok: true as const, ticketId: updated.id, status: updated.status };
      }

      // COMPLETED
      const orderItemIds = ticket.items.map((i) => i.orderItemId);

      let servedCount = 0;

      if (orderItemIds.length > 0) {
        const upd = await tx.orderItem.updateMany({
          where: {
            id: { in: orderItemIds },
            status: "ACTIVE",
          },
          data: { kdsStatus: "SERVED" as KdsStatus },
        });

        servedCount = upd.count;
      }

      const updated = await tx.kitchenTicket.update({
        where: { id: ticket.id },
        data: { status: "COMPLETED" },
        select: { id: true, status: true },
      });

      return {
        ok: true as const,
        ticketId: updated.id,
        status: updated.status,
        servedCount,
      };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(
      {
        ok: true,
        ticketId: result.ticketId,
        status: result.status,
        servedCount: result.servedCount,
      },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
