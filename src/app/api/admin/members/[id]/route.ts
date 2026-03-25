import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

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

    const body = await request.json() as {
      firstName?: string
      lastName?: string
      email?: string | null
      phone?: string | null
      note?: string | null
      membershipNumber?: string
      membershipLevel?: 'SILVER' | 'GOLD' | 'VIP'
      discountPercent?: number | null
      membershipActive?: boolean
    }

    await prisma.guest.update({
      where: { id },
      data: {
        ...(body.firstName   !== undefined && { firstName: body.firstName.trim() }),
        ...(body.lastName    !== undefined && { lastName: body.lastName.trim() }),
        ...(body.email       !== undefined && { email: body.email ?? null }),
        ...(body.phone       !== undefined && { phone: body.phone ?? null }),
        ...(body.note        !== undefined && { note: body.note ?? null }),
      },
    })

    // Update or create membership
    const existing = await prisma.membership.findFirst({
      where: { guestId: id },
      orderBy: { id: 'desc' },
    })

    if (existing) {
      await prisma.membership.update({
        where: { id: existing.id },
        data: {
          ...(body.membershipLevel  !== undefined && { membershipLevel: body.membershipLevel }),
          ...(body.membershipNumber !== undefined && { membershipNumber: body.membershipNumber }),
          ...(body.discountPercent  !== undefined && { discountPercent: body.discountPercent }),
          ...(body.membershipActive !== undefined && { isActive: body.membershipActive }),
        },
      })
    } else if (body.membershipLevel) {
      await prisma.membership.create({
        data: {
          guestId: id,
          membershipLevel: body.membershipLevel,
          membershipNumber: body.membershipNumber ?? `CC-${id}`,
          discountPercent: body.discountPercent ?? null,
          isActive: true,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PATCH /api/admin/members/[id] failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = toInt(params.id)
    if (!id) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 })

    // Delete memberships first (FK constraint)
    await prisma.membership.deleteMany({ where: { guestId: id } })
    await prisma.guest.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/members/[id] failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to delete member' }, { status: 500 })
  }
}