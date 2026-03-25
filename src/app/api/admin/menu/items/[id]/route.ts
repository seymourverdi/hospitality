import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'

type RouteContext = { params: { id: string } }

function toInt(v: string) {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const id = toInt(params.id)
    if (!id) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 })

    const body = await request.json() as {
      name?:         string
      description?:  string | null
      locationId?:   number
      categoryId?:   number
      kdsStationId?: number | null
      isActive?:     boolean
      basePrice?:    string
      isAlcohol?:    boolean
      allergens?:    string[]
    }

    await prisma.menuItem.update({
      where: { id },
      data: {
        ...(body.name         !== undefined && { name: body.name }),
        ...(body.description  !== undefined && { description: body.description }),
        ...(body.locationId   !== undefined && { locationId: body.locationId }),
        ...(body.categoryId   !== undefined && { categoryId: body.categoryId }),
        ...(body.kdsStationId !== undefined && { kdsStationId: body.kdsStationId }),
        ...(body.isActive     !== undefined && { isActive: body.isActive }),
        ...(body.basePrice    !== undefined && { basePrice: body.basePrice }),
        ...(body.isAlcohol    !== undefined && { isAlcohol: body.isAlcohol }),
        ...(body.allergens    !== undefined && { allergens: body.allergens }),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PATCH /api/admin/menu/items/[id] failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to update item' }, { status: 500 })
  }
}