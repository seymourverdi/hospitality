// City Club HMS - Repository Interfaces
// Swappable data sources for products, members, and orders

import type { Product, Member, OrderItem, CategoryId } from '@/modules/Sale/types';

// ============================================
// PRODUCT REPOSITORY
// ============================================

export interface IProductRepository {
  /**
   * Get all products, optionally filtered by category
   */
  getProducts(categoryId?: CategoryId): Promise<Product[]>;

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Promise<Product | null>;

  /**
   * Search products by name
   */
  searchProducts(query: string): Promise<Product[]>;

  /**
   * Get product availability count
   */
  getAvailability(productId: string): Promise<number | '∞'>;
}

// ============================================
// MEMBER REPOSITORY
// ============================================

export interface IMemberRepository {
  /**
   * Search members by name
   */
  searchMembers(query: string): Promise<Member[]>;

  /**
   * Get recently active members (for quick select)
   */
  getRecentMembers(limit?: number): Promise<Member[]>;

  /**
   * Get a single member by ID
   */
  getMemberById(id: string): Promise<Member | null>;

  /**
   * Get member by account number
   */
  getMemberByAccount(accountNumber: string): Promise<Member | null>;
}

// ============================================
// ORDER REPOSITORY
// ============================================

export interface SubmitOrderData {
  memberId?: string;
  isNonMember: boolean;
  nonMemberEmail?: string;
  tableId?: string;
  seatNumbers?: number[];
  discountTier?: number | null;
  scheduledTime?: Date | null;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'draft' | 'submitted' | 'completed' | 'cancelled';
  items: OrderItem[];
  memberId?: string;
  memberName?: string;
  tableId?: string;
  seatNumbers?: number[];
  subtotal: number;
  discountPercent: number;
  tax: number;
  total: number;
  scheduledTime?: Date;
  createdAt: Date;
  submittedAt?: Date;
}

export interface IOrderRepository {
  /**
   * Create a new order with initial items
   */
  createOrder(items: OrderItem[]): Promise<Order>;

  /**
   * Update an existing order's line items
   */
  updateOrder(orderId: string, items: OrderItem[]): Promise<Order>;

  /**
   * Add a line item to an order
   */
  addLineItem(orderId: string, item: OrderItem): Promise<Order>;

  /**
   * Update a line item quantity
   */
  updateLineItem(orderId: string, itemId: string, quantity: number): Promise<Order>;

  /**
   * Remove a line item from an order
   */
  removeLineItem(orderId: string, itemId: string): Promise<Order>;

  /**
   * Apply a discount tier to an order
   */
  applyDiscount(orderId: string, tier: number | null): Promise<Order>;

  /**
   * Set scheduled time for an order
   */
  setScheduledTime(orderId: string, time: Date | null): Promise<Order>;

  /**
   * Submit order for processing
   */
  submitOrder(orderId: string, data: SubmitOrderData): Promise<Order>;

  /**
   * Cancel an order
   */
  cancelOrder(orderId: string): Promise<Order>;

  /**
   * Get an order by ID
   */
  getOrderById(orderId: string): Promise<Order | null>;
}

// ============================================
// REPOSITORY FACTORY
// ============================================

export interface RepositoryConfig {
  useOptix: boolean;
  locationId?: string;
}

export interface Repositories {
  products: IProductRepository;
  members: IMemberRepository;
  orders: IOrderRepository;
}
