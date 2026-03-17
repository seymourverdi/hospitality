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

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const itemId = toPositiveInt(params.id)

    if (!itemId) {
      return NextResponse.json({ ok: false, error: 'Invalid item id' }, { status: 400 })
    }

    const links = await prisma.menuItemModifierGroup.findMany({
      where: { menuItemId: itemId },
      select: {
        id: true,
        modifierGroup: {
          select: {
            id: true,
            name: true,
            isRequired: true,
            minSelected: true,
            maxSelected: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ id: 'asc' }],
    })

    return NextResponse.json({
      ok: true,
      groups: links.map((link) => ({
        id: link.modifierGroup.id,
        name: link.modifierGroup.name,
        isRequired: link.modifierGroup.isRequired,
        minSelected: link.modifierGroup.minSelected,
        maxSelected: link.modifierGroup.maxSelected,
        isActive: link.modifierGroup.isActive,
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/menu/items/[id]/modifier-groups failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load item modifier groups',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const itemId = toPositiveInt(params.id)

    if (!itemId) {
      return NextResponse.json({ ok: false, error: 'Invalid item id' }, { status: 400 })
    }

    const body = await request.json()
    const modifierGroupId = Number(body.modifierGroupId)

    if (!Number.isInteger(modifierGroupId) || modifierGroupId <= 0) {
      return NextResponse.json({ ok: false, error: 'Valid modifierGroupId is required' }, { status: 400 })
    }

    const link = await prisma.menuItemModifierGroup.upsert({
      where: {
        menuItemId_modifierGroupId: {
          menuItemId: itemId,
          modifierGroupId,
        },
      },
      update: {},
      create: {
        menuItemId: itemId,
        modifierGroupId,
      },
      select: { id: true },
    })

    return NextResponse.json({
      ok: true,
      link,
    })
  } catch (error) {
    console.error('POST /api/admin/menu/items/[id]/modifier-groups failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to link modifier group to item',
      },
      { status: 500 }
    )
  }
}