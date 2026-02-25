import { NextResponse } from "next/server";
import { OrderStatus, KitchenTicketStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Body = {
  kdsStationId?: number | string | null;
  tableId?: number | string | null;
};

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value <= 0) return null;
    return value;
  }
  if (typeof value === "string") {
    const n = Number(value.trim());
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
  }
  return null;
}

function parsePositiveIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return parsePositiveInt(value);
}

type SentItem = { orderItemId: number; quantity: number; kdsStationId: number | null };
type TicketOut = {
  id: number;
  locationId: number;
  orderId: number;
  tableId: number | null;
  kdsStationId: number | null;
  terminalId: number;
  createdByUserId: number;
  status: KitchenTicketStatus;
  createdAt: string;
  sent: SentItem[];
};

type TxFail = { ok: false; status: number; message: string };
type TxOk = {
  ok: true;
  tickets: TicketOut[];
  skippedAlreadySentCount: number;
  totalSentCount: number;
};

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const orderId = parsePositiveInt(idParam);
    if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

    let body: Body = {};
    const hasJson = req.headers.get("content-type")?.includes("application/json") ?? false;
    if (hasJson) {
      try {
        body = (await req.json()) as Body;
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
    }

    const tableIdOverride = body.tableId === undefined ? undefined : parsePositiveIntOrNull(body.tableId);
    if (body.tableId !== undefined && body.tableId !== null && tableIdOverride === null) {
      return NextResponse.json({ error: "tableId must be a positive integer or null" }, { status: 400 });
    }

    const kdsStationOverride = body.kdsStationId === undefined ? undefined : parsePositiveIntOrNull(body.kdsStationId);
    if (body.kdsStationId !== undefined && body.kdsStationId !== null && kdsStationOverride === null) {
      return NextResponse.json({ error: "kdsStationId must be a positive integer or null" }, { status: 400 });
    }

    const result = await prisma.$transaction<TxOk | TxFail>(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: {
          id: true,
          status: true,
          tableId: true,
          terminalId: true,
          locationId: true,
        },
      });

      if (!order) return { ok: false, status: 404, message: "Order not found" };
      if (order.status === OrderStatus.VOIDED) return { ok: false, status: 409, message: "Order is voided" };
      if (order.status === OrderStatus.PAID) return { ok: false, status: 409, message: "Order is paid" };

      const finalTableId = tableIdOverride !== undefined ? tableIdOverride : order.tableId;

      if (finalTableId) {
        const table = await tx.table.findFirst({
          where: { id: finalTableId, locationId: auth.locationId, isActive: true },
          select: { id: true },
        });
        if (!table) return { ok: false, status: 404, message: "Table not found" };
      }

      if (kdsStationOverride !== undefined && kdsStationOverride !== null) {
        const station = await tx.kDSStation.findFirst({
          where: { id: kdsStationOverride, locationId: auth.locationId, isActive: true },
          select: { id: true },
        });
        if (!station) return { ok: false, status: 404, message: "KDS station not found" };
      }

      // FIX #1: Load only ACTIVE items
      const items = await tx.orderItem.findMany({
        where: { orderId: order.id, status: "ACTIVE" },
        orderBy: [{ id: "asc" }],
        select: {
          id: true,
          quantity: true,
          menuItem: { select: { kdsStationId: true } },
        },
      });

      if (items.length === 0) return { ok: false, status: 409, message: "No ACTIVE items to send" };

      const sentRows = await tx.kitchenTicketItem.findMany({
        where: { orderItemId: { in: items.map((i) => i.id) } },
        select: { orderItemId: true },
      });
      const alreadySent = new Set<number>(sentRows.map((r) => r.orderItemId));

      const toSend = items.filter((i) => !alreadySent.has(i.id));
      const skippedAlreadySentCount = items.length - toSend.length;

      if (toSend.length === 0) {
        return { ok: false, status: 409, message: "All ACTIVE items already sent to kitchen" };
      }

      const groups = new Map<string, { stationId: number | null; items: SentItem[] }>();

      for (const it of toSend) {
        const stationId = kdsStationOverride !== undefined ? kdsStationOverride : it.menuItem.kdsStationId ?? null;
        const key = stationId === null ? "null" : String(stationId);

        const entry = groups.get(key) ?? { stationId, items: [] };
        entry.items.push({ orderItemId: it.id, quantity: it.quantity, kdsStationId: stationId });
        groups.set(key, entry);
      }

      const stationIds = Array.from(groups.values())
        .map((g) => g.stationId)
        .filter((v): v is number => typeof v === "number");

      if (stationIds.length > 0) {
        const found = await tx.kDSStation.findMany({
          where: { id: { in: stationIds }, locationId: auth.locationId, isActive: true },
          select: { id: true },
        });
        const foundSet = new Set(found.map((s) => s.id));
        const missing = stationIds.find((id) => !foundSet.has(id));
        if (missing) return { ok: false, status: 404, message: "KDS station not found" };
      }

      const ticketsOut: TicketOut[] = [];
      let totalSentCount = 0;

      for (const g of groups.values()) {
        const ticket = await tx.kitchenTicket.create({
          data: {
            locationId: auth.locationId,
            orderId: order.id,
            tableId: finalTableId ?? null,
            kdsStationId: g.stationId,
            terminalId: auth.terminalId,
            createdByUserId: auth.userId,
            status: KitchenTicketStatus.OPEN,
          },
          select: {
            id: true,
            locationId: true,
            orderId: true,
            tableId: true,
            kdsStationId: true,
            terminalId: true,
            createdByUserId: true,
            status: true,
            createdAt: true,
          },
        });

        await tx.kitchenTicketItem.createMany({
          data: g.items.map((i) => ({
            ticketId: ticket.id,
            orderItemId: i.orderItemId,
            quantity: i.quantity,
          })),
        });

        totalSentCount += g.items.length;

        ticketsOut.push({
          id: ticket.id,
          locationId: ticket.locationId,
          orderId: ticket.orderId,
          tableId: ticket.tableId,
          kdsStationId: ticket.kdsStationId,
          terminalId: ticket.terminalId,
          createdByUserId: ticket.createdByUserId,
          status: ticket.status,
          createdAt: ticket.createdAt.toISOString(),
          sent: g.items,
        });
      }

      if (order.status !== OrderStatus.PARTIALLY_PAID) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.SENT_TO_KITCHEN },
          select: { id: true },
        });
      }

      return {
        ok: true,
        tickets: ticketsOut,
        skippedAlreadySentCount,
        totalSentCount,
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
