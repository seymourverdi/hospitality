const SELECTED_TABLE_ID_KEY = 'pos_selected_table_id_v1'

export function getSelectedTableId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(SELECTED_TABLE_ID_KEY)
}

export function setSelectedTableId(tableId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SELECTED_TABLE_ID_KEY, tableId)
}

export function clearSelectedTableId(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SELECTED_TABLE_ID_KEY)
}