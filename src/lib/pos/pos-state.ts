const TABLE_KEY = "pos_selected_table_id_v1";

export function getSelectedTableId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TABLE_KEY);
    const n = raw ? Number(raw) : Number.NaN;
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function setSelectedTableId(tableId: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isInteger(tableId) || tableId <= 0) return;
  window.localStorage.setItem(TABLE_KEY, String(tableId));
}

export function clearSelectedTableId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TABLE_KEY);
}