import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function toPositiveInt(value: string): number | null {
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
          error: 'Invalid location id',
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    const name = String(body.name ?? '').trim()
    const code = body.code ? String(body.code).trim() : null
    const timezone = body.timezone ? String(body.timezone).trim() : null
    const address = body.address ? String(body.address).trim() : null
    const phone = body.phone ? String(body.phone).trim() : null
    const isActive = Boolean(body.isActive ?? true)

    if (!name) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Name is required',
        },
        { status: 400 }
      )
    }

    const location = await prisma.restaurantLocation.update({
      where: { id },
      data: {
        name,
        code,
        timezone,
        address,
        phone,
        isActive,
      },
      select: {
        id: true,
        name: true,
        code: true,
        timezone: true,
        address: true,
        phone: true,
        isActive: true,
      },
    })

    return NextResponse.json({
      ok: true,
      location,
    })
  } catch (error) {
    console.error('PATCH /api/admin/locations/[id] failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update location',
      },
      { status: 500 }
    )
  }
}