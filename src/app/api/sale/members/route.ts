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
      where: {
        locationId,
        memberships: { some: { isActive: true } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        memberships: {
          where: { isActive: true },
          orderBy: { id: 'desc' },
          take: 1,
          select: {
            id: true,
            membershipNumber: true,
            membershipLevel: true,
            discountPercent: true,
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
      const membership = g.memberships[0]
      const totalSpent = g.orders.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0)
      return {
        id: g.id.toString(),
        name: `${g.firstName} ${g.lastName}`,
        firstName: g.firstName,
        lastName: g.lastName,
        accountNumber: membership?.membershipNumber ?? `CC-${g.id}`,
        balance: Math.round(totalSpent),
        discountTier: membership?.discountPercent ? Number(membership.discountPercent) : undefined,
        membershipLevel: membership?.membershipLevel ?? null,
        email: g.email ?? undefined,
        phone: g.phone ?? undefined,
      }
    })

    return NextResponse.json({ ok: true, members })
  } catch (error) {
    console.error('GET /api/sale/members failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to load members' }, { status: 500 })
  }
}