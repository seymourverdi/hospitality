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
    const modifierGroupId = toPositiveInt(url.searchParams.get('modifierGroupId'))

    const [groups, options] = await Promise.all([
      prisma.modifierGroup.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          name: true,
          locationId: true,
        },
      }),
      prisma.modifierOption.findMany({
        where: {
          ...(modifierGroupId ? { modifierGroupId } : {}),
        },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          modifierGroupId: true,
          name: true,
          priceDelta: true,
          sortOrder: true,
          isActive: true,
          modifierGroup: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      ok: true,
      groups,
      options: options.map((option) => ({
        ...option,
        priceDelta: option.priceDelta?.toString() ?? null,
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/menu/modifier-options failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load modifier options',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const modifierGroupId = Number(body.modifierGroupId)
    const name = String(body.name ?? '').trim()
    const priceDelta = body.priceDelta ? String(body.priceDelta).trim() : null
    const sortOrder = body.sortOrder == null ? null : Number(body.sortOrder)
    const isActive = Boolean(body.isActive ?? true)

    if (!Number.isInteger(modifierGroupId) || modifierGroupId <= 0) {
      return NextResponse.json({ ok: false, error: 'Valid modifierGroupId is required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 })
    }

    const option = await prisma.modifierOption.create({
      data: {
        modifierGroupId,
        name,
        priceDelta,
        sortOrder,
        isActive,
      },
      select: { id: true },
    })

    return NextResponse.json({
      ok: true,
      option,
    })
  } catch (error) {
    console.error('POST /api/admin/menu/modifier-options failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create modifier option',
      },
      { status: 500 }
    )
  }
}