import { NextResponse } from "next/server";
import { Prisma, KitchenTicketStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);

    const url = new URL(req.url);

    const kdsStationId = parsePositiveInt(url.searchParams.get("kdsStationId"));
    const statusRaw = (url.searchParams.get("status") ?? "OPEN").toUpperCase();
    const includePaid = url.searchParams.get("includePaid") === "1";

    const status: KitchenTicketStatus =
      statusRaw === "OPEN" || statusRaw === "COMPLETED" || statusRaw === "CANCELLED"
        ? (statusRaw as KitchenTicketStatus)
        : "OPEN";

    const limitRaw = parsePositiveInt(url.searchParams.get("limit"));
    const cursorRaw = parsePositiveInt(url.searchParams.get("cursor"));
    const limit = clamp(limitRaw ?? 30, 1, 100);
    const cursor = cursorRaw ?? undefined;

    const where: Prisma.KitchenTicketWhereInput = {
      locationId: auth.locationId,
      status,
      ...(kdsStationId ? { kdsStationId } : {}),
      ...(includePaid
        ? {}
        : {
            order: {
              status: { notIn: ["PAID", "VOIDED"] },
            },
          }),
    };

    const rows = await prisma.kitchenTicket.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        status: true,
        createdAt: true,
        locationId: true,
        orderId: true,
        tableId: true,
        kdsStationId: true,
        terminalId: true,
        createdByUserId: true,

        table: { select: { id: true, name: true } },
        kdsStation: { select: { id: true, name: true } },

        order: {
          select: {
            id: true,
            status: true,
            orderType: true,
            openedAt: true,
            note: true,
            totalAmount: true,
          },
        },

        items: {
          orderBy: [{ id: "asc" }],
          select: {
            id: true,
            orderItemId: true,
            quantity: true,
            createdAt: true,
            orderItem: {
              select: {
                id: true,
                seatNumber: true,
                kdsStatus: true,
                updatedAt: true,
                comment: true,
                finalPrice: true,
                menuItem: { select: { id: true, name: true, sku: true } },
                modifiers: {
                  orderBy: [{ id: "asc" }],
                  select: {
                    id: true,
                    priceDelta: true,
                    modifierOption: {
                      select: {
                        id: true,
                        name: true,
                        modifierGroup: { select: { id: true, name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const hasMore = rows.length > limit;
    const list = (hasMore ? rows.slice(0, limit) : rows).map((t) => ({
      id: t.id,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      orderId: t.orderId,
      tableId: t.tableId,
      kdsStationId: t.kdsStationId,
      terminalId: t.terminalId,
      createdByUserId: t.createdByUserId,
      table: t.table,
      kdsStation: t.kdsStation,
      order: {
        id: t.order.id,
        status: t.order.status,
        orderType: t.order.orderType,
        openedAt: t.order.openedAt.toISOString(),
        note: t.order.note,
        totalAmount: d2(t.order.totalAmount).toString(),
      },
      items: t.items.map((ti) => ({
        ticketItemId: ti.id,
        orderItemId: ti.orderItemId,
        quantity: ti.quantity,
        createdAt: ti.createdAt.toISOString(),
        orderItem: {
          id: ti.orderItem.id,
          seatNumber: ti.orderItem.seatNumber,
          kdsStatus: ti.orderItem.kdsStatus,
          updatedAt: ti.orderItem.updatedAt.toISOString(),
          comment: ti.orderItem.comment,
          finalPrice: d2(ti.orderItem.finalPrice).toString(),
          menuItem: ti.orderItem.menuItem,
          modifiers: ti.orderItem.modifiers.map((m) => ({
            id: m.id,
            priceDelta: m.priceDelta ? d2(m.priceDelta).toString() : null,
            option: {
              id: m.modifierOption.id,
              name: m.modifierOption.name,
              group: m.modifierOption.modifierGroup,
            },
          })),
        },
      })),
    }));

    const nextCursor = hasMore ? list[list.length - 1]?.id ?? null : null;

    return NextResponse.json(
      { ok: true as const, tickets: list, page: { limit, nextCursor } },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
