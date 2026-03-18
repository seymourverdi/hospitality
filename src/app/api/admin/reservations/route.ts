import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { ReservationStatus, ReservationSource } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getLocationId() {
  const loc = await prisma.restaurantLocation.findFirst({
    where: { isActive: true }, orderBy: { id: 'asc' }, select: { id: true },
  })
  return loc?.id ?? null
}

export async function GET(request: Request) {
  try {
    const locationId = await getLocationId()
    if (!locationId) return NextResponse.json({ ok: true, reservations: [] })

    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    const reservations = await prisma.reservation.findMany({
      where: {
        locationId,
        ...(from && to ? {
          reservationTime: {
            gte: new Date(from),
            lte: new Date(to),
          }
        } : {}),
      },
      orderBy: { reservationTime: 'asc' },
      include: {
        guest: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        tables: { include: { table: { select: { id: true, name: true } } } },
      },
    })

    return NextResponse.json({
      ok: true,
      reservations: reservations.map(r => ({
        id: r.id,
        guestId: r.guestId,
        guestName: r.guest ? `${r.guest.firstName} ${r.guest.lastName}` : null,
        guestPhone: r.guest?.phone ?? null,
        reservationTime: r.reservationTime.toISOString(),
        partySize: r.partySize,
        status: r.status,
        source: r.source,
        serviceType: r.serviceType,
        note: r.note,
        tables: r.tables.map(t => ({ id: t.table.id, name: t.table.name })),
        createdAt: r.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/reservations failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to load reservations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const locationId = await getLocationId()
    if (!locationId) return NextResponse.json({ ok: false, error: 'No location' }, { status: 400 })

    const body = await request.json() as {
      guestFirstName?: string
      guestLastName?: string
      guestPhone?: string
      reservationTime: string
      partySize: number
      serviceType?: string
      note?: string
      tableIds?: number[]
    }

    if (!body.reservationTime || !body.partySize) {
      return NextResponse.json({ ok: false, error: 'reservationTime and partySize required' }, { status: 400 })
    }

    // Upsert guest if name provided
    let guestId: number | null = null
    if (body.guestFirstName?.trim()) {
      const guest = await prisma.guest.create({
        data: {
          locationId,
          firstName: body.guestFirstName.trim(),
          lastName: (body.guestLastName ?? '').trim(),
          phone: body.guestPhone?.trim() || null,
        },
        select: { id: true },
      })
      guestId = guest.id
    }

    const reservation = await prisma.reservation.create({
      data: {
        locationId,
        guestId,
        reservationTime: new Date(body.reservationTime),
        partySize: body.partySize,
        status: ReservationStatus.PENDING,
        source: ReservationSource.PHONE,
        serviceType: (body.serviceType as 'ALL_DAY_MENU' | 'SOCIAL_LUNCH' | 'MIXED' | null) ?? null,
        note: body.note?.trim() || null,
        tables: body.tableIds?.length
          ? { create: body.tableIds.map(tableId => ({ tableId })) }
          : undefined,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, reservation })
  } catch (error) {
    console.error('POST /api/admin/reservations failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to create reservation' }, { status: 500 })
  }
}