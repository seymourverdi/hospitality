import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function toPositiveInt(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

type RouteContext = {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const id = toPositiveInt(params.id)

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid user id',
        },
        { status: 400 }
      )
    }

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

    const user = await prisma.user.update({
      where: { id },
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
    console.error('PATCH /api/admin/users/[id] failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update user',
      },
      { status: 500 }
    )
  }
}