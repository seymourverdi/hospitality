import { NextResponse } from "next/server";
import { Prisma, OrderStatus, OrderType } from "@prisma/client";
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

type Body = {
  orderType?: OrderType;
};

type OkResponse = {
  ok: true;
  reused: boolean;
  order: {
    id: number;
    tableId: number;
    status: OrderStatus;
    orderType: OrderType;
  };
};

type ErrResponse = { error: string };

function d2(x: Prisma.Decimal): Prisma.Decimal {
  return x.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const tableId = parsePositiveInt(idParam);
    if (!tableId) {
      return NextResponse.json<ErrResponse>({ error: "Invalid table id" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const orderType: OrderType = body.orderType ?? "DINE_IN";

    const result = await prisma.$transaction(async (tx) => {
      const table = await tx.table.findFirst({
        where: { id: tableId, locationId: auth.locationId, isActive: true },
        select: { id: true, status: true, activeOrderId: true },
      });

      if (!table) {
        return { ok: false as const, status: 404, message: "Table not found" };
      }

      if (table.activeOrderId) {
        const existing = await tx.order.findFirst({
          where: { id: table.activeOrderId, locationId: auth.locationId },
          select: { id: true, tableId: true, status: true, orderType: true },
        });

        if (!existing || !existing.tableId) {
          await tx.table.update({
            where: { id: table.id },
            data: { activeOrderId: null, status: "AVAILABLE" },
            select: { id: true },
          });
          return { ok: false as const, status: 409, message: "Table had invalid active order" };
        }

        return {
          ok: true as const,
          reused: true as const,
          order: {
            id: existing.id,
            tableId: existing.tableId,
            status: existing.status,
            orderType: existing.orderType,
          },
        };
      }

      const shift = await tx.shift.findFirst({
        where: {
          locationId: auth.locationId,
          terminalId: auth.terminalId,
          status: "OPEN",
        },
        select: { id: true },
      });

      if (!shift) {
        return { ok: false as const, status: 409, message: "No OPEN shift for this terminal" };
      }

      const order = await tx.order.create({
        data: {
          locationId: auth.locationId,
          terminalId: auth.terminalId,
          shiftId: shift.id,
          tableId: table.id,
          orderType,
          status: OrderStatus.OPEN,
          subtotalAmount: d2(new Prisma.Decimal(0)),
          discountAmount: d2(new Prisma.Decimal(0)),
          serviceChargeAmount: d2(new Prisma.Decimal(0)),
          taxAmount: d2(new Prisma.Decimal(0)),
          totalAmount: d2(new Prisma.Decimal(0)),
          openedByUserId: auth.userId,
          openedAt: new Date(),
        },
        select: { id: true, tableId: true, status: true, orderType: true },
      });

      await tx.table.update({
        where: { id: table.id },
        data: {
          status: "BUSY",
          activeOrderId: order.id,
        },
        select: { id: true },
      });

      return {
        ok: true as const,
        reused: false as const,
        order: {
          id: order.id,
          tableId: order.tableId!,
          status: order.status,
          orderType: order.orderType,
        },
      };
    });

    if (!result.ok) {
      return NextResponse.json<ErrResponse>({ error: result.message }, { status: result.status });
    }

    return NextResponse.json<OkResponse>(
      { ok: true, reused: result.reused, order: result.order },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json<ErrResponse>({ error: message }, { status });
  }
}