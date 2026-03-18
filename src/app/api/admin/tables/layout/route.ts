import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type TableLayout = {
  id: number
  x: number
  y: number
  shape: 'square' | 'round'
  seats: number
}

type TablesConfig = {
  layouts: TableLayout[]
}

const defaultTablesConfig: TablesConfig = { layouts: [] }

async function getLocationId(): Promise<number | null> {
  const loc = await prisma.restaurantLocation.findFirst({
    where: { isActive: true },
    orderBy: { id: 'asc' },
    select: { id: true },
  })
  return loc?.id ?? null
}

export async function GET() {
  try {
    const locationId = await getLocationId()
    if (!locationId) {
      return NextResponse.json({ ok: true, layouts: [] })
    }

    const settings = await prisma.locationSettings.findUnique({
      where: { locationId },
      select: { tablesConfig: true },
    })

    const config = (settings?.tablesConfig ?? defaultTablesConfig) as TablesConfig
    return NextResponse.json({ ok: true, layouts: config.layouts ?? [] })
  } catch (error) {
    console.error('GET /api/admin/tables/layout failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to load layout' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const locationId = await getLocationId()
    if (!locationId) {
      return NextResponse.json({ ok: false, error: 'No active location found' }, { status: 400 })
    }

    const body = await request.json() as { layouts: TableLayout[] }
    if (!Array.isArray(body.layouts)) {
      return NextResponse.json({ ok: false, error: 'layouts array required' }, { status: 400 })
    }

    await prisma.locationSettings.upsert({
      where: { locationId },
      create: {
        locationId,
        statsConfig: {},
        saleConfig: {},
        rsvpConfig: {},
        displayConfig: {},
        tablesConfig: { layouts: body.layouts },
        filterConfig: {},
        logConfig: {},
      },
      update: {
        tablesConfig: { layouts: body.layouts },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PUT /api/admin/tables/layout failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to save layout' }, { status: 500 })
  }
}