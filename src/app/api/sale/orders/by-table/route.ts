import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

function toPositiveInt(value: string | null): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) {
    return null
  }
  return n
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tableId = toPositiveInt(url.searchParams.get('tableId'))

    if (!tableId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'tableId is required',
        },
        { status: 400 }
      )
    }

    const table = await prisma.table.findFirst({
      where: {
        id: tableId,
        isActive: true,
      },
      include: {
        area: true,
        activeOrder: {
          include: {
            items: {
              where: {
                status: 'ACTIVE',
              },
              orderBy: {
                id: 'asc',
              },
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
                modifiers: {
                  include: {
                    modifierOption: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!table) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Table not found',
        },
        { status: 404 }
      )
    }

    const uiTable = {
      id: String(table.id),
      name: table.name,
      shape: table.capacity >= 5 ? 'circle' : 'rectangle',
      x: 40,
      y: 40,
      width: table.capacity >= 5 ? 64 : 84,
      height: table.capacity >= 5 ? 64 : 44,
      seats: [],
      maxSeats: table.capacity,
      floorId: String(table.areaId),
      status: table.status,
    }

    if (!table.activeOrder) {
      return NextResponse.json({
        ok: true,
        table: uiTable,
        order: null,
      })
    }

    const seatNumbers = Array.from(
      new Set(
        table.activeOrder.items
          .map((item) => item.seatNumber)
          .filter((seat): seat is number => typeof seat === 'number' && seat > 0)
      )
    ).sort((a, b) => a - b)

    const order = {
      id: table.activeOrder.id,
      status: table.activeOrder.status,
      items: table.activeOrder.items.map((item) => {
        const modifiers = item.modifiers.map((modifier) => ({
          groupId: String(modifier.modifierOption.modifierGroupId),
          optionId: String(modifier.modifierOptionId),
          name: modifier.modifierOption.name,
          priceAdjustment: Number(modifier.priceDelta ?? 0),
        }))

        const unitPrice =
          item.quantity > 0
            ? Number(item.finalPrice) / item.quantity
            : Number(item.finalPrice)

        return {
          id: item.id,
          product: {
            id: String(item.menuItem.id),
            name: item.menuItem.name,
            description: item.menuItem.description ?? '',
            price: unitPrice,
            available: '∞',
            allergens: [],
            categoryId: 'all',
            soldOut: false,
            hasRequiredModifiers: modifiers.length > 0,
          },
          qty: item.quantity,
          note: item.comment ?? '',
          modifiers,
        }
      }),
      seatNumbers,
    }

    return NextResponse.json({
      ok: true,
      table: uiTable,
      order,
    })
  } catch (error) {
    console.error('GET /api/sale/orders/by-table failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load order by table',
      },
      { status: 500 }
    )
  }
}