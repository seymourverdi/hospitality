import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      where: {
        isActive: true,
      },
      include: {
        tables: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
          include: {
            activeOrder: {
              include: {
                items: {
                  where: {
                    status: 'ACTIVE',
                  },
                  select: {
                    id: true,
                    quantity: true,
                    finalPrice: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    const floors = areas.map((area) => ({
      id: String(area.id),
      name: area.name,
      tables: area.tables.map((table, index) => {
        const activeOrder = table.activeOrder

        const itemCount = activeOrder
          ? activeOrder.items.reduce((sum, item) => sum + item.quantity, 0)
          : 0

        const totalAmount = activeOrder
          ? activeOrder.items.reduce((sum, item) => sum + Number(item.finalPrice), 0)
          : 0

        return {
          id: String(table.id),
          name: table.name,
          shape: table.capacity >= 5 ? 'circle' : 'rectangle',
          x: 40 + (index % 4) * 110,
          y: 40 + Math.floor(index / 4) * 110,
          width: table.capacity >= 5 ? 64 : 84,
          height: table.capacity >= 5 ? 64 : 44,
          seats: [],
          maxSeats: table.capacity,
          floorId: String(area.id),
          status: table.status,
          activeOrder: activeOrder
            ? {
                id: activeOrder.id,
                status: activeOrder.status,
                itemCount,
                totalAmount: Number(totalAmount.toFixed(2)),
              }
            : null,
        }
      }),
    }))

    return NextResponse.json({
      ok: true,
      floors,
    })
  } catch (error) {
    console.error('GET /api/sale/tables failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load tables',
      },
      { status: 500 },
    )
  }
}