import type {
  IOrderRepository,
  SubmitOrderData,
  Order as RepoOrder,
} from "@/core/repositories/types";
import type { OrderItem } from "@/modules/Sale/types";
import { ApiClient } from "./http";
import { toIdNumber, toIdString } from "./mappers";

type OpenOrderResponse = {
  ok: true;
  reused: boolean;
  order: { id: number; tableId: number; status: string; orderType: string };
};

type AddItemResponse = {
  ok: true;
  orderId: number;
  item: unknown;
  totals: {
    subtotalAmount: string;
    discountAmount: string;
    serviceChargeAmount: string;
    taxAmount: string;
    totalAmount: string;
  };
};

function buildRepoOrder(params: {
  id: string;
  items: OrderItem[];
  status: RepoOrder["status"];
  createdAt?: Date;
  submittedAt?: Date;
  tableId?: string;
  memberId?: string;
  memberName?: string;
  seatNumbers?: number[];
  scheduledTime?: Date | null;
  discountPercent?: number;
}): RepoOrder {
  const subtotal = params.items.reduce((sum, it) => sum + it.price, 0);
  const discountPercent = params.discountPercent ?? 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableSubtotal = subtotal - discountAmount;
  const tax = 0;
  const total = taxableSubtotal + tax;

  return {
    id: params.id,
    orderNumber: params.id,
    status: params.status,
    items: params.items,
    memberId: params.memberId,
    memberName: params.memberName,
    tableId: params.tableId,
    seatNumbers: params.seatNumbers,
    subtotal,
    discountPercent,
    tax,
    total,
    scheduledTime: params.scheduledTime ?? undefined,
    createdAt: params.createdAt ?? new Date(),
    submittedAt: params.submittedAt ?? undefined,
  };
}

export class ApiOrderRepository implements IOrderRepository {
  private api: ApiClient;
  private orders = new Map<string, RepoOrder>();

  constructor(api: ApiClient) {
    this.api = api;
  }

  async createOrder(items: OrderItem[]): Promise<RepoOrder> {
    const id = `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const order = buildRepoOrder({
      id,
      items,
      status: "draft",
      createdAt: new Date(),
    });

    this.orders.set(order.id, order);
    return order;
  }

  async updateOrder(orderId: string, items: OrderItem[]): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    const next = buildRepoOrder({
      id: existing.id,
      items,
      status: existing.status,
      createdAt: existing.createdAt,
      submittedAt: existing.submittedAt,
      tableId: existing.tableId,
      memberId: existing.memberId,
      memberName: existing.memberName,
      seatNumbers: existing.seatNumbers,
      scheduledTime: existing.scheduledTime ?? null,
      discountPercent: existing.discountPercent,
    });

    this.orders.set(orderId, next);
    return next;
  }

  async addLineItem(orderId: string, item: OrderItem): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    return this.updateOrder(orderId, [...existing.items, item]);
  }

  async updateLineItem(orderId: string, itemId: string, quantity: number): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    const nextItems = existing.items.map((it) => {
      if (it.id !== itemId) return it;
      const qty = Math.max(0, quantity);
      const unitPrice = it.unitPrice;
      return { ...it, qty, price: unitPrice * qty };
    });

    return this.updateOrder(orderId, nextItems);
  }

  async removeLineItem(orderId: string, itemId: string): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    return this.updateOrder(
      orderId,
      existing.items.filter((it) => it.id !== itemId)
    );
  }

  async applyDiscount(orderId: string, tier: number | null): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    const discountPercent = tier ?? 0;

    const next = buildRepoOrder({
      id: existing.id,
      items: existing.items,
      status: existing.status,
      createdAt: existing.createdAt,
      submittedAt: existing.submittedAt,
      tableId: existing.tableId,
      memberId: existing.memberId,
      memberName: existing.memberName,
      seatNumbers: existing.seatNumbers,
      scheduledTime: existing.scheduledTime ?? null,
      discountPercent,
    });

    this.orders.set(orderId, next);
    return next;
  }

  async setScheduledTime(orderId: string, time: Date | null): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    const next = buildRepoOrder({
      id: existing.id,
      items: existing.items,
      status: existing.status,
      createdAt: existing.createdAt,
      submittedAt: existing.submittedAt,
      tableId: existing.tableId,
      memberId: existing.memberId,
      memberName: existing.memberName,
      seatNumbers: existing.seatNumbers,
      scheduledTime: time,
      discountPercent: existing.discountPercent,
    });

    this.orders.set(orderId, next);
    return next;
  }

  async submitOrder(orderId: string, data: SubmitOrderData): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    if (!data.tableId) {
      throw new Error("tableId is required to submit order (backend requires table)");
    }

    const tableIdNum = toIdNumber(data.tableId);
    const opened = await this.api.post<OpenOrderResponse>(
      `/api/pos/tables/${tableIdNum}/open-order`,
      {
        orderType: "DINE_IN",
      }
    );

    const backendOrderId = opened.order.id;

    for (const it of existing.items) {
      const menuItemId = toIdNumber(it.productId);
      const modifierOptionIds = (it.modifiers ?? []).map((m) => toIdNumber(m.optionId));
      const seatNumber =
        data.seatNumbers && data.seatNumbers.length > 0 ? data.seatNumbers[0] : null;

      await this.api.post<AddItemResponse>(`/api/pos/orders/${backendOrderId}/items`, {
        menuItemId,
        quantity: it.qty,
        seatNumber,
        comment: it.note ?? null,
        modifierOptionIds,
      });
    }

    const submitted = buildRepoOrder({
      id: toIdString(backendOrderId),
      items: existing.items,
      status: "submitted",
      createdAt: existing.createdAt,
      submittedAt: new Date(),
      tableId: data.tableId,
      memberId: data.memberId,
      memberName: existing.memberName,
      seatNumbers: data.seatNumbers,
      scheduledTime: data.scheduledTime ?? null,
      discountPercent: existing.discountPercent,
    });

    this.orders.set(submitted.id, submitted);
    return submitted;
  }

  async cancelOrder(orderId: string): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    const cancelled = buildRepoOrder({
      id: existing.id,
      items: existing.items,
      status: "cancelled",
      createdAt: existing.createdAt,
      submittedAt: existing.submittedAt,
      tableId: existing.tableId,
      memberId: existing.memberId,
      memberName: existing.memberName,
      seatNumbers: existing.seatNumbers,
      scheduledTime: existing.scheduledTime ?? null,
      discountPercent: existing.discountPercent,
    });

    this.orders.set(orderId, cancelled);
    return cancelled;
  }

  async getOrderById(orderId: string): Promise<RepoOrder | null> {
    return this.orders.get(orderId) ?? null;
  }
}