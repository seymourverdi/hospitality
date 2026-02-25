import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    const url = new URL(req.url);

    const includeInactive = url.searchParams.get("includeInactive") === "1";
    const areaIdRaw = url.searchParams.get("areaId")?.trim() ?? "";
    const areaId = areaIdRaw ? Number(areaIdRaw) : null;
    const areaIdFilter = Number.isInteger(areaId) && (areaId as number) > 0 ? (areaId as number) : null;

    const areas = await prisma.area.findMany({
      where: {
        locationId: auth.locationId,
        ...(includeInactive ? {} : { isActive: true }),
        ...(areaIdFilter ? { id: areaIdFilter } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        sortOrder: true,
        isActive: true,
        tables: {
          where: {
            locationId: auth.locationId,
            ...(includeInactive ? {} : { isActive: true }),
          },
          orderBy: [{ id: "asc" }],
          select: {
            id: true,
            name: true,
            capacity: true,
            status: true,
            isActive: true,
            activeOrderId: true,
            activeOrder: {
              select: {
                id: true,
                status: true,
                orderType: true,
                openedAt: true,
                closedAt: true,
                note: true,
                totalAmount: true,
                _count: { select: { items: true, payments: true } },
                payments: {
                  where: { status: "APPROVED" },
                  select: { amount: true },
                },
              },
            },
          },
        },
      },
    });

    const mapped = areas.map((a) => ({
      id: a.id,
      name: a.name,
      sortOrder: a.sortOrder,
      isActive: a.isActive,
      tables: a.tables.map((t) => {
        const active = t.activeOrder;

        let approvedTotal = new Prisma.Decimal(0);
        if (active?.payments?.length) {
          for (const p of active.payments) approvedTotal = approvedTotal.add(p.amount);
        }

        const totalAmount = active ? active.totalAmount : new Prisma.Decimal(0);
        const remaining = active ? totalAmount.sub(approvedTotal) : new Prisma.Decimal(0);

        // Only paid if there is a positive total AND remaining <= 0
        const hasTotal = active ? active.totalAmount.gt(0) : false;
        const isPaid = active ? hasTotal && remaining.lte(0) : false;

        return {
          id: t.id,
          name: t.name,
          capacity: t.capacity,
          status: t.status,
          isActive: t.isActive,
          activeOrderId: t.activeOrderId,
          activeOrder: active
            ? {
                id: active.id,
                status: active.status,
                orderType: active.orderType,
                openedAt: active.openedAt.toISOString(),
                closedAt: active.closedAt ? active.closedAt.toISOString() : null,
                note: active.note,
                totalAmount: d2(active.totalAmount).toString(),
                counts: {
                  items: active._count.items,
                  payments: active._count.payments,
                },
                paymentsApprovedTotal: d2(approvedTotal).toString(),
                remaining: d2(remaining).toString(),
                isPaid,
              }
            : null,
        };
      }),
    }));

    return NextResponse.json(
      { ok: true as const, areas: mapped },
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
