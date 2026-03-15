export type PosTableStatus = 'free' | 'occupied' | 'reserved'

export type PosTable = {
  id: string
  name: string
  status: PosTableStatus
  seats?: number
  activeOrderId?: string | null
}