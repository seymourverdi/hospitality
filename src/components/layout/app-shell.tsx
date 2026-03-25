import { NextResponse } from "next/server";
import { getPosSession } from "@/modules/pos/server/session/pos-session";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  try {
    const session = await getPosSession();

    if (!session) {
      console.warn('[ME] No pos_session_v1 cookie found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.userId, 10);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roleId: true,
        locationId: true,
        avatarColor: true,
      },
    });

    console.log('[ME] session userId:', session.userId, '→ user:', user ? `${user.firstName} ${user.lastName} (id:${user.id})` : 'NOT FOUND')

    return NextResponse.json({ user });
  } catch (e) {
    console.error('[ME] error', e)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}