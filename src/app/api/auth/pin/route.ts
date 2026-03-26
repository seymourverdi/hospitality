import { NextResponse } from 'next/server'
import { pinLogin, PinAuthError } from '@/modules/pos/server/auth/pin-login'
import { setPosSession } from '@/modules/pos/server/session/pos-session'

type RequestBody = {
  pin?: string
  userId?: number | null
  terminalId?: string | null
  locationId?: string | null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody

    const session = await pinLogin({
      pin: body.pin ?? '',
      userId: body.userId ?? null,
      terminalId: body.terminalId ?? null,
      locationId: body.locationId ?? null,
    })

    await setPosSession(session)

    return NextResponse.json({
      ok: true,
      session,
    })
  } catch (error) {
    if (error instanceof PinAuthError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: error.statusCode },
      )
    }

    console.error('PIN login failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    )
  }
}