import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function toPositiveInt(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

export async function GET() {
  try {
    const [users, locations, roles] = await Promise.all([
      prisma.user.findMany({
        orderBy: [{ id: 'asc' }],
        select: {
          id: true,
          locationId: true,
          firstName: true,
          lastName: true,
          pinCode: true,
          email: true,
          phone: true,
          roleId: true,
          isActive: true,
          avatarColor: true,
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.restaurantLocation.findMany({
        where: { isActive: true },
        orderBy: [{ id: 'asc' }],
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.role.findMany({
        orderBy: [{ id: 'asc' }],
        select: {
          id: true,
          name: true,
        },
      }),
    ])

    return NextResponse.json({
      ok: true,
      users,
      locations,
      roles,
    })
  } catch (error) {
    console.error('GET /api/admin/users failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load users',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const locationId = toPositiveInt(body.locationId)
    const roleId = toPositiveInt(body.roleId)
    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const pinCode = String(body.pinCode ?? '').trim()
    const email = body.email ? String(body.email).trim() : null
    const phone = body.phone ? String(body.phone).trim() : null
    const isActive = Boolean(body.isActive ?? true)
    const avatarColor = body.avatarColor ? String(body.avatarColor).trim() : null

    if (!locationId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Valid locationId is required',
        },
        { status: 400 }
      )
    }

    if (!roleId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Valid roleId is required',
        },
        { status: 400 }
      )
    }

    if (!firstName || !lastName || !pinCode) {
      return NextResponse.json(
        {
          ok: false,
          error: 'firstName, lastName and pinCode are required',
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        locationId,
        roleId,
        firstName,
        lastName,
        pinCode,
        email,
        phone,
        isActive,
        avatarColor,
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({
      ok: true,
      user,
    })
  } catch (error) {
    console.error('POST /api/admin/users failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create user',
      },
      { status: 500 }
    )
  }
}