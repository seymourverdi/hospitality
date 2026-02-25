import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
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

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export async function GET(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);

    const { id: idParam } = await ctx.params;
    const menuItemId = parseId(idParam);
    if (!menuItemId) {
      return NextResponse.json({ error: "Invalid menu item id" }, { status: 400 });
    }

    const item = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        locationId: auth.locationId,
        isActive: true,
      },
      select: {
        id: true,
        modifierGroups: {
          select: {
            modifierGroup: {
              select: {
                id: true,
                name: true,
                isRequired: true,
                minSelected: true,
                maxSelected: true,
                sortOrder: true,
                options: {
                  where: { isActive: true },
                  orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
                  select: { id: true, name: true, priceDelta: true, sortOrder: true },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const groups = item.modifierGroups
      .map((mg) => mg.modifierGroup)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
      .map((g) => ({
        id: g.id,
        name: g.name,
        isRequired: g.isRequired,
        minSelected: g.minSelected,
        maxSelected: g.maxSelected,
        options: g.options.map((o) => ({
          id: o.id,
          name: o.name,
          priceDelta: o.priceDelta ? d2(o.priceDelta).toString() : "0.00",
        })),
      }));

    return NextResponse.json({ ok: true as const, groups }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}