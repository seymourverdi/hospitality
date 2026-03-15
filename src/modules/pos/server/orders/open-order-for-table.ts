import { prisma } from '@/server/db'

type OpenOrderForTableResult =
  | {
      ok: true
      orderId: string
      reused: boolean
    }
  | {
      ok: false
      error: string
      status: number
    }

function toPositiveInt(value: string): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) {
    return null
  }
  return n
}

export async function openOrderForTable(tableId: string): Promise<OpenOrderForTableResult> {
  const tableIdNum = toPositiveInt(tableId)

  if (!tableIdNum) {
    return {
      ok: false,
      error: 'Invalid table id',
      status: 400,
    }
  }

  const table = await prisma.table.findUnique({
    where: { id: tableIdNum },
    select: {
      id: true,
      locationId: true,
      activeOrderId: true,
      isActive: true,
    },
  })

  if (!table || !table.isActive) {
    return {
      ok: false,
      error: 'Table not found',
      status: 404,
    }
  }

  if (table.activeOrderId) {
    return {
      ok: true,
      orderId: String(table.activeOrderId),
      reused: true,
    }
  }

  const terminal = await prisma.terminal.findFirst({
    where: {
      locationId: table.locationId,
      isActive: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
    },
  })

  if (!terminal) {
    return {
      ok: false,
      error: 'No active terminal found',
      status: 409,
    }
  }

  const user = await prisma.user.findFirst({
    where: {
      locationId: table.locationId,
      isActive: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
    },
  })

  if (!user) {
    return {
      ok: false,
      error: 'No active user found',
      status: 409,
    }
  }

  let shift = await prisma.shift.findFirst({
    where: {
      locationId: table.locationId,
      status: 'OPEN',
    },
    orderBy: {
      openedAt: 'desc',
    },
    select: {
      id: true,
    },
  })

  if (!shift) {
    shift = await prisma.shift.create({
      data: {
        locationId: table.locationId,
        userId: user.id,
        terminalId: terminal.id,
        openedAt: new Date(),
        openingCashAmount: '0.00',
        status: 'OPEN',
      },
      select: {
        id: true,
      },
    })
  }

  const order = await prisma.order.create({
    data: {
      locationId: table.locationId,
      terminalId: terminal.id,
      shiftId: shift.id,
      tableId: table.id,
      guestId: null,
      membershipId: null,
      parentOrderId: null,
      orderType: 'DINE_IN',
      status: 'OPEN',
      subtotalAmount: '0.00',
      discountAmount: '0.00',
      serviceChargeAmount: '0.00',
      taxAmount: '0.00',
      totalAmount: '0.00',
      openedByUserId: user.id,
      closedByUserId: null,
      openedAt: new Date(),
      closedAt: null,
      note: null,
    },
    select: {
      id: true,
    },
  })

  await prisma.table.update({
    where: { id: table.id },
    data: {
      activeOrderId: order.id,
      status: 'occupied',
    },
  })

  return {
    ok: true,
    orderId: String(order.id),
    reused: false,
  }
}