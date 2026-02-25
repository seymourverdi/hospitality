import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);

    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("includeInactive") === "1";

    const categories = await prisma.menuCategory.findMany({
      where: {
        locationId: auth.locationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true as const, categories }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
