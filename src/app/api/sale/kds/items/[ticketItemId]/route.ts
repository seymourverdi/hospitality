import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

type Body = {
  action?: 'start' | 'ready' | 'serve'
}

function parseId(value: string): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) {
    return null
  }
  return n
}

export async function PATCH(
  request: Request,
  { params }: { params: { ticketItemId: string } }
) {
  try {
    const ticketItemId = parseId(params.ticketItemId)

    if (!ticketItemId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid ticket item id',
        },
        { status: 400 }
      )
    }

    const body = (await request.json().catch(() => ({}))) as Body
    const action = body.action

    if (!action || !['start', 'ready', 'serve'].includes(action)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid action',
        },
        { status: 400 }
      )
    }

    const ticketItem = await prisma.kitchenTicketItem.findUnique({
      where: {
        id: ticketItemId,
      },
      include: {
        orderItem: true,
        ticket: {
          include: {
            items: {
              include: {
                orderItem: true,
              },
            },
          },
        },
      },
    })

    if (!ticketItem) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Ticket item not found',
        },
        { status: 404 }
      )
    }

    const nextStatus =
      action === 'start'
        ? 'IN_PROGRESS'
        : action === 'ready'
        ? 'READY'
        : 'SERVED'

    await prisma.orderItem.update({
      where: {
        id: ticketItem.orderItemId,
      },
      data: {
        kdsStatus: nextStatus,
      },
    })

    const refreshedTicket = await prisma.kitchenTicket.findUnique({
      where: {
        id: ticketItem.ticketId,
      },
      include: {
        items: {
          include: {
            orderItem: true,
          },
        },
      },
    })

    if (refreshedTicket) {
      const allServed = refreshedTicket.items.every(
        (item) => item.orderItem.kdsStatus === 'SERVED'
      )

      if (allServed && refreshedTicket.status !== 'COMPLETED') {
        await prisma.kitchenTicket.update({
          where: {
            id: refreshedTicket.id,
          },
          data: {
            status: 'COMPLETED',
          },
        })
      }
    }

    return NextResponse.json({
      ok: true,
      ticketItemId,
      nextStatus,
    })
  } catch (error) {
    console.error('PATCH /api/sale/kds/items/[ticketItemId] failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update KDS item',
      },
      { status: 500 }
    )
  }
}