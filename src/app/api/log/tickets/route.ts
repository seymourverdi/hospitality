import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import type { LogTicket, LogTicketItem } from '@/types/log'

export type { LogTicket, LogTicketItem }

function formatTime(date: Date): string {
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return isToday ? `Today ${timeStr}` : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + timeStr
}

export async function GET() {
  try {
    const tickets = await prisma.kitchenTicket.findMany({
      where: {
        status: { in: ['OPEN', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        table: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
        order: {
          select: {
            id: true,
            guest: { select: { firstName: true, lastName: true } },
          },
        },
        items: {
          orderBy: { id: 'asc' },
          include: {
            orderItem: {
              include: {
                menuItem: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    const mapped: LogTicket[] = tickets.map((ticket) => {
      const guest = ticket.order.guest
      const guestName = guest
        ? `${guest.firstName} ${guest.lastName}`.trim()
        : null

      const serverName =
        `${ticket.createdByUser.firstName} ${ticket.createdByUser.lastName}`.trim()

      const items: LogTicketItem[] = ticket.items.map((ti) => ({
        id: String(ti.id),
        name: ti.orderItem.menuItem.name,
        quantity: ti.quantity,
        seat: ti.orderItem.seatNumber ?? null,
        completed:
          ti.orderItem.kdsStatus === 'READY' ||
          ti.orderItem.kdsStatus === 'SERVED',
      }))

      // Derive seat from first item that has one
      const seatNumber =
        ticket.items.find((ti) => ti.orderItem.seatNumber != null)
          ?.orderItem.seatNumber ?? null

      return {
        id: String(ticket.id),
        orderId: ticket.orderId,
        guestName,
        serverName,
        tableName: ticket.table?.name ?? null,
        locationName: ticket.location?.name ?? null,
        seatNumber,
        time: formatTime(ticket.createdAt),
        status: ticket.status === 'COMPLETED' ? 'delivered' : 'pending',
        items,
      }
    })

    return NextResponse.json({ ok: true, tickets: mapped })
  } catch (error) {
    console.error('GET /api/log/tickets failed', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to load tickets' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { ticketId: number; status: 'COMPLETED' | 'OPEN' }
    await prisma.kitchenTicket.update({
      where: { id: body.ticketId },
      data: { status: body.status },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PATCH /api/log/tickets failed', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}