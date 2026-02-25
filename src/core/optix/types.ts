// City Club HMS - Optix API Types
// Type definitions matching Optix GraphQL schema

// ============================================
// PRODUCT TYPES
// ============================================

export interface OptixModifier {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface OptixModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  modifiers: OptixModifier[];
}

export interface OptixCategory {
  id: string;
  name: string;
  color: string;
}

export interface OptixProduct {
  id: string;
  name: string;
  price: number;
  description: string | null;
  availableQuantity: number | null;
  isAvailable: boolean;
  allergens: string[];
  category: OptixCategory;
  modifierGroups: OptixModifierGroup[];
}

// ============================================
// MEMBER TYPES
// ============================================

export interface OptixRecentOrder {
  id: string;
  createdAt: string;
}

export interface OptixMember {
  id: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  balance: number;
  discountTier: number | null;
  email: string | null;
  phone: string | null;
  recentOrders: OptixRecentOrder[];
}

// ============================================
// ORDER/CHARGE TYPES
// ============================================

export interface OptixLineItemModifier {
  modifierId: string;
  modifierName: string;
  priceAdjustment: number;
}

export interface OptixLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  modifiers: OptixLineItemModifier[];
  notes: string | null;
}

export interface OptixCharge {
  id: string;
  orderNumber: string;
  memberId: string | null;
  memberName: string | null;
  tableId: string | null;
  seatNumbers: number[];
  status: 'draft' | 'submitted' | 'completed' | 'cancelled';
  lineItems: OptixLineItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  kitchenNotes: string | null;
  scheduledTime: string | null;
  createdAt: string;
  submittedAt: string | null;
}

export interface OptixReceipt {
  url: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface GetProductsResponse {
  products: OptixProduct[];
}

export interface SearchMembersResponse {
  members: OptixMember[];
}

export interface GetRecentMembersResponse {
  members: OptixMember[];
}

export interface CreateChargeResponse {
  createCharge: OptixCharge;
}

export interface UpdateChargeResponse {
  updateCharge: OptixCharge;
}

export interface ApplyDiscountResponse {
  applyDiscount: {
    id: string;
    discount: number;
    total: number;
  };
}

export interface SubmitChargeResponse {
  submitCharge: {
    id: string;
    status: string;
    receipt: OptixReceipt | null;
  };
}

export interface ProcessNonMemberPaymentResponse {
  processNonMemberPayment: {
    id: string;
    status: string;
    receiptSentTo: string;
  };
}

// ============================================
// INPUT TYPES
// ============================================

export interface LineItemInput {
  productId: string;
  quantity: number;
  modifiers?: {
    modifierId: string;
  }[];
  notes?: string;
  seatNumber?: number;
}

export interface CreateChargeInput {
  memberId?: string;
  isNonMember?: boolean;
  nonMemberEmail?: string;
  tableId?: string;
  seatNumbers?: number[];
  lineItems: LineItemInput[];
  notes?: string;
  kitchenNotes?: string;
  scheduledTime?: string;
}

export interface UpdateChargeInput {
  lineItems?: LineItemInput[];
  tableId?: string;
  seatNumbers?: number[];
  notes?: string;
  kitchenNotes?: string;
  scheduledTime?: string;
}

export interface SubmitChargeInput {
  tableId?: string;
  seatNumbers?: number[];
  notes?: string;
}
