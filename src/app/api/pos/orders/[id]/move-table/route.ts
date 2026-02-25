import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Body = {
  toTableId: number;
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

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const orderId = parsePositiveInt(idParam);
    if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

    const body = (await req.json().catch(() => null)) as Body | null;
    const toTableId = toPositiveInt(body?.toTableId);
    if (!toTableId) return NextResponse.json({ error: "toTableId is required" }, { status: 400 });

    if (toTableId === Number(orderId)) {
      // This check is meaningless logically (tableId != orderId), but keep it simple and safe:
      // We will also guard same-table below by comparing actual table ids.
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: { id: true, status: true, tableId: true },
      });

      if (!order) return { ok: false as const, status: 404, message: "Order not found" };
      if (order.status === OrderStatus.PAID) return { ok: false as const, status: 409, message: "Order is paid" };
      if (order.status === OrderStatus.VOIDED) return { ok: false as const, status: 409, message: "Order is voided" };

      if (!order.tableId) {
        return { ok: false as const, status: 409, message: "Order has no table assigned" };
      }

      if (order.tableId === toTableId) {
        return {
          ok: true as const,
          moved: false,
          fromTableId: order.tableId,
          toTableId: order.tableId,
          orderId: order.id,
        };
      }

      const fromTable = await tx.table.findFirst({
        where: { id: order.tableId, locationId: auth.locationId, isActive: true },
        select: { id: true, activeOrderId: true, status: true },
      });

      if (!fromTable) return { ok: false as const, status: 409, message: "Current table not found" };
      if (fromTable.activeOrderId !== order.id) {
        return { ok: false as const, status: 409, message: "Order is not active for current table" };
      }

      const toTable = await tx.table.findFirst({
        where: { id: toTableId, locationId: auth.locationId, isActive: true },
        select: { id: true, activeOrderId: true, status: true },
      });

      if (!toTable) return { ok: false as const, status: 404, message: "Target table not found" };
      if (toTable.activeOrderId) {
        return { ok: false as const, status: 409, message: "Target table already has an active order" };
      }

      // Update order first
      await tx.order.update({
        where: { id: order.id },
        data: { tableId: toTable.id },
        select: { id: true },
      });

      // Free old table
      await tx.table.update({
        where: { id: fromTable.id },
        data: { status: "AVAILABLE", activeOrderId: null },
        select: { id: true },
      });

      // Occupy new table
      await tx.table.update({
        where: { id: toTable.id },
        data: { status: "BUSY", activeOrderId: order.id },
        select: { id: true },
      });

      return {
        ok: true as const,
        moved: true,
        orderId: order.id,
        fromTableId: fromTable.id,
        toTableId: toTable.id,
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
