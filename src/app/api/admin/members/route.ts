import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getLocationId(): Promise<number | null> {
  const loc = await prisma.restaurantLocation.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { id: 'asc' },
  })
  return loc?.id ?? null
}

export async function GET() {
  try {
    const locationId = await getLocationId()
    if (!locationId) return NextResponse.json({ ok: false, error: 'No active location' }, { status: 404 })

    const guests = await prisma.guest.findMany({
      where: { locationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        note: true,
        createdAt: true,
        memberships: {
          orderBy: { id: 'desc' },
          take: 1,
          select: {
            id: true,
            membershipNumber: true,
            membershipLevel: true,
            discountPercent: true,
            isActive: true,
          },
        },
        orders: {
          where: { status: 'PAID' },
          select: { totalAmount: true },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    const members = guests.map(g => {
      const m = g.memberships[0] ?? null
      const totalSpent = g.orders.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0)
      return {
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        phone: g.phone,
        note: g.note,
        createdAt: g.createdAt,
        totalSpent: Math.round(totalSpent),
        membership: m ? {
          id: m.id,
          membershipNumber: m.membershipNumber,
          membershipLevel: m.membershipLevel,
          discountPercent: m.discountPercent ? Number(m.discountPercent) : null,
          isActive: m.isActive,
        } : null,
      }
    })

    return NextResponse.json({ ok: true, members, locationId })
  } catch (error) {
    console.error('GET /api/admin/members failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to load members' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const locationId = await getLocationId()
    if (!locationId) return NextResponse.json({ ok: false, error: 'No active location' }, { status: 404 })

    const body = await request.json() as {
      firstName: string
      lastName: string
      email?: string
      phone?: string
      note?: string
      membershipNumber?: string
      membershipLevel?: 'SILVER' | 'GOLD' | 'VIP'
      discountPercent?: number
    }

    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      return NextResponse.json({ ok: false, error: 'First and last name required' }, { status: 400 })
    }

    const guest = await prisma.guest.create({
      data: {
        locationId,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        note: body.note?.trim() || null,
      },
    })

    let membership = null
    if (body.membershipLevel) {
      membership = await prisma.membership.create({
        data: {
          guestId: guest.id,
          membershipLevel: body.membershipLevel,
          membershipNumber: body.membershipNumber?.trim() || `CC-${guest.id}`,
          discountPercent: body.discountPercent ?? null,
          isActive: true,
        },
      })
    }

    return NextResponse.json({ ok: true, guest, membership })
  } catch (error) {
    console.error('POST /api/admin/members failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to create member' }, { status: 500 })
  }
}