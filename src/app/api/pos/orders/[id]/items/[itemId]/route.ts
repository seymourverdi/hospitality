import { NextResponse } from "next/server";
import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = {
  params: Promise<{ id: string; itemId: string }>;
};

type PatchBody = {
  quantity?: number | string;
  seatNumber?: number | string | null;
  comment?: string | null;
  modifierOptionIds?: Array<number | string>;
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

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

async function recalcOrderTotals(tx: Prisma.TransactionClient, orderId: number) {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: {
      quantity: true,
      basePrice: true,
      discountAmount: true,
      finalPrice: true,
      menuItem: { select: { taxRate: true } },
      modifiers: { select: { priceDelta: true } },
    },
  });

  let subtotal = new Prisma.Decimal(0);
  let discount = new Prisma.Decimal(0);
  let tax = new Prisma.Decimal(0);

  for (const it of items) {
    const qty = new Prisma.Decimal(it.quantity);

    let modsSum = new Prisma.Decimal(0);
    for (const m of it.modifiers) {
      if (m.priceDelta) modsSum = modsSum.add(m.priceDelta);
    }

    const unitBase = it.basePrice.add(modsSum);
    subtotal = subtotal.add(unitBase.mul(qty));

    discount = discount.add(it.discountAmount.mul(qty));

    const taxRate = it.menuItem.taxRate;
    if (taxRate) {
      tax = tax.add(it.finalPrice.mul(qty).mul(taxRate).div(100));
    }
  }

  const serviceCharge = new Prisma.Decimal(0);
  const total = subtotal.sub(discount).add(serviceCharge).add(tax);

  await tx.order.update({
    where: { id: orderId },
    data: {
      subtotalAmount: d2(subtotal),
      discountAmount: d2(discount),
      serviceChargeAmount: d2(serviceCharge),
      taxAmount: d2(tax),
      totalAmount: d2(total),
    },
    select: { id: true },
  });

  return {
    subtotalAmount: d2(subtotal).toString(),
    discountAmount: d2(discount).toString(),
    serviceChargeAmount: d2(serviceCharge).toString(),
    taxAmount: d2(tax).toString(),
    totalAmount: d2(total).toString(),
  };
}

type UpdatedItem = {
  id: number;
  menuItemId: number;
  seatNumber: number | null;
  quantity: number;
  basePrice: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  finalPrice: Prisma.Decimal;
  comment: string | null;
  kdsStatus: string;
  createdAt: Date;
  updatedAt: Date;
  menuItem: {
    id: number;
    name: string;
    sku: string | null;
    basePrice: Prisma.Decimal;
    taxRate: Prisma.Decimal | null;
    category: { id: number; name: string };
  };
  modifiers: Array<{
    id: number;
    modifierOptionId: number;
    priceDelta: Prisma.Decimal | null;
    modifierOption: {
      id: number;
      name: string;
      modifierGroup: { id: number; name: string };
    };
  }>;
};

type PatchTxOk = { ok: true; item: UpdatedItem; totals: Awaited<ReturnType<typeof recalcOrderTotals>> };
type PatchTxFail = { ok: false; status: number; message: string };

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam, itemId: itemIdParam } = await ctx.params;
    const orderId = parsePositiveInt(idParam);
    const itemId = parsePositiveInt(itemIdParam);

    if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    if (!itemId) return NextResponse.json({ error: "Invalid item id" }, { status: 400 });

    let body: PatchBody;
    try {
      body = (await req.json()) as PatchBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    let quantity: number | undefined;
    if (body.quantity !== undefined) {
      const q = parsePositiveInt(body.quantity);
      if (!q) return NextResponse.json({ error: "quantity must be a positive integer" }, { status: 400 });
      quantity = q;
    }

    let seatNumber: number | null | undefined;
    if (body.seatNumber !== undefined) {
      if (body.seatNumber === null) {
        seatNumber = null;
      } else {
        const s = parsePositiveInt(body.seatNumber);
        if (!s) return NextResponse.json({ error: "seatNumber must be a positive integer" }, { status: 400 });
        seatNumber = s;
      }
    }

    let comment: string | null | undefined;
    if (body.comment !== undefined) {
      comment = typeof body.comment === "string" ? body.comment.trim() : null;
      if (comment === "") comment = null;
    }

    let modifierOptionIds: number[] | undefined;
    if (body.modifierOptionIds !== undefined) {
      if (!Array.isArray(body.modifierOptionIds)) {
        return NextResponse.json({ error: "modifierOptionIds must be an array" }, { status: 400 });
      }

      const ids: number[] = [];
      for (const v of body.modifierOptionIds) {
        const id = parsePositiveInt(v);
        if (!id) return NextResponse.json({ error: "modifierOptionIds must contain positive integers" }, { status: 400 });
        ids.push(id);
      }
      modifierOptionIds = ids;
    }

    const result = await prisma.$transaction<PatchTxOk | PatchTxFail>(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: { id: true, status: true },
      });

      if (!order) return { ok: false, status: 404, message: "Order not found" };
      if (order.status === OrderStatus.VOIDED) return { ok: false, status: 409, message: "Order is voided" };
      if (order.status === OrderStatus.PAID) return { ok: false, status: 409, message: "Order is paid" };

      const existing = await tx.orderItem.findFirst({
        where: { id: itemId, orderId: order.id },
        select: {
          id: true,
          menuItemId: true,
          basePrice: true,
          discountAmount: true,
        },
      });

      if (!existing) return { ok: false, status: 404, message: "Order item not found" };

      let newFinalPrice: Prisma.Decimal | undefined;

      if (modifierOptionIds !== undefined) {
        const allowedGroups = await tx.menuItemModifierGroup.findMany({
          where: { menuItemId: existing.menuItemId },
          select: { modifierGroupId: true },
        });
        const allowedGroupIds = new Set<number>(allowedGroups.map((g) => g.modifierGroupId));

        const opts =
          modifierOptionIds.length > 0
            ? await tx.modifierOption.findMany({
                where: { id: { in: modifierOptionIds }, isActive: true },
                select: { id: true, modifierGroupId: true, priceDelta: true },
              })
            : [];

        if (opts.length !== modifierOptionIds.length) {
          return { ok: false, status: 400, message: "Some modifier options not found" };
        }

        for (const opt of opts) {
          if (!allowedGroupIds.has(opt.modifierGroupId)) {
            return { ok: false, status: 400, message: "Modifier option is not allowed for this menu item" };
          }
        }

        await tx.orderItemModifier.deleteMany({ where: { orderItemId: existing.id } });

        if (opts.length > 0) {
          await tx.orderItemModifier.createMany({
            data: opts.map((opt) => ({
              orderItemId: existing.id,
              modifierOptionId: opt.id,
              priceDelta: opt.priceDelta ? d2(opt.priceDelta) : null,
            })),
          });
        }

        let modsSum = new Prisma.Decimal(0);
        for (const opt of opts) {
          if (opt.priceDelta) modsSum = modsSum.add(opt.priceDelta);
        }

        newFinalPrice = existing.basePrice.add(modsSum).sub(existing.discountAmount);
      }

      const updated = await tx.orderItem.update({
        where: { id: existing.id },
        data: {
          quantity,
          seatNumber,
          comment,
          finalPrice: newFinalPrice ? d2(newFinalPrice) : undefined,
        },
        select: {
          id: true,
          menuItemId: true,
          seatNumber: true,
          quantity: true,
          basePrice: true,
          discountAmount: true,
          finalPrice: true,
          comment: true,
          kdsStatus: true,
          createdAt: true,
          updatedAt: true,
          menuItem: {
            select: {
              id: true,
              name: true,
              sku: true,
              basePrice: true,
              taxRate: true,
              category: { select: { id: true, name: true } },
            },
          },
          modifiers: {
            orderBy: [{ id: "asc" }],
            select: {
              id: true,
              modifierOptionId: true,
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
      });

      const totals = await recalcOrderTotals(tx, order.id);

      return { ok: true, item: updated as unknown as UpdatedItem, totals };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    const item = result.item;

    return NextResponse.json(
      {
        ok: true as const,
        item: {
          id: item.id,
          menuItemId: item.menuItemId,
          seatNumber: item.seatNumber,
          quantity: item.quantity,
          basePrice: d2(item.basePrice).toString(),
          discountAmount: d2(item.discountAmount).toString(),
          finalPrice: d2(item.finalPrice).toString(),
          comment: item.comment,
          kdsStatus: item.kdsStatus,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            sku: item.menuItem.sku,
            basePrice: d2(item.menuItem.basePrice).toString(),
            taxRate: item.menuItem.taxRate ? d2(item.menuItem.taxRate).toString() : null,
            category: item.menuItem.category,
          },
          modifiers: item.modifiers.map((m) => ({
            id: m.id,
            modifierOptionId: m.modifierOptionId,
            priceDelta: m.priceDelta ? d2(m.priceDelta).toString() : null,
            option: {
              id: m.modifierOption.id,
              name: m.modifierOption.name,
              group: m.modifierOption.modifierGroup,
            },
          })),
        },
        totals: result.totals,
      },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

type DeleteTxOk = { ok: true; totals: Awaited<ReturnType<typeof recalcOrderTotals>> };
type DeleteTxFail = { ok: false; status: number; message: string };

export async function DELETE(_req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(_req);

    const { id: idParam, itemId: itemIdParam } = await ctx.params;
    const orderId = parsePositiveInt(idParam);
    const itemId = parsePositiveInt(itemIdParam);

    if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    if (!itemId) return NextResponse.json({ error: "Invalid item id" }, { status: 400 });

    const result = await prisma.$transaction<DeleteTxOk | DeleteTxFail>(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: { id: true, status: true },
      });

      if (!order) return { ok: false, status: 404, message: "Order not found" };
      if (order.status === OrderStatus.VOIDED) return { ok: false, status: 409, message: "Order is voided" };
      if (order.status === OrderStatus.PAID) return { ok: false, status: 409, message: "Order is paid" };

      const existing = await tx.orderItem.findFirst({
        where: { id: itemId, orderId: order.id },
        select: { id: true },
      });

      if (!existing) return { ok: false, status: 404, message: "Order item not found" };

      await tx.orderItemModifier.deleteMany({ where: { orderItemId: existing.id } });
      await tx.orderItem.delete({ where: { id: existing.id } });

      const totals = await recalcOrderTotals(tx, order.id);
      return { ok: true, totals };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ ok: true as const, totals: result.totals }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
