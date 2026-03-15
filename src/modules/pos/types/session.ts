export type PosRole = 'cashier' | 'manager' | 'admin'

export type PosSession = {
  userId: string
  employeeId?: string | null
  terminalId?: string | null
  locationId?: string | null
  role: PosRole
  pinAuthenticatedAt: string
}