import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const locations = await prisma.restaurantLocation.findMany({
      orderBy: [{ id: 'asc' }],
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
      locations,
    })
  } catch (error) {
    console.error('GET /api/admin/locations failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load locations',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
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

    const location = await prisma.restaurantLocation.create({
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
    console.error('POST /api/admin/locations failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create location',
      },
      { status: 500 }
    )
  }
}