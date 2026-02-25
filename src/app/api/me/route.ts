import { NextResponse } from "next/server";
import { requireAuth } from "@/server/api/auth";
import { prisma } from "@/server/db/prisma";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, firstName: true, lastName: true, roleId: true, locationId: true },
    });

    return NextResponse.json({ auth, user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
