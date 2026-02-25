// City Club HMS - Mock Order Repository
// In-memory order management for development

import type { IOrderRepository, Order, SubmitOrderData } from '../types';
import type { OrderItem } from '@/modules/Sale/types';

const TAX_RATE = 0.1157; // 11.57%

// In-memory order storage
const orders = new Map<string, Order>();

function generateOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateOrderNumber(): string {
  const date = new Date();
  const prefix = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CC-${prefix}-${suffix}`;
}

function calculateTotals(items: OrderItem[], discountPercent: number): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;

  return { subtotal, tax, total };
}

export class MockOrderRepository implements IOrderRepository {
  async createOrder(items: OrderItem[]): Promise<Order> {
    await this.delay(100);

    const { subtotal, tax, total } = calculateTotals(items, 0);

    const order: Order = {
      id: generateOrderId(),
      orderNumber: generateOrderNumber(),
      status: 'draft',
      items,
      subtotal,
      discountPercent: 0,
      tax,
      total,
      createdAt: new Date(),
    };

    orders.set(order.id, order);
    return order;
  }

  async updateOrder(orderId: string, items: OrderItem[]): Promise<Order> {
    await this.delay(50);

    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const { subtotal, tax, total } = calculateTotals(items, order.discountPercent);

    const updated: Order = {
      ...order,
      items,
      subtotal,
      tax,
      total,
    };

    orders.set(orderId, updated);
    return updated;
  }

  async addLineItem(orderId: string, item: OrderItem): Promise<Order> {
    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const items = [...order.items, item];
    return this.updateOrder(orderId, items);
  }

  async updateLineItem(orderId: string, itemId: string, quantity: number): Promise<Order> {
    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const items = order.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          qty: quantity,
          price: item.unitPrice * quantity,
        };
      }
      return item;
    });

    return this.updateOrder(orderId, items);
  }

  async removeLineItem(orderId: string, itemId: string): Promise<Order> {
    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const items = order.items.filter((item) => item.id !== itemId);
    return this.updateOrder(orderId, items);
  }

  async applyDiscount(orderId: string, tier: number | null): Promise<Order> {
    await this.delay(50);

    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const discountPercent = tier ?? 0;
    const { subtotal, tax, total } = calculateTotals(order.items, discountPercent);

    const updated: Order = {
      ...order,
      discountPercent,
      subtotal,
      tax,
      total,
    };

    orders.set(orderId, updated);
    return updated;
  }

  async setScheduledTime(orderId: string, time: Date | null): Promise<Order> {
    await this.delay(50);

    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updated: Order = {
      ...order,
      scheduledTime: time ?? undefined,
    };

    orders.set(orderId, updated);
    return updated;
  }

  async submitOrder(orderId: string, data: SubmitOrderData): Promise<Order> {
    await this.delay(200);

    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updated: Order = {
      ...order,
      status: 'submitted',
      memberId: data.memberId,
      tableId: data.tableId,
      seatNumbers: data.seatNumbers,
      scheduledTime: data.scheduledTime ?? undefined,
      submittedAt: new Date(),
    };

    orders.set(orderId, updated);
    return updated;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    await this.delay(50);

    const order = orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updated: Order = {
      ...order,
      status: 'cancelled',
    };

    orders.set(orderId, updated);
    return updated;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    await this.delay(50);
    return orders.get(orderId) || null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
