import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { KdsStatus, OrderItemStatus, OrderStatus, OrderType, ShiftStatus } from '@prisma/client'

type SaleSubmitItem = {
  productId: string
  qty: number
  note?: string
  modifiers?: Array<{
    groupId: string
    optionId: string
    name: string
    priceAdjustment: number
  }>
}

type SaleSubmitBody = {
  tableId?: string
  seatNumbers?: number[]
  memberId?: string
  isNonMember?: boolean
  discountTier?: number | null
  scheduledTime?: string | null
  notes?: string
  items?: SaleSubmitItem[]
}

function toPositiveInt(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) {
    return null
  }
  return n
}

function money(value: number) {
  return Number(value.toFixed(2))
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

async function getOrCreateOpenShift(locationId: number) {
  const existing = await prisma.shift.findFirst({
    where: {
      locationId,
      status: ShiftStatus.OPEN,
    },
    orderBy: {
      openedAt: 'desc',
    },
  })

  if (existing) {
    return existing
  }

  const terminal = await prisma.terminal.findFirst({
    where: {
      locationId,
      isActive: true,
    },
    orderBy: {
      id: 'asc',
    },
  })

  if (!terminal) {
    throw new Error('No active terminal found')
  }

  const user = await prisma.user.findFirst({
    where: {
      locationId,
      isActive: true,
    },
    orderBy: {
      id: 'asc',
    },
  })

  if (!user) {
    throw new Error('No active user found')
  }

  return prisma.shift.create({
    data: {
      locationId,
      userId: user.id,
      terminalId: terminal.id,
      openedAt: new Date(),
      openingCashAmount: '0.00',
      status: ShiftStatus.OPEN,
    },
  })
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const body = (await request.json()) as SaleSubmitBody
    const tableId = toPositiveInt(body.tableId)
    const items = Array.isArray(body.items) ? body.items : []

    if (!tableId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'tableId is required',
        },
        { status: 400 }
      )
    }

    if (items.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'At least one item is required',
        },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const table = await tx.table.findFirst({
        where: {
          id: tableId,
          isActive: true,
        },
      })

      if (!table) {
        return {
          ok: false as const,
          status: 404,
          error: 'Table not found',
        }
      }

      const locationId = table.locationId
      const shift = await getOrCreateOpenShift(locationId)

      const terminal = await tx.terminal.findFirst({
        where: {
          locationId,
          isActive: true,
        },
        orderBy: {
          id: 'asc',
        },
      })

      if (!terminal) {
        return {
          ok: false as const,
          status: 409,
          error: 'No active terminal found',
        }
      }

      const openedByUser = await tx.user.findFirst({
        where: {
          locationId,
          isActive: true,
        },
        orderBy: {
          id: 'asc',
        },
      })

      if (!openedByUser) {
        return {
          ok: false as const,
          status: 409,
          error: 'No active user found',
        }
      }

      let orderId = table.activeOrderId ?? null

      if (!orderId) {
        const createdOrder = await tx.order.create({
          data: {
            locationId,
            terminalId: terminal.id,
            shiftId: shift.id,
            tableId: table.id,
            guestId: null,
            membershipId: null,
            parentOrderId: null,
            orderType: OrderType.DINE_IN,
            status: OrderStatus.OPEN,
            subtotalAmount: '0.00',
            discountAmount: '0.00',
            serviceChargeAmount: '0.00',
            taxAmount: '0.00',
            totalAmount: '0.00',
            openedByUserId: openedByUser.id,
            closedByUserId: null,
            openedAt: new Date(),
            closedAt: null,
            note: body.notes ?? null,
          },
        })

        orderId = createdOrder.id

        await tx.table.update({
          where: {
            id: table.id,
          },
          data: {
            activeOrderId: createdOrder.id,
            status: 'occupied',
          },
        })
      }

      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
      })

      if (!order) {
        return {
          ok: false as const,
          status: 404,
          error: 'Order not found after create/reuse',
        }
      }

      const createdKdsItems: Array<{
        orderItemId: number
        quantity: number
        kdsStationId: number
      }> = []

      for (const item of items) {
        const menuItemId = toPositiveInt(item.productId)

        if (!menuItemId) {
          return {
            ok: false as const,
            status: 400,
            error: `Invalid productId: ${item.productId}`,
          }
        }

        const menuItem = await tx.menuItem.findFirst({
          where: {
            id: menuItemId,
            locationId,
            isActive: true,
          },
        })

        if (!menuItem) {
          return {
            ok: false as const,
            status: 404,
            error: `Menu item ${menuItemId} not found`,
          }
        }

        const quantity = Math.max(1, Number(item.qty || 1))
        const modifierOptionIds = Array.isArray(item.modifiers)
          ? item.modifiers
              .map((modifier) => toPositiveInt(modifier.optionId))
              .filter((value): value is number => value !== null)
          : []

        const modifierOptions =
          modifierOptionIds.length > 0
            ? await tx.modifierOption.findMany({
                where: {
                  id: {
                    in: modifierOptionIds,
                  },
                },
              })
            : []

        const modifierTotal = modifierOptions.reduce((sum, option) => {
          return sum + Number(option.priceDelta ?? 0)
        }, 0)

        const unitBasePrice = Number(menuItem.basePrice)
        const unitFinalPrice = unitBasePrice + modifierTotal
        const lineBasePrice = money(unitBasePrice * quantity)
        const lineFinalPrice = money(unitFinalPrice * quantity)
        const seatNumber =
          Array.isArray(body.seatNumbers) && body.seatNumbers.length > 0
            ? Number(body.seatNumbers[0])
            : null

        const createdItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: menuItem.id,
            seatNumber,
            quantity,
            basePrice: lineBasePrice.toFixed(2),
            discountAmount: '0.00',
            finalPrice: lineFinalPrice.toFixed(2),
            comment: item.note ?? null,
            kdsStatus: KdsStatus.PENDING,
            status: OrderItemStatus.ACTIVE,
          },
        })

        if (modifierOptions.length > 0) {
          await tx.orderItemModifier.createMany({
            data: modifierOptions.map((option) => ({
              orderItemId: createdItem.id,
              modifierOptionId: option.id,
              priceDelta: Number(option.priceDelta ?? 0).toFixed(2),
            })),
          })
        }

        if (menuItem.kdsStationId) {
          createdKdsItems.push({
            orderItemId: createdItem.id,
            quantity,
            kdsStationId: menuItem.kdsStationId,
          })
        }
      }

      if (createdKdsItems.length > 0) {
        const stationGroups = new Map<
          number,
          Array<{ orderItemId: number; quantity: number }>
        >()

        for (const item of createdKdsItems) {
          const existing = stationGroups.get(item.kdsStationId) ?? []
          existing.push({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })
          stationGroups.set(item.kdsStationId, existing)
        }

        for (const [kdsStationId, stationItems] of Array.from(stationGroups.entries())) {
          const ticket = await tx.kitchenTicket.create({
            data: {
              locationId,
              orderId: order.id,
              tableId: table.id,
              kdsStationId,
              terminalId: terminal.id,
              createdByUserId: openedByUser.id,
              status: 'OPEN',
            },
          })

          await tx.kitchenTicketItem.createMany({
            data: stationItems.map(
              (stationItem: { orderItemId: number; quantity: number }) => ({
                ticketId: ticket.id,
                orderItemId: stationItem.orderItemId,
                quantity: stationItem.quantity,
              })
            ),
          })
        }
      }

      const orderItems = await tx.orderItem.findMany({
        where: {
          orderId: order.id,
          status: OrderItemStatus.ACTIVE,
        },
        include: {
          menuItem: true,
          modifiers: {
            include: {
              modifierOption: true,
            },
          },
        },
      })

      const subtotalAmount = money(
        orderItems.reduce((sum, orderItem) => sum + Number(orderItem.finalPrice), 0)
      )

      const taxAmount = money(
        orderItems.reduce((sum, orderItem) => {
          const rate = Number(orderItem.menuItem.taxRate ?? 0)
          const line = Number(orderItem.finalPrice)
          return sum + (line * rate) / 100
        }, 0)
      )

      const totalAmount = money(subtotalAmount + taxAmount)

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          subtotalAmount: subtotalAmount.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          note: body.notes ?? order.note,
        },
      })

      return {
        ok: true as const,
        status: 200,
        orderId: order.id,
        tableId: table.id,
        submittedItemCount: items.length,
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
      submittedItemCount: result.submittedItemCount,
    })
  } catch (error) {
    console.error('POST /api/sale/submit-order failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to submit order',
      },
      { status: 500 }
    )
  }
}