import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const locationIdRaw = url.searchParams.get('locationId')
    const locationId =
      locationIdRaw && Number.isInteger(Number(locationIdRaw)) && Number(locationIdRaw) > 0
        ? Number(locationIdRaw)
        : null

    const areas = await prisma.area.findMany({
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
      },
    })

    return NextResponse.json({
      ok: true,
      areas,
    })
  } catch (error) {
    console.error('GET /api/admin/areas failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load areas',
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

    const area = await prisma.area.create({
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
    console.error('POST /api/admin/areas failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create area',
      },
      { status: 500 }
    )
  }
}