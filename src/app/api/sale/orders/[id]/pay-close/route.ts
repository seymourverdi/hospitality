import { NextResponse } from 'next/server'
import { PaymentMethod, PaymentStatus, Prisma, ShiftStatus } from '@prisma/client'
import { prisma } from '@/server/db'

function toPositiveInt(value: string): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) {
    return null
  }
  return n
}

function d2(value: Prisma.Decimal | number | string) {
  return new Prisma.Decimal(value).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
}

function isAuthorized(request: Request): boolean {
  const expectedKey = process.env.SALE_API_KEY
  if (!expectedKey) {
    return true
  }

  const authHeader = request.headers.get('authorization') ?? ''
  const bearer = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''

  const headerKey = request.headers.get('x-sale-api-key')?.trim() ?? ''

  return bearer === expectedKey || headerKey === expectedKey
}

async function getOpenShift(locationId: number) {
  return prisma.shift.findFirst({
    where: {
      locationId,
      status: ShiftStatus.OPEN,
    },
    orderBy: {
      openedAt: 'desc',
    },
  })
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
   

    const orderId = toPositiveInt(params.id)

    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid order id',
        },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          payments: {
            where: {
              status: PaymentStatus.APPROVED,
            },
            select: {
              amount: true,
            },
          },
        },
      })

      if (!order) {
        return {
          ok: false as const,
          status: 404,
          error: 'Order not found',
        }
      }

      if (order.closedAt) {
        return {
          ok: true as const,
          status: 200,
          orderId: order.id,
          tableId: order.tableId,
          paymentCreated: false,
          closed: true,
          alreadyClosed: true,
        }
      }

      const approvedTotal = order.payments.reduce(
        (sum, payment) => sum.add(payment.amount),
        new Prisma.Decimal(0)
      )

      const totalAmount = d2(order.totalAmount)
      const remaining = d2(totalAmount.sub(approvedTotal))

      let paymentCreated = false

      if (remaining.gt(0)) {
        const terminalId = order.terminalId
        const shiftId = order.shiftId

        let finalShiftId = shiftId

        if (!finalShiftId) {
          const openShift = await getOpenShift(order.locationId)
          if (!openShift) {
            return {
              ok: false as const,
              status: 409,
              error: 'No open shift found',
            }
          }
          finalShiftId = openShift.id
        }

        await tx.payment.create({
          data: {
            orderId: order.id,
            shiftId: finalShiftId,
            terminalId,
            amount: remaining.toString(),
            tipAmount: '0.00',
            paymentMethod: PaymentMethod.CASH,
            provider: 'manual-pay-close',
            transactionId: `${order.id}-${Date.now()}`,
            status: PaymentStatus.APPROVED,
            paidAt: new Date(),
          },
        })

        paymentCreated = true
      }

      const closer = await tx.user.findFirst({
        where: {
          locationId: order.locationId,
          isActive: true,
        },
        orderBy: {
          id: 'asc',
        },
      })

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'PAID',
          closedAt: new Date(),
          closedByUserId: closer?.id ?? null,
        },
      })

      if (order.tableId) {
        await tx.table.update({
          where: {
            id: order.tableId,
          },
          data: {
            activeOrderId: null,
            status: 'available',
          },
        })
      }

      await tx.kitchenTicket.updateMany({
        where: {
          orderId: order.id,
          status: 'OPEN',
        },
        data: {
          status: 'COMPLETED',
        },
      })

      return {
        ok: true as const,
        status: 200,
        orderId: order.id,
        tableId: order.tableId,
        paymentCreated,
        closed: true,
        alreadyClosed: false,
      }
    })

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
        },
        { status: result.status }
      )
    }

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      tableId: result.tableId,
      paymentCreated: result.paymentCreated,
      closed: result.closed,
      alreadyClosed: result.alreadyClosed,
    })
  } catch (error) {
    console.error('POST /api/sale/orders/[id]/pay-close failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to pay and close order',
      },
      { status: 500 }
    )
  }
}