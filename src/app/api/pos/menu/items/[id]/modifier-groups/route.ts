import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

function parsePositiveInt(value: string | null | undefined): number | null {
  if (!value) return null;
  const n = Number(String(value).trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function parseMenuItemIdFromPathname(pathname: string): number | null {
  const m = pathname.match(/\/api\/pos\/menu\/items\/(\d+)\/modifier-groups\/?$/);
  if (!m) return null;
  return parsePositiveInt(m[1]);
}

export async function GET(
  req: Request,
  ctx?: { params?: { id?: string } }
) {
  try {
    await requireAuth(req);

    const url = new URL(req.url);

    const fromParams = parsePositiveInt(ctx?.params?.id);
    const fromPath = parseMenuItemIdFromPathname(url.pathname);

    const menuItemId = fromParams ?? fromPath;

    if (!menuItemId) {
      return NextResponse.json(
        { error: "Invalid menuItemId", debug: { params: ctx?.params ?? {} } },
        { status: 400 }
      );
    }

    const groups = await prisma.modifierGroup.findMany({
      where: {
        isActive: true,
        menuItems: {
          some: { menuItemId },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
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
          select: {
            id: true,
            name: true,
            priceDelta: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      menuItemId,
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        isRequired: g.isRequired,
        minSelected: g.minSelected,
        maxSelected: g.maxSelected,
        sortOrder: g.sortOrder,
        options: g.options.map((o) => ({
          id: o.id,
          name: o.name,
          priceDelta: o.priceDelta ? o.priceDelta.toString() : null,
          sortOrder: o.sortOrder,
        })),
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}