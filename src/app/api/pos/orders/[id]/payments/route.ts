import { NextResponse } from "next/server";
import { Prisma, PaymentMethod } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/api/auth";

type CreatePaymentBody = {
  amount: string | number;
  tipAmount?: string | number;
  paymentMethod: string;
  provider?: string | null;
  transactionId?: string | null;
};

function isPaymentMethod(v: unknown): v is PaymentMethod {
  return typeof v === "string" && (Object.values(PaymentMethod) as string[]).includes(v);
}

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req);

    const orderId = Number(params.id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
    }

    const body = (await req.json()) as CreatePaymentBody;

    if (!isPaymentMethod(body.paymentMethod)) {
      return NextResponse.json({ error: "Invalid paymentMethod" }, { status: 400 });
    }

    const method: PaymentMethod = body.paymentMethod;

    const amount = new Prisma.Decimal(body.amount ?? 0);
    const tipAmount = new Prisma.Decimal(body.tipAmount ?? 0);

    if (amount.lte(0)) {
      return NextResponse.json({ error: "Amount must be > 0" }, { status: 400 });
    }

    const providerRaw =
      typeof body.provider === "string" && body.provider.trim() !== ""
        ? body.provider.trim()
        : null;

    const transactionIdRaw =
      typeof body.transactionId === "string" && body.transactionId.trim() !== ""
        ? body.transactionId.trim()
        : null;

    if (method === PaymentMethod.CARD || method === PaymentMethod.EXTERNAL) {
      if (!providerRaw) {
        return NextResponse.json({ error: "Provider is required" }, { status: 400 });
      }
      if (!transactionIdRaw) {
        return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
      }
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          shiftId: true,
          terminalId: true,
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      await tx.payment.create({
        data: {
          orderId,
          shiftId: order.shiftId,
          terminalId: order.terminalId,
          amount: d2(amount),
          tipAmount: d2(tipAmount),
          paymentMethod: method,
          status: "APPROVED",
          provider: providerRaw,
          transactionId: transactionIdRaw,
          paidAt: new Date(),
        },
      });

      const payments = await tx.payment.findMany({
        where: { orderId, status: "APPROVED" },
        select: { amount: true },
      });

      const totalPaid = payments.reduce(
        (acc, p) => acc.plus(p.amount),
        new Prisma.Decimal(0)
      );

      const remaining = d2(order.totalAmount.minus(totalPaid));

      if (remaining.lte(0)) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            closedAt: new Date(),
          },
        });
      } else if (order.status === "OPEN" || order.status === "SENT_TO_KITCHEN") {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PARTIALLY_PAID" },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}