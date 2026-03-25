import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarColor: true,
        role: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ ok: true, users })
  } catch (error) {
    console.error('GET /api/login/users failed', error)
    return NextResponse.json({ ok: false, error: 'Failed' }, { status: 500 })
  }
}