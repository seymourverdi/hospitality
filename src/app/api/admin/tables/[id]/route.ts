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
          error: 'Invalid table id',
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    const locationId = Number(body.locationId)
    const areaId = Number(body.areaId)
    const name = String(body.name ?? '').trim()
    const capacity = Number(body.capacity)
    const status = String(body.status ?? 'available').trim()
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

    if (!Number.isInteger(areaId) || areaId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Valid areaId is required',
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

    if (!Number.isInteger(capacity) || capacity <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Valid capacity is required',
        },
        { status: 400 }
      )
    }

    const table = await prisma.table.update({
      where: { id },
      data: {
        locationId,
        areaId,
        name,
        capacity,
        status,
        isActive,
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({
      ok: true,
      table,
    })
  } catch (error) {
    console.error('PATCH /api/admin/tables/[id] failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update table',
      },
      { status: 500 }
    )
  }
}