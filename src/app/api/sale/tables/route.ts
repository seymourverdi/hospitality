import { NextResponse } from 'next/server'
import { OrderStatus, Prisma } from '@prisma/client'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function d2(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
}

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      where: {
        isActive: true,
      },
      include: {
        tables: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    const tableIds = areas.flatMap((area) => area.tables.map((table) => table.id))

    const fallbackOrders = tableIds.length
      ? await prisma.order.findMany({
          where: {
            tableId: {
              in: tableIds,
            },
            closedAt: null,
            status: {
              in: [OrderStatus.OPEN, OrderStatus.SENT_TO_KITCHEN, OrderStatus.PARTIALLY_PAID],
            },
          },
          orderBy: {
            openedAt: 'desc',
          },
          include: {
            payments: {
              where: {
                status: 'APPROVED',
              },
              select: {
                amount: true,
              },
            },
            _count: {
              select: {
                items: true,
                payments: true,
              },
            },
          },
        })
      : []

    const latestOpenOrderByTable = new Map<number, (typeof fallbackOrders)[number]>()

    for (const order of fallbackOrders) {
      if (order.tableId == null) continue
      if (!latestOpenOrderByTable.has(order.tableId)) {
        latestOpenOrderByTable.set(order.tableId, order)
      }
    }

    const floors = areas.map((area) => ({
      id: String(area.id),
      name: area.name,
      tables: area.tables.map((table, index) => {
        const activeOrder = latestOpenOrderByTable.get(table.id)

        let approvedTotal = new Prisma.Decimal(0)
        if (activeOrder?.payments?.length) {
          for (const payment of activeOrder.payments) {
            approvedTotal = approvedTotal.add(payment.amount)
          }
        }

        const totalAmount = activeOrder ? activeOrder.totalAmount : new Prisma.Decimal(0)
        const remaining = activeOrder ? totalAmount.sub(approvedTotal) : new Prisma.Decimal(0)
        const hasTotal = activeOrder ? activeOrder.totalAmount.gt(0) : false
        const isPaid = activeOrder ? hasTotal && remaining.lte(0) : false

        return {
          id: String(table.id),
          name: table.name,
          shape: table.capacity >= 5 ? 'circle' : 'rectangle',
          x: 40 + (index % 4) * 110,
          y: 40 + Math.floor(index / 4) * 110,
          width: table.capacity >= 5 ? 64 : 84,
          height: table.capacity >= 5 ? 64 : 44,
          seats: [],
          maxSeats: table.capacity,
          floorId: String(area.id),
          status: activeOrder ? 'occupied' : table.status,
          activeOrderId: activeOrder?.id ?? null,
          activeOrder: activeOrder
            ? {
                id: activeOrder.id,
                status: activeOrder.status,
                openedAt: activeOrder.openedAt.toISOString(),
                totalAmount: d2(activeOrder.totalAmount).toString(),
                counts: {
                  items: activeOrder._count.items,
                  payments: activeOrder._count.payments,
                },
                paymentsApprovedTotal: d2(approvedTotal).toString(),
                remaining: d2(remaining).toString(),
                isPaid,
              }
            : null,
        }
      }),
    }))

    return NextResponse.json({
      ok: true,
      floors,
    })
  } catch (error) {
    console.error('GET /api/sale/tables failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load tables',
      },
      { status: 500 }
    )
  }
}