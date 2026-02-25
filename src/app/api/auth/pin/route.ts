import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { pinLoginSchema } from "@/lib/validators/auth";
import { createSessionToken } from "@/lib/utils/token";

const SESSION_TTL_HOURS = 12;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = pinLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { locationCode, terminalCode, pinCode } = parsed.data;

  const location = await prisma.restaurantLocation.findFirst({
    where: { code: locationCode, isActive: true },
    select: { id: true, code: true, name: true, timezone: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const terminal = await prisma.terminal.findFirst({
    where: { locationId: location.id, code: terminalCode, isActive: true },
    select: { id: true, code: true, name: true, deviceType: true },
  });

  if (!terminal) {
    return NextResponse.json({ error: "Terminal not found" }, { status: 404 });
  }

  const user = await prisma.user.findFirst({
    where: { locationId: location.id, pinCode, isActive: true },
    select: { id: true, firstName: true, lastName: true, roleId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await prisma.session.deleteMany({
    where: { locationId: location.id, terminalId: terminal.id },
  });

  await prisma.session.create({
    data: {
      token,
      locationId: location.id,
      terminalId: terminal.id,
      userId: user.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    token,
    expiresAt: expiresAt.toISOString(),
    location,
    terminal,
    user,
  });
}
