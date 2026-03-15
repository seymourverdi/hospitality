import type { PosTable } from '@/modules/pos/types/table'

type HospitalityTableLike = {
  id: string
  name: string
  capacity?: number | null
  activeOrderId?: string | null
  isReserved?: boolean | null
}

export function mapHospitalityTableToPosTable(
  table: HospitalityTableLike,
): PosTable {
  let status: PosTable['status'] = 'free'

  if (table.isReserved) {
    status = 'reserved'
  } else if (table.activeOrderId) {
    status = 'occupied'
  }

  return {
    id: table.id,
    name: table.name,
    status,
    seats: table.capacity ?? undefined,
    activeOrderId: table.activeOrderId ?? null,
  }
}