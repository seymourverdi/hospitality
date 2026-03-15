import { NextResponse } from 'next/server'
import { clearPosSession } from '@/modules/pos/server/session/pos-session'

export async function POST() {
  await clearPosSession()

  return NextResponse.json({
    ok: true,
  })
}