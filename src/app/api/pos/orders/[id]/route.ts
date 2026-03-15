import { NextResponse } from "next/server";
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

function truthyQueryFlag(url: URL, key: string): boolean {
  const v = url.searchParams.get(key);
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y";
}

type PaymentSummary = {
  approvedAmount: string;
  approvedTipAmount: string;
  remaining: string;
  isPaid: boolean;
};

type Counts = {
  items: number; // backward compatible == activeItems
  activeItems: number;
  voidedItems: number;
  totalItems: number;
  payments: number;
};

export async function GET(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const orderId = parsePositiveInt(idParam);
    if (!orderId) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

    const url = new URL(req.url);
    const includeVoided = truthyQueryFlag(url, "includeVoided");

    const order = await prisma.order.findFirst({
      where: { id: orderId, locationId: auth.locationId },
      select: {
        id: true,
        status: true,
        orderType: true,
        openedAt: true,
        closedAt: true,
        note: true,
        tableId: true,
        guestId: true,
        membershipId: true,
        terminalId: true,
        shiftId: true,
        openedByUserId: true,
        closedByUserId: true,
        table: { select: { id: true, name: true } },
        guest: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        membership: {
          select: {
            id: true,
            membershipLevel: true,
            membershipNumber: true,
            discountPercent: true,
            isActive: true,
          },
        },
        subtotalAmount: true,
        discountAmount: true,
        serviceChargeAmount: true,
        taxAmount: true,
        totalAmount: true,
        items: {
          where: includeVoided ? undefined : { status: "ACTIVE" },
          orderBy: { createdAt: "asc" },
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
            status: true,
            voidedAt: true,
            voidedByUserId: true,
            voidReason: true,
            createdAt: true,
            updatedAt: true,
            menuItem: {
              select: {
                id: true,
                name: true,
                sku: true,
                basePrice: true,
                taxRate: true,
                kdsStationId: true,
                category: { select: { id: true, name: true } },
              },
            },
            modifiers: {
              orderBy: { id: "asc" },
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
        },
        payments: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            amount: true,
            tipAmount: true,
            paymentMethod: true,
            provider: true,
            transactionId: true,
            status: true,
            paidAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: { select: { payments: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const itemGroups = await prisma.orderItem.groupBy({
      by: ["status"],
      where: { orderId: order.id },
      _count: { _all: true },
    });

    let activeItems = 0;
    let voidedItems = 0;

    for (const g of itemGroups) {
      if (g.status === "ACTIVE") activeItems += g._count._all;
      if (g.status === "VOID") voidedItems += g._count._all;
    }

    const counts: Counts = {
      items: activeItems,
      activeItems,
      voidedItems,
      totalItems: activeItems + voidedItems,
      payments: order._count.payments,
    };

    const approvedAmount = order.payments
      .filter((p) => p.status === "APPROVED")
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const approvedTipAmount = order.payments
      .filter((p) => p.status === "APPROVED")
      .reduce((acc, p) => acc + Number(p.tipAmount), 0);

    const remaining = Math.max(Number(order.totalAmount) - approvedAmount, 0);

    const paymentSummary: PaymentSummary = {
      approvedAmount: approvedAmount.toFixed(2),
      approvedTipAmount: approvedTipAmount.toFixed(2),
      remaining: remaining.toFixed(2),
      isPaid: remaining <= 0.000001,
    };

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: order.id,
          status: order.status,
          orderType: order.orderType,
          openedAt: order.openedAt,
          closedAt: order.closedAt,
          note: order.note,
          tableId: order.tableId,
          guestId: order.guestId,
          membershipId: order.membershipId,
          terminalId: order.terminalId,
          shiftId: order.shiftId,
          openedByUserId: order.openedByUserId,
          closedByUserId: order.closedByUserId,
          table: order.table,
          guest: order.guest,
          membership: order.membership,
          totals: {
            subtotalAmount: String(order.subtotalAmount),
            discountAmount: String(order.discountAmount),
            serviceChargeAmount: String(order.serviceChargeAmount),
            taxAmount: String(order.taxAmount),
            totalAmount: String(order.totalAmount),
          },
          items: order.items.map((it) => ({
            id: it.id,
            menuItemId: it.menuItemId,
            seatNumber: it.seatNumber,
            quantity: it.quantity,
            basePrice: String(it.basePrice),
            discountAmount: String(it.discountAmount),
            finalPrice: String(it.finalPrice),
            comment: it.comment,
            kdsStatus: it.kdsStatus,
            status: it.status,
            voidedAt: it.voidedAt,
            voidedByUserId: it.voidedByUserId,
            voidReason: it.voidReason,
            createdAt: it.createdAt,
            updatedAt: it.updatedAt,
            menuItem: it.menuItem,
            modifiers: it.modifiers.map((m) => ({
              id: m.id,
              modifierOptionId: m.modifierOptionId,
              priceDelta: m.priceDelta === null ? null : String(m.priceDelta),
              option: {
                id: m.modifierOption.id,
                name: m.modifierOption.name,
                group: m.modifierOption.modifierGroup,
              },
            })),
          })),
          payments: order.payments.map((p) => ({
            id: p.id,
            amount: String(p.amount),
            tipAmount: String(p.tipAmount),
            paymentMethod: p.paymentMethod,
            provider: p.provider,
            transactionId: p.transactionId,
            status: p.status,
            paidAt: p.paidAt,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          })),
        },
        counts,
        paymentSummary,
        meta: {
          includeVoided,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}