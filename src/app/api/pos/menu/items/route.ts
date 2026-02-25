import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);

    const url = new URL(req.url);

    const searchRaw = url.searchParams.get("search") ?? "";
    const search = searchRaw.trim();

    const categoryId = parsePositiveInt(url.searchParams.get("categoryId"));
    const includeInactive = url.searchParams.get("includeInactive") === "1";

    const limitRaw = parsePositiveInt(url.searchParams.get("limit"));
    const cursorRaw = parsePositiveInt(url.searchParams.get("cursor"));

    const limit = clamp(limitRaw ?? 50, 1, 200);
    const cursor = cursorRaw ?? undefined;

    const where: Prisma.MenuItemWhereInput = {
      locationId: auth.locationId,
      ...(includeInactive ? {} : { isActive: true }),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const rows = await prisma.menuItem.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { name: "asc" }, { id: "asc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        categoryId: true,
        name: true,
        sku: true,
        description: true,
        basePrice: true,
        taxRate: true,
        isAlcohol: true,
        isActive: true,
        kdsStationId: true,
        category: { select: { id: true, name: true } },
        kdsStation: { select: { id: true, name: true } },
        _count: { select: { modifierGroups: true } }, // MenuItemModifierGroup[]
      },
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const items = pageRows.map((it) => ({
      id: it.id,
      categoryId: it.categoryId,
      name: it.name,
      sku: it.sku,
      description: it.description,
      basePrice: d2(it.basePrice).toString(),
      taxRate: it.taxRate ? d2(it.taxRate).toString() : null,
      isAlcohol: it.isAlcohol,
      isActive: it.isActive,
      kdsStationId: it.kdsStationId,
      category: it.category,
      kdsStation: it.kdsStation,
      hasModifiers: (it._count?.modifierGroups ?? 0) > 0,
    }));

    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    return NextResponse.json(
      { ok: true as const, items, page: { limit, nextCursor } },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}