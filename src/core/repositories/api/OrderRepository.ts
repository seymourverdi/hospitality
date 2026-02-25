// src/core/repositories/api/OrderRepository.ts
import type { IOrderRepository, SubmitOrderData, Order as RepoOrder } from "@/core/repositories/types";
import type { OrderItem } from "@/modules/Sale/types";
import { ApiClient } from "./http";
import { buildUiOrder, toIdNumber, toIdString } from "./mappers";

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

export class ApiOrderRepository implements IOrderRepository {
  private api: ApiClient;
  private orders = new Map<string, RepoOrder>();

  constructor(api: ApiClient) {
    this.api = api;
  }

  async createOrder(items: OrderItem[]): Promise<RepoOrder> {
    const id = `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const order = buildUiOrder({
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

    const next = buildUiOrder({
      ...existing,
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

    return this.updateOrder(orderId, existing.items.filter((it) => it.id !== itemId));
  }

  async applyDiscount(orderId: string, tier: number | null): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    
    const discountPercent = tier ? tier : 0;

    const next = buildUiOrder({
      id: existing.id,
      items: existing.items,
      status: existing.status,
      createdAt: existing.createdAt,
      submittedAt: existing.submittedAt,
      tableId: existing.tableId,
      memberId: existing.memberId,
      memberName: existing.memberName,
      seatNumbers: existing.seatNumbers,
      discountPercent,
      scheduledTime: existing.scheduledTime ?? null,
    });

    this.orders.set(orderId, next);
    return next;
  }

  async setScheduledTime(orderId: string, time: Date | null): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    const next = buildUiOrder({
      ...existing,
      id: existing.id,
      items: existing.items,
      status: existing.status,
      createdAt: existing.createdAt,
      submittedAt: existing.submittedAt,
      scheduledTime: time,
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

    // 1) open/reuse order on table
    const tableIdNum = toIdNumber(data.tableId);
    const opened = await this.api.post<OpenOrderResponse>(`/api/pos/tables/${tableIdNum}/open-order`, {
      orderType: "DINE_IN",
    });

    const backendOrderId = opened.order.id;

    // 2) push items to backend
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

    // 3) return submitted order (UI side)
    const submitted = buildUiOrder({
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
      notes: data.notes ?? null,
    });

    this.orders.set(submitted.id, submitted);
    return submitted;
  }

  async cancelOrder(orderId: string): Promise<RepoOrder> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error("Order not found");

    // Если orderId уже backend-id, можно дернуть /api/pos/orders/:id/void
    // TODO: включить реальный cancel на backend когда решим правила.
    const cancelled = buildUiOrder({
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
    });

    this.orders.set(orderId, cancelled);
    return cancelled;
  }

  async getOrderById(orderId: string): Promise<RepoOrder | null> {
    return this.orders.get(orderId) ?? null;
  }
}