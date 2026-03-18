import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const [locations, categories, kdsStations, items] = await Promise.all([
      prisma.restaurantLocation.findMany({ where: { isActive: true }, orderBy: [{ id: 'asc' }], select: { id: true, name: true } }),
      prisma.menuCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true, name: true, locationId: true } }),
      prisma.kDSStation.findMany({ where: { isActive: true }, orderBy: [{ id: 'asc' }], select: { id: true, name: true } }),
      prisma.menuItem.findMany({
        orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
        select: {
          id: true, locationId: true, categoryId: true, name: true, sku: true,
          description: true, basePrice: true, taxRate: true, isAlcohol: true,
          isActive: true, kdsStationId: true,
          category:   { select: { id: true, name: true } },
          location:   { select: { id: true, name: true } },
          kdsStation: { select: { id: true, name: true } },
          modifierGroups: { select: { modifierGroup: { select: { id: true, name: true, isRequired: true } } } },
        },
      }),
    ])
    return NextResponse.json({
      ok: true, locations, categories, kdsStations,
      items: items.map(i => ({
        ...i,
        basePrice: i.basePrice.toString(),
        taxRate: i.taxRate?.toString() ?? null,
        modifierGroups: i.modifierGroups.map(mg => mg.modifierGroup),
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/menu/items failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to load items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const locationId  = Number(body.locationId)
    const categoryId  = Number(body.categoryId)
    const name        = String(body.name ?? '').trim()
    const basePrice   = String(body.basePrice ?? '0')
    const isActive    = Boolean(body.isActive ?? true)
    const kdsStationId = body.kdsStationId ? Number(body.kdsStationId) : null

    if (!Number.isInteger(locationId) || locationId <= 0) return NextResponse.json({ ok: false, error: 'Valid locationId required' }, { status: 400 })
    if (!Number.isInteger(categoryId) || categoryId <= 0) return NextResponse.json({ ok: false, error: 'Valid categoryId required' }, { status: 400 })
    if (!name) return NextResponse.json({ ok: false, error: 'Name required' }, { status: 400 })

    const item = await prisma.menuItem.create({
      data: { locationId, categoryId, name, basePrice, isActive, kdsStationId },
      select: { id: true },
    })
    return NextResponse.json({ ok: true, item })
  } catch (error) {
    console.error('POST /api/admin/menu/items failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to create item' }, { status: 500 })
  }
}