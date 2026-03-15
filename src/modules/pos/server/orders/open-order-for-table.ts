import { prisma } from '@/server/db'
import { getPosSession } from '@/modules/pos/server/session/pos-session'

export class OpenOrderError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'OpenOrderError'
    this.statusCode = statusCode
  }
}

type OpenOrderForTableResult = {
  orderId: string
  tableId: string
  created: boolean
}

export async function openOrderForTable(
  tableId: string,
): Promise<OpenOrderForTableResult> {
  const session = await getPosSession()

  if (!session) {
    throw new OpenOrderError('Unauthorized', 401)
  }

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: {
      id: true,
      activeOrderId: true,
    },
  })

  if (!table) {
    throw new OpenOrderError('Table not found', 404)
  }

  if (table.activeOrderId) {
    return {
      orderId: table.activeOrderId,
      tableId: table.id,
      created: false,
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const freshTable = await tx.table.findUnique({
      where: { id: tableId },
      select: {
        id: true,
        activeOrderId: true,
      },
    })

    if (!freshTable) {
      throw new OpenOrderError('Table not found', 404)
    }

    if (freshTable.activeOrderId) {
      return {
        orderId: freshTable.activeOrderId,
        tableId: freshTable.id,
        created: false,
      }
    }

    /*
      Replace fields below with your real hospitality schema fields.
      The main requirement is:
      - create a new open order
      - bind it to the selected table
      - optionally attach user/location/terminal/session info
    */
    const order = await tx.order.create({
      data: {
        status: 'OPEN',
        tableId: freshTable.id,
        locationId: session.locationId ?? undefined,
        terminalId: session.terminalId ?? undefined,
        openedByUserId: session.userId,
      },
      select: {
        id: true,
      },
    })

    await tx.table.update({
      where: { id: freshTable.id },
      data: {
        activeOrderId: order.id,
      },
    })

    return {
      orderId: order.id,
      tableId: freshTable.id,
      created: true,
    }
  })

  return result
}