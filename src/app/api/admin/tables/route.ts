import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function toPositiveInt(value: string | null): number | null {
  if (!value) return null
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const locationId = toPositiveInt(url.searchParams.get('locationId'))
    const areaId = toPositiveInt(url.searchParams.get('areaId'))

    const [locations, areas, tables] = await Promise.all([
      prisma.restaurantLocation.findMany({
        where: { isActive: true },
        orderBy: [{ id: 'asc' }],
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.area.findMany({
        where: {
          ...(locationId ? { locationId } : {}),
        },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          locationId: true,
          name: true,
          sortOrder: true,
          isActive: true,
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tables: true,
            },
          },
        },
      }),
      prisma.table.findMany({
        where: {
          ...(locationId ? { locationId } : {}),
          ...(areaId ? { areaId } : {}),
        },
        orderBy: [{ id: 'asc' }],
        select: {
          id: true,
          locationId: true,
          areaId: true,
          name: true,
          capacity: true,
          status: true,
          isActive: true,
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          area: {
            select: {
              id: true,
              name: true,
            },
          },
          activeOrderId: true,
          activeOrder: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              openedAt: true,
              _count: { select: { items: true } },
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      ok: true,
      locations,
      areas,
      tables: tables.map(t => ({
        ...t,
        activeOrder: t.activeOrder ? {
          ...t.activeOrder,
          totalAmount: t.activeOrder.totalAmount.toString(),
          openedAt: t.activeOrder.openedAt.toISOString(),
          itemCount: t.activeOrder._count.items,
        } : null,
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/tables failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load tables admin data',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
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

    const table = await prisma.table.create({
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
    console.error('POST /api/admin/tables failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create table',
      },
      { status: 500 }
    )
  }
}