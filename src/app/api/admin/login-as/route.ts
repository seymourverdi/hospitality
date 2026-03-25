import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { setPosSession } from '@/modules/pos/server/session/pos-session'

function mapRole(roleName: string | null | undefined): 'admin' | 'manager' | 'cashier' {
  const v = (roleName ?? '').toLowerCase()
  if (v.includes('admin')) return 'admin'
  if (v.includes('manager')) return 'manager'
  return 'cashier'
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId?: number }
    const userId = Number(body.userId)
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ ok: false, error: 'Invalid userId' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { select: { name: true } } },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ ok: false, error: 'User not found or inactive' }, { status: 404 })
    }

    await setPosSession({
      userId: String(user.id),
      employeeId: String(user.id),
      terminalId: null,
      locationId: user.locationId ? String(user.locationId) : null,
      role: mapRole(user.role?.name),
      pinAuthenticatedAt: new Date().toISOString(),
    })

    console.log('[LOGIN-AS] Switched to user:', user.firstName, user.lastName, '| id:', user.id)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[LOGIN-AS] error', e)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}