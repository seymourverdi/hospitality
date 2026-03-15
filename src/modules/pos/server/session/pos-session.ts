import { cookies } from 'next/headers'
import type { PosSession } from '@/modules/pos/types/session'

const POS_SESSION_COOKIE = 'pos_session_v1'

function encodeSession(session: PosSession): string {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
}

function decodeSession(value: string): PosSession | null {
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8')
    return JSON.parse(json) as PosSession
  } catch {
    return null
  }
}

export async function getPosSession(): Promise<PosSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(POS_SESSION_COOKIE)?.value

  if (!raw) {
    return null
  }

  return decodeSession(raw)
}

export async function setPosSession(session: PosSession): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(POS_SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export async function clearPosSession(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(POS_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })
}