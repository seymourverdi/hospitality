import { NextResponse } from "next/server";
import { Prisma, PaymentStatus } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";
import { completeOpenTicketsForOrder } from "@/server/api/kds";

type ConfirmBody = {
  provider: string;
  transactionId: string;
  status: "APPROVED" | "DECLINED";
};

type ConfirmResultOk = {
  ok: true;
  paymentId: number;
  orderId: number;
  status: PaymentStatus;
  approvedTotal: string;
  remaining: string;
  isPaid: boolean;
};

type ConfirmResultFail = {
  ok: false;
  status: number;
  message: string;
};

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

function getIdempotencyKey(req: Request): string | null {
  const v = req.headers.get("idempotency-key")?.trim();
  return v ? v : null;
}

function hashRequest(method: string, path: string, body: unknown): string {
  const payload = JSON.stringify(body ?? null);
  return crypto.createHash("sha256").update(`${method}:${path}:${payload}`).digest("hex");
}

function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);

    const idemKey = getIdempotencyKey(req);
    const method = "POST";
    const path = new URL(req.url).pathname;

    let body: ConfirmBody;
    try {
      body = (await req.json()) as ConfirmBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const requestHash = hashRequest(method, path, body);

    if (idemKey) {
      const cached = await prisma.apiIdempotency.findUnique({
        where: { key: idemKey },
        select: {
          requestHash: true,
          responseJson: true,
          expiresAt: true,
          locationId: true,
          terminalId: true,
          userId: true,
        },
      });

      if (
        cached &&
        cached.expiresAt.getTime() > Date.now() &&
        cached.locationId === auth.locationId &&
        cached.terminalId === auth.terminalId &&
        cached.userId === auth.userId
      ) {
        if (cached.requestHash !== requestHash) {
          return NextResponse.json(
            { error: "Idempotency-Key reuse with different payload" },
            { status: 409 }
          );
        }
        return NextResponse.json(cached.responseJson, { status: 200 });
      }
    }

    const provider = typeof body.provider === "string" ? body.provider.trim() : "";
    const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : "";
    const targetStatus = body.status;

    if (!provider) return NextResponse.json({ error: "provider is required" }, { status: 400 });
    if (!transactionId) return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
    if (targetStatus !== "APPROVED" && targetStatus !== "DECLINED") {
      return NextResponse.json({ error: "status must be APPROVED or DECLINED" }, { status: 400 });
    }

    const result = await prisma.$transaction<ConfirmResultOk | ConfirmResultFail>(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          provider,
          transactionId,
          order: { locationId: auth.locationId },
        },
        select: {
          id: true,
          status: true,
          orderId: true,
          order: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              tableId: true,
            },
          },
        },
      });

      if (!payment) return { ok: false, status: 404, message: "Payment not found" };
      if (payment.order.status === "VOIDED") return { ok: false, status: 409, message: "Order is voided" };

      const current = payment.status;

      if (targetStatus === "APPROVED") {
        if (current === "PENDING") {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "APPROVED", paidAt: new Date() },
            select: { id: true },
          });
        } else if (current !== "APPROVED") {
          return { ok: false, status: 409, message: "Payment cannot be approved from current status" };
        }
      }

      if (targetStatus === "DECLINED") {
        if (current === "PENDING") {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "DECLINED", paidAt: null },
            select: { id: true },
          });
        } else if (current !== "DECLINED") {
          return { ok: false, status: 409, message: "Payment cannot be declined from current status" };
        }
      }

      const agg = await tx.payment.aggregate({
        where: { orderId: payment.orderId, status: "APPROVED" },
        _sum: { amount: true },
      });

      const approvedTotal = agg._sum.amount ?? new Prisma.Decimal(0);
      const remaining = payment.order.totalAmount.sub(approvedTotal);
      const isPaid = remaining.lte(0);

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: isPaid ? "PAID" : approvedTotal.gt(0) ? "PARTIALLY_PAID" : "OPEN",
          closedAt: isPaid ? new Date() : null,
          closedByUserId: isPaid ? auth.userId : null,
        },
        select: { id: true },
      });

      if (isPaid) {
        await completeOpenTicketsForOrder(tx as any, { orderId: payment.orderId });
      }


      if (payment.order.tableId) {
        await tx.table.update({
          where: { id: payment.order.tableId },
          data: isPaid
            ? { status: "AVAILABLE", activeOrderId: null }
            : { status: "BUSY", activeOrderId: payment.orderId },
          select: { id: true },
        });
      }

      return {
        ok: true,
        paymentId: payment.id,
        orderId: payment.orderId,
        status: targetStatus,
        approvedTotal: d2(approvedTotal).toString(),
        remaining: d2(remaining).toString(),
        isPaid,
      };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    if (idemKey) {
      try {
        await prisma.apiIdempotency.create({
          data: {
            key: idemKey,
            locationId: auth.locationId,
            terminalId: auth.terminalId,
            userId: auth.userId,
            method,
            path,
            requestHash,
            responseJson: result,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      } catch (err: unknown) {
        if (!isPrismaKnownRequestError(err) || err.code !== "P2002") {
          throw err;
        }

        const cached = await prisma.apiIdempotency.findUnique({
          where: { key: idemKey },
          select: { requestHash: true, responseJson: true, expiresAt: true },
        });

        if (
          cached &&
          cached.expiresAt.getTime() > Date.now() &&
          cached.requestHash === requestHash
        ) {
          return NextResponse.json(cached.responseJson, { status: 200 });
        }
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
