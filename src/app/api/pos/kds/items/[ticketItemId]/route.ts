import { NextResponse } from "next/server";
import { KdsStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = {
  params: Promise<{ ticketItemId: string }>;
};

type Body = {
  kdsStatus: KdsStatus;
};

function parsePositiveInt(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { ticketItemId: idParam } = await ctx.params;
    const ticketItemId = parsePositiveInt(idParam);
    if (!ticketItemId) {
      return NextResponse.json({ error: "Invalid ticketItemId" }, { status: 400 });
    }

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const nextStatus = body.kdsStatus;

    const allowed: KdsStatus[] = ["PENDING", "IN_PROGRESS", "READY", "SERVED"];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid kdsStatus" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const ti = await tx.kitchenTicketItem.findFirst({
        where: {
          id: ticketItemId,
          ticket: { locationId: auth.locationId },
        },
        select: {
          id: true,
          orderItemId: true,
          ticket: { select: { id: true, status: true } },
        },
      });

      if (!ti) return { ok: false as const, status: 404, message: "Ticket item not found" };
      if (ti.ticket.status !== "OPEN") return { ok: false as const, status: 409, message: "Ticket is not OPEN" };

      const updated = await tx.orderItem.update({
        where: { id: ti.orderItemId },
        data: { kdsStatus: nextStatus },
        select: { id: true, kdsStatus: true },
      });

      return { ok: true as const, ticketItemId: ti.id, orderItemId: ti.orderItemId, item: updated };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(
      { ok: true as const, ticketItemId: result.ticketItemId, orderItemId: result.orderItemId, kdsStatus: result.item.kdsStatus },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
