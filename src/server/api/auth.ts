import { prisma } from "@/server/db/prisma";

export type AuthContext = {
  sessionId: number;
  token: string;
  locationId: number;
  terminalId: number;
  userId: number;
};

function extractBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export async function requireAuth(req: Request): Promise<AuthContext> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new Error("Unauthorized");
  }

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      expiresAt: true,
      locationId: true,
      terminalId: true,
      userId: true,
    },
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    throw new Error("Unauthorized");
  }

  return {
    sessionId: session.id,
    token: session.token,
    locationId: session.locationId,
    terminalId: session.terminalId,
    userId: session.userId,
  };
}
