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
          error: 'Invalid area id',
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    const locationId = Number(body.locationId)
    const name = String(body.name ?? '').trim()
    const sortOrder =
      body.sortOrder == null || body.sortOrder === '' ? null : Number(body.sortOrder)
    const isActive = Boolean(body.isActive ?? true)

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Valid locationId is required',
        },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Name is required',
        },
        { status: 400 }
      )
    }

    const area = await prisma.area.update({
      where: { id },
      data: {
        locationId,
        name,
        sortOrder,
        isActive,
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({
      ok: true,
      area,
    })
  } catch (error) {
    console.error('PATCH /api/admin/areas/[id] failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update area',
      },
      { status: 500 }
    )
  }
}