import type { PosSession } from '@/modules/pos/types/session'

type PinLoginInput = {
  pin: string
  terminalId?: string | null
  locationId?: string | null
}

type PinLoginResponse = {
  ok: boolean
  session?: PosSession
  error?: string
}

export async function pinLoginRequest(
  input: PinLoginInput,
): Promise<PinLoginResponse> {
  const response = await fetch('/api/auth/pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const data = (await response.json()) as PinLoginResponse

  if (!response.ok) {
    return {
      ok: false,
      error: data.error || 'PIN login failed',
    }
  }

  return data
}