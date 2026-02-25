import { NextResponse } from "next/server";
import { Prisma, OrderStatus, OrderType, ShiftStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parsePositiveInt(value: string | null | undefined): number | null {
  if (!value) return null;
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function isOrderStatus(value: string): value is OrderStatus {
  return (Object.values(OrderStatus) as string[]).includes(value);
}

function isOrderType(value: string): value is OrderType {
  return (Object.values(OrderType) as string[]).includes(value);
}

type ItemCounts = {
  activeItems: number;
  voidedItems: number;
  totalItems: number;
};

type CreateBody = {
  tableId?: number;
  orderType?: OrderType | string;
};

function toDecimal0(): Prisma.Decimal {
  return new Prisma.Decimal(0);
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);

    const url = new URL(req.url);

    const limitRaw = parsePositiveInt(url.searchParams.get("limit"));
    const limit = Math.min(Math.max(limitRaw ?? 30, 1), 100);

    const cursorRaw = parsePositiveInt(url.searchParams.get("cursor"));

    const statusParam = url.searchParams.get("status")?.trim();
    const status: OrderStatus | null = statusParam && isOrderStatus(statusParam) ? statusParam : null;

    const tableId = parsePositiveInt(url.searchParams.get("tableId"));

    const where: Prisma.OrderWhereInput = {
      locationId: auth.locationId,
      ...(status ? { status } : {}),
      ...(tableId ? { tableId } : {}),
    };

    const rows = await prisma.order.findMany({
      where,
      orderBy: [{ id: "desc" }],
      take: limit + 1,
      ...(cursorRaw ? { cursor: { id: cursorRaw }, skip: 1 } : {}),
      select: {
        id: true,
        status: true,
        orderType: true,
        tableId: true,
        note: true,
        openedAt: true,
        closedAt: true,
        subtotalAmount: true,
        discountAmount: true,
        serviceChargeAmount: true,
        taxAmount: true,
        totalAmount: true,
        table: { select: { id: true, name: true } },
        _count: { select: { payments: true } },
      },
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? pageRows[pageRows.length - 1]?.id ?? null : null;

    const orderIds = pageRows.map((o) => o.id);
    const countsByOrderId = new Map<number, ItemCounts>();

    if (orderIds.length > 0) {
      const grouped = await prisma.orderItem.groupBy({
        by: ["orderId", "status"],
        where: { orderId: { in: orderIds } },
        _count: { _all: true },
      });

      for (const g of grouped) {
        const existing = countsByOrderId.get(g.orderId) ?? {
          activeItems: 0,
          voidedItems: 0,
          totalItems: 0,
        };

        const c = g._count._all;

        if (g.status === "ACTIVE") existing.activeItems += c;
        if (g.status === "VOID") existing.voidedItems += c;

        existing.totalItems = existing.activeItems + existing.voidedItems;
        countsByOrderId.set(g.orderId, existing);
      }

      for (const id of orderIds) {
        if (!countsByOrderId.has(id)) {
          countsByOrderId.set(id, { activeItems: 0, voidedItems: 0, totalItems: 0 });
        }
      }
    }

    const orders = pageRows.map((o) => {
      const itemCounts = countsByOrderId.get(o.id) ?? { activeItems: 0, voidedItems: 0, totalItems: 0 };

      return {
        id: o.id,
        status: o.status,
        orderType: o.orderType,
        tableId: o.tableId,
        table: o.table,
        note: o.note,
        openedAt: o.openedAt,
        closedAt: o.closedAt,
        totals: {
          subtotalAmount: String(o.subtotalAmount),
          discountAmount: String(o.discountAmount),
          serviceChargeAmount: String(o.serviceChargeAmount),
          taxAmount: String(o.taxAmount),
          totalAmount: String(o.totalAmount),
        },
        counts: {
          items: itemCounts.activeItems,
          activeItems: itemCounts.activeItems,
          voidedItems: itemCounts.voidedItems,
          totalItems: itemCounts.totalItems,
          payments: o._count.payments,
        },
      };
    });

    return NextResponse.json(
      {
        ok: true,
        orders,
        page: { limit, nextCursor },
      },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);

    const body = (await req.json().catch(() => ({}))) as CreateBody;

    const tableId = typeof body.tableId === "number" ? body.tableId : null;
    if (!tableId || tableId <= 0) {
      return NextResponse.json({ error: "tableId is required" }, { status: 400 });
    }

    const orderTypeRaw = typeof body.orderType === "string" ? body.orderType.trim() : body.orderType;
    const orderType: OrderType = orderTypeRaw && isOrderType(String(orderTypeRaw)) ? (orderTypeRaw as OrderType) : "DINE_IN";

    const table = await prisma.table.findFirst({
      where: { id: tableId, locationId: auth.locationId, isActive: true },
      select: { id: true, activeOrderId: true },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (table.activeOrderId) {
      return NextResponse.json(
        { ok: true, order: { id: table.activeOrderId, status: "OPEN", tableId: table.id }, reused: true },
        { status: 200 }
      );
    }

    const shift = await prisma.shift.findFirst({
      where: {
        locationId: auth.locationId,
        terminalId: auth.terminalId,
        userId: auth.userId,
        status: ShiftStatus.OPEN,
      },
      orderBy: { openedAt: "desc" },
      select: { id: true },
    });

    if (!shift) {
      return NextResponse.json(
        { error: "No OPEN shift for this user/terminal. Open a shift first." },
        { status: 409 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          locationId: auth.locationId,
          terminalId: auth.terminalId,
          shiftId: shift.id,
          tableId: table.id,
          orderType,
          status: OrderStatus.OPEN,
          openedAt: new Date(),
          openedByUserId: auth.userId,

          subtotalAmount: toDecimal0(),
          discountAmount: toDecimal0(),
          serviceChargeAmount: toDecimal0(),
          taxAmount: toDecimal0(),
          totalAmount: toDecimal0(),
        },
        select: { id: true, status: true, tableId: true },
      });

      await tx.table.update({
        where: { id: table.id },
        data: { activeOrderId: order.id, status: "BUSY" },
      });

      return order;
    });

    return NextResponse.json({ ok: true, order: created }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}