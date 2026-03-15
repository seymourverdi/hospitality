import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const params = await context.params
    const menuItemId = Number(params.id)

    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid menu item id',
        },
        { status: 400 },
      )
    }

    const groups = await prisma.modifierGroup.findMany({
      where: {
        isActive: true,
        menuItems: {
          some: {
            menuItemId,
          },
        },
      },
      include: {
        options: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json({
      ok: true,
      groups: groups.map((group) => ({
        id: String(group.id),
        name: group.name,
        required: group.isRequired,
        maxSelections: group.maxSelected ?? null,
        minSelections: group.minSelected ?? 0,
        options: group.options.map((option) => ({
          id: String(option.id),
          name: option.name,
          priceAdjustment: Number(option.priceDelta ?? 0),
        })),
      })),
    })
  } catch (error) {
    console.error('GET /api/sale/menu/items/[id]/modifier-groups failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load modifier groups',
      },
      { status: 500 },
    )
  }
}