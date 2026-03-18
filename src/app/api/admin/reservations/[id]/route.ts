import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { ReservationStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

type RouteContext = { params: { id: string } }

function toInt(v: string) {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const id = toInt(params.id)
    if (!id) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 })

    const body = await request.json() as { status?: string; tableIds?: number[] }

    await prisma.reservation.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status as ReservationStatus } : {}),
      },
    })

    if (body.tableIds !== undefined) {
      await prisma.reservationTable.deleteMany({ where: { reservationId: id } })
      if (body.tableIds.length > 0) {
        await prisma.reservationTable.createMany({
          data: body.tableIds.map(tableId => ({ reservationId: id, tableId })),
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PATCH /api/admin/reservations/[id] failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const id = toInt(params.id)
    if (!id) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 })
    await prisma.reservationTable.deleteMany({ where: { reservationId: id } })
    await prisma.reservation.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/reservations/[id] failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to delete' }, { status: 500 })
  }
}