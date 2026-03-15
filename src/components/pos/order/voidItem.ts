import { authFetch, assertOk } from "@/lib/pos/auth-client";

export type VoidItemResult = {
  ok: true;
  alreadyVoided: boolean;
  item: { id: number; status: string };
  totals: unknown;
  kdsCleanup: {
    removedTicketItem: boolean;
    affectedTicketId: number | null;
    cancelledTicket: boolean;
  };
};

export async function voidItem(orderId: number, itemId: number, reason: string) {
  const res = await authFetch(`/api/pos/orders/${orderId}/items/${itemId}/void`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });

  return assertOk<VoidItemResult>(res);
}
