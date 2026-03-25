import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

type UiTicketItem = {
  id: string
  ticketItemId: string
  name: string
  modifier: string | null
  allergy: string | null
  seat: number | null
  server: string | null
  completed: boolean
  kdsStatus: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'SERVED'
}

type UiTicket = {
  id: string
  orderId: number
  tableName: string | null
  locationName: string | null
  course: string | null
  time: string
  elapsed: string
  status: 'incoming' | 'fired' | 'complete'
  items: UiTicketItem[]
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatElapsed(from: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - from.getTime()) / 1000))
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60

  if (minutes <= 0) {
    return `${rest} sec`
  }

  return `${minutes} min ${rest} sec`
}

function mapTicketStatus(
  status: 'OPEN' | 'COMPLETED' | 'CANCELLED',
  itemStatuses: Array<'PENDING' | 'IN_PROGRESS' | 'READY' | 'SERVED'>
): 'incoming' | 'fired' | 'complete' {
  if (status === 'COMPLETED') {
    return 'complete'
  }

  if (itemStatuses.length === 0) {
    return 'incoming'
  }

  const allDone = itemStatuses.every((s) => s === 'READY' || s === 'SERVED')
  if (allDone) {
    return 'complete'
  }

  const hasInProgress = itemStatuses.some((s) => s === 'IN_PROGRESS')
  if (hasInProgress) {
    return 'fired'
  }

  return 'incoming'
}

export async function GET() {
  try {
    const tickets = await prisma.kitchenTicket.findMany({
      where: {
        status: {
          in: ['OPEN', 'COMPLETED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        table: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: {
          orderBy: {
            id: 'asc',
          },
          include: {
            orderItem: {
              include: {
                menuItem: {
                  select: {
                    name: true,
                  },
                },
                modifiers: {
                  include: {
                    modifierOption: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const mapped: UiTicket[] = tickets.map((ticket) => {
      const itemStatuses = ticket.items.map((item) => item.orderItem.kdsStatus)
      const uiStatus = mapTicketStatus(ticket.status, itemStatuses)

      const items: UiTicketItem[] = ticket.items.map((ticketItem) => {
        const modifierText =
          ticketItem.orderItem.modifiers.length > 0
            ? ticketItem.orderItem.modifiers
                .map((modifier) => modifier.modifierOption.name)
                .join(', ')
            : null

        const serverName = `${ticket.createdByUser.firstName} ${ticket.createdByUser.lastName}`.trim()

        const kdsStatus = ticketItem.orderItem.kdsStatus as 'PENDING' | 'IN_PROGRESS' | 'READY' | 'SERVED'
        return {
          id: String(ticketItem.id),
          ticketItemId: String(ticketItem.id),
          name: ticketItem.orderItem.menuItem.name,
          modifier: modifierText,
          allergy: null,
          seat: ticketItem.orderItem.seatNumber ?? null,
          server: serverName || null,
          completed: kdsStatus === 'READY' || kdsStatus === 'SERVED',
          kdsStatus,
        }
      })

      return {
        id: String(ticket.id),
        orderId: ticket.orderId,
        tableName: ticket.table?.name ?? null,
        locationName: ticket.location?.name ?? null,
        course: null,
        time: formatClock(ticket.createdAt),
        elapsed: formatElapsed(ticket.createdAt),
        status: uiStatus,
        items,
      }
    })

    return NextResponse.json({
      ok: true,
      tickets: mapped,
    })
  } catch (error) {
    console.error('GET /api/sale/kds/tickets failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load KDS tickets',
      },
      { status: 500 }
    )
  }
}