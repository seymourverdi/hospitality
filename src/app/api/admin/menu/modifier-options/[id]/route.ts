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

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const id = toPositiveInt(params.id)

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Invalid modifier option id' }, { status: 400 })
    }

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

    const option = await prisma.modifierOption.update({
      where: { id },
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
    console.error('PATCH /api/admin/menu/modifier-options/[id] failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update modifier option',
      },
      { status: 500 }
    )
  }
}