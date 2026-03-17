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

    const [locations, groups] = await Promise.all([
      prisma.restaurantLocation.findMany({
        where: { isActive: true },
        orderBy: [{ id: 'asc' }],
        select: { id: true, name: true },
      }),
      prisma.modifierGroup.findMany({
        where: {
          ...(locationId ? { locationId } : {}),
        },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          locationId: true,
          name: true,
          minSelected: true,
          maxSelected: true,
          isRequired: true,
          sortOrder: true,
          isActive: true,
          location: {
            select: { id: true, name: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      ok: true,
      locations,
      groups,
    })
  } catch (error) {
    console.error('GET /api/admin/menu/modifier-groups failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load modifier groups',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const locationId = Number(body.locationId)
    const name = String(body.name ?? '').trim()
    const minSelected = body.minSelected == null ? null : Number(body.minSelected)
    const maxSelected = body.maxSelected == null ? null : Number(body.maxSelected)
    const isRequired = Boolean(body.isRequired ?? false)
    const sortOrder = body.sortOrder == null ? null : Number(body.sortOrder)
    const isActive = Boolean(body.isActive ?? true)

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return NextResponse.json({ ok: false, error: 'Valid locationId is required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 })
    }

    const group = await prisma.modifierGroup.create({
      data: {
        locationId,
        name,
        minSelected,
        maxSelected,
        isRequired,
        sortOrder,
        isActive,
      },
      select: { id: true },
    })

    return NextResponse.json({
      ok: true,
      group,
    })
  } catch (error) {
    console.error('POST /api/admin/menu/modifier-groups failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create modifier group',
      },
      { status: 500 }
    )
  }
}