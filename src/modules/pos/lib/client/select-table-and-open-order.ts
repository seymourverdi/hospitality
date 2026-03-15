import { setSelectedTableId } from '@/modules/pos/lib/client/selected-table'

type SelectTableAndOpenOrderResult = {
  ok: boolean
  orderId?: string
  error?: string
}

export async function selectTableAndOpenOrder(
  tableId: string,
): Promise<SelectTableAndOpenOrderResult> {
  setSelectedTableId(tableId)

  const response = await fetch(`/api/pos/tables/${tableId}/open-order`, {
    method: 'POST',
  })

  const data = (await response.json()) as {
    ok: boolean
    orderId?: string
    error?: string
  }

  if (!response.ok || !data.ok) {
    return {
      ok: false,
      error: data.error || 'Failed to open order',
    }
  }

  return {
    ok: true,
    orderId: data.orderId,
  }
}