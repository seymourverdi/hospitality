import type { PosRole, PosSession } from '@/modules/pos/types/session'
import { prisma } from '@/server/db'

export class PinAuthError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'PinAuthError'
    this.statusCode = statusCode
  }
}

type PinLoginInput = {
  pin: string
  userId?: number | null
  terminalId?: string | null
  locationId?: string | null
}

function mapRole(roleName: string | null | undefined): PosRole {
  const value = (roleName || '').toLowerCase()

  if (value.includes('admin')) {
    return 'admin'
  }

  if (value.includes('manager')) {
    return 'manager'
  }

  return 'cashier'
}

export async function pinLogin(input: PinLoginInput): Promise<PosSession> {
  const pin = input.pin.trim()

  if (!pin) {
    throw new PinAuthError('PIN is required', 400)
  }

  console.log('[PIN-LOGIN] Attempting login with PIN length:', pin.length, '| PIN (masked):', pin.slice(0, 1) + '***')

  const user = await prisma.user.findFirst({
    where: {
      pinCode: pin,
      isActive: true,
      ...(input.userId ? { id: input.userId } : {}),
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!user) {
    console.warn('[PIN-LOGIN] No active user found for given PIN')
    throw new PinAuthError('Invalid PIN', 401)
  }

  console.log('[PIN-LOGIN] Found user:', user.firstName, user.lastName, '| id:', user.id, '| role:', user.role?.name)

  return {
    userId: String(user.id),
    employeeId: String(user.id),
    terminalId: input.terminalId ?? null,
    locationId:
      input.locationId ?? (user.locationId ? String(user.locationId) : null),
    role: mapRole(user.role?.name),
    pinAuthenticatedAt: new Date().toISOString(),
  }
}