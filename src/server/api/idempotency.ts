import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

type IdemCtx = {
  locationId: number;
  terminalId: number;
  userId: number;
};

type IdemRow = {
  requestHash: string;
  responseJson: Prisma.JsonValue;
  expiresAt: Date;
};

export function getIdempotencyKey(req: Request): string | null {
  const v = req.headers.get("idempotency-key")?.trim();
  return v ? v : null;
}

export function hashRequest(method: string, path: string, body: unknown): string {
  const payload = JSON.stringify(body ?? null);
  return crypto.createHash("sha256").update(`${method}:${path}:${payload}`).digest("hex");
}

function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export async function loadIdempotency(key: string, ctx: IdemCtx): Promise<IdemRow | null> {
  const row = await prisma.apiIdempotency.findUnique({
    where: { key },
    select: {
      requestHash: true,
      responseJson: true,
      expiresAt: true,
      locationId: true,
      terminalId: true,
      userId: true,
    },
  });

  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;

  if (row.locationId !== ctx.locationId || row.terminalId !== ctx.terminalId || row.userId !== ctx.userId) {
    return null;
  }

  return {
    requestHash: row.requestHash,
    responseJson: row.responseJson,
    expiresAt: row.expiresAt,
  };
}

export async function saveIdempotencyOnce(args: {
  key: string;
  ctx: IdemCtx;
  method: string;
  path: string;
  requestHash: string;
  responseJson: Prisma.InputJsonValue;
  ttlMs: number;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + args.ttlMs);

  try {
    await prisma.apiIdempotency.create({
      data: {
        key: args.key,
        locationId: args.ctx.locationId,
        terminalId: args.ctx.terminalId,
        userId: args.ctx.userId,
        method: args.method,
        path: args.path,
        requestHash: args.requestHash,
        responseJson: args.responseJson,
        expiresAt,
      },
    });
  } catch (err: unknown) {
    // Unique key race: someone already created it. Do not overwrite.
    if (!isPrismaKnownRequestError(err) || err.code !== "P2002") {
      throw err;
    }
  }
}
