import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

function parseId(value: string): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

// PATCH /api/sale/kds/tickets/[id]
// body: { action: 'dismiss' }  — removes a COMPLETED ticket from the board
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseId(params.id)
    if (!ticketId) {
      return NextResponse.json({ ok: false, error: 'Invalid ticket id' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({})) as { action?: string }
    if (body.action !== 'dismiss') {
      return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 })
    }

    const ticket = await prisma.kitchenTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, status: true },
    })

    if (!ticket) {
      return NextResponse.json({ ok: false, error: 'Ticket not found' }, { status: 404 })
    }

    // Only dismiss COMPLETED or OPEN tickets
    if (ticket.status === 'CANCELLED') {
      return NextResponse.json({ ok: true, alreadyDismissed: true })
    }

    await prisma.kitchenTicket.update({
      where: { id: ticketId },
      data: { status: 'CANCELLED' },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, dismissed: true })
  } catch (error) {
    console.error('PATCH /api/sale/kds/tickets/[id] failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to dismiss ticket' }, { status: 500 })
  }
}