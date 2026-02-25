import { NextResponse } from "next/server";
import { Prisma, KdsStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AddItemBody = {
  menuItemId: number | string;
  quantity?: number | string;
  seatNumber?: number | string | null;
  comment?: string | null;
  modifierOptionIds?: Array<number | string>;
};

function parseId(value: unknown): number | null {
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

function parseIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = parseId(value);
  return n;
}

function parseQty(value: unknown, fallback = 1): number | null {
  if (value === undefined || value === null || value === "") return fallback;
  const n = parseId(value);
  if (!n) return null;
  return n;
}

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

async function recalcOrderTotals(tx: Prisma.TransactionClient, orderId: number) {
  const items = await tx.orderItem.findMany({
    where: { orderId, status: "ACTIVE" },
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

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const orderId = parseId(idParam);
    if (!orderId) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    let body: AddItemBody;
    try {
      body = (await req.json()) as AddItemBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const menuItemId = parseId(body.menuItemId);
    const quantity = parseQty(body.quantity, 1);
    const seatNumber = parseIntOrNull(body.seatNumber);
    const comment = typeof body.comment === "string" ? body.comment.trim() : null;

    if (!menuItemId) return NextResponse.json({ error: "menuItemId is required" }, { status: 400 });
    if (!quantity) return NextResponse.json({ error: "quantity must be a positive integer" }, { status: 400 });
    if (seatNumber !== null && seatNumber <= 0) {
      return NextResponse.json({ error: "seatNumber must be a positive integer" }, { status: 400 });
    }

    const modifierOptionIdsRaw = Array.isArray(body.modifierOptionIds) ? body.modifierOptionIds : [];
    const modifierOptionIds: number[] = [];
    for (const v of modifierOptionIdsRaw) {
      const id = parseId(v);
      if (!id) return NextResponse.json({ error: "modifierOptionIds must contain positive integers" }, { status: 400 });
      modifierOptionIds.push(id);
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, locationId: auth.locationId },
        select: { id: true, status: true },
      });

      if (!order) return { ok: false as const, status: 404, message: "Order not found" };
      if (order.status === OrderStatus.VOIDED) return { ok: false as const, status: 409, message: "Order is voided" };
      if (order.status === OrderStatus.PAID) return { ok: false as const, status: 409, message: "Order is paid" };

      const menuItem = await tx.menuItem.findFirst({
        where: { id: menuItemId, locationId: auth.locationId, isActive: true },
        select: { id: true, basePrice: true },
      });

      if (!menuItem) return { ok: false as const, status: 404, message: "Menu item not found" };

      const allowedGroups = await tx.menuItemModifierGroup.findMany({
        where: { menuItemId: menuItem.id },
        select: { modifierGroupId: true },
      });
      const allowedGroupIds = new Set<number>(allowedGroups.map((g) => g.modifierGroupId));

      let options: Array<{ id: number; modifierGroupId: number; priceDelta: Prisma.Decimal | null; name: string }> = [];
      if (modifierOptionIds.length > 0) {
        const found = await tx.modifierOption.findMany({
          where: { id: { in: modifierOptionIds }, isActive: true },
          select: { id: true, modifierGroupId: true, priceDelta: true, name: true },
        });

        if (found.length !== modifierOptionIds.length) {
          return { ok: false as const, status: 400, message: "Some modifier options not found" };
        }

        for (const opt of found) {
          if (!allowedGroupIds.has(opt.modifierGroupId)) {
            return { ok: false as const, status: 400, message: "Modifier option is not allowed for this menu item" };
          }
        }

        options = found;
      }

      let modsSum = new Prisma.Decimal(0);
      for (const opt of options) {
        if (opt.priceDelta) modsSum = modsSum.add(opt.priceDelta);
      }

      const basePrice = menuItem.basePrice;
      const discountAmount = new Prisma.Decimal(0);
      const finalPrice = basePrice.add(modsSum).sub(discountAmount);

      const createdItem = await tx.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: menuItem.id,
          seatNumber,
          quantity,
          basePrice: d2(basePrice),
          discountAmount: d2(discountAmount),
          finalPrice: d2(finalPrice),
          comment: comment || null,
          kdsStatus: KdsStatus.PENDING,
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
        },
      });

      if (options.length > 0) {
        await tx.orderItemModifier.createMany({
          data: options.map((opt) => ({
            orderItemId: createdItem.id,
            modifierOptionId: opt.id,
            priceDelta: opt.priceDelta ? d2(opt.priceDelta) : null,
          })),
        });
      }

      const totals = await recalcOrderTotals(tx, order.id);

      const itemWithMods = await tx.orderItem.findUnique({
        where: { id: createdItem.id },
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

      return {
        ok: true as const,
        item: itemWithMods,
        totals,
      };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    const item = result.item;
    if (!item) {
      return NextResponse.json({ error: "Failed to load created item" }, { status: 500 });
    }

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
