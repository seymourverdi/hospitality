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
    groupId: string
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const itemId = toPositiveInt(params.id)
    const groupId = toPositiveInt(params.groupId)

    if (!itemId || !groupId) {
      return NextResponse.json({ ok: false, error: 'Invalid ids' }, { status: 400 })
    }

    await prisma.menuItemModifierGroup.delete({
      where: {
        menuItemId_modifierGroupId: {
          menuItemId: itemId,
          modifierGroupId: groupId,
        },
      },
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error('DELETE /api/admin/menu/items/[id]/modifier-groups/[groupId] failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to unlink modifier group from item',
      },
      { status: 500 }
    )
  }
}