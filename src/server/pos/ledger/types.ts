export type LedgerEventType =
  | "PAYMENT_PENDING"
  | "PAYMENT_APPROVED"
  | "PAYMENT_DECLINED"
  | "REFUND_APPROVED";

export type LedgerEvent = {
  type: LedgerEventType;

  // identity
  id: number;
  orderId: number;

  // money
  amount: string; // decimal string

  // payment-ish
  paymentId?: number | null;
  paymentMethod?: "CASH" | "CARD" | "VOUCHER" | "ROOM" | "EXTERNAL" | null;

  // provider refs
  provider?: string | null;
  transactionId?: string | null;
  refundTransactionId?: string | null;

  // audit
  reason?: string | null;
  status: "PENDING" | "APPROVED" | "DECLINED" | "REFUNDED";
  at: string; // ISO
};

export type LedgerQuery = {
  types?: LedgerEventType[];
  since?: string; // ISO
  limit?: number; // default 100
};
