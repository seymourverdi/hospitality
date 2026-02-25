// City Club HMS - Sale Module Types
// Matching Figma design specifications exactly

// ============================================
// CATEGORY TYPES
// ============================================

export type CategoryId =
  | 'all'
  | 'snacks'
  | 'starters'
  | 'salads'
  | 'mains'
  | 'beverage'
  | 'coffee'
  | 'pastries'
  | 'dessert'
  | 'sides';

export interface Category {
  id: CategoryId;
  name: string;
  count: number;
  color: string;
  icon: string;
  row: 1 | 2;
}

// ============================================
// PRODUCT TYPES
// ============================================

export type AllergenType = 'Dairy' | 'Nuts' | 'Gluten' | 'Eggs' | 'Soy' | 'Fish' | 'Shellfish';

export interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number; // 1 for radio, >1 for checkbox
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  available: number | '∞';
  allergens: AllergenType[];
  categoryId: CategoryId;
  soldOut?: boolean;
  modifierGroups?: ModifierGroup[];
  hasRequiredModifiers?: boolean;
}

// ============================================
// ORDER TYPES
// ============================================

export interface SelectedModifier {
  groupId: string;
  optionId: string;
  name: string;
  priceAdjustment: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  qty: number;
  price: number; // Line total (unitPrice * qty)
  unitPrice: number;
  modifiers: SelectedModifier[];
  modifierText?: string; // Display text like "Whole Milk"
  note?: string;
  discountTier?: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  memberId?: string;
  memberName?: string;
  tableId?: string;
  seatNumbers?: number[];
  discountTier: number | null;
  scheduledTime?: Date;
  isNonMember: boolean;
  nonMemberEmail?: string;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  status: 'draft' | 'submitted' | 'completed' | 'cancelled';
}

// ============================================
// MEMBER TYPES
// ============================================

export interface Member {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  balance: number;
  discountTier?: number;
  email?: string;
  phone?: string;
}

// ============================================
// TABLE TYPES
// ============================================

export type TableShape = 'rectangle' | 'circle' | 'square';

export interface TableSeat {
  number: number;
  occupied: boolean;
  memberId?: string;
}

export interface Table {
  id: string;
  name: string; // e.g., "D4", "CT"
  shape: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  seats: TableSeat[];
  maxSeats: number;
  floorId: string;
}

export interface Floor {
  id: string;
  name: string; // e.g., "Dining Room", "Bar"
  tables: Table[];
}

// ============================================
// SALE FLOW TYPES
// ============================================

export type SaleStep = 'select-items' | 'select-person' | 'select-table' | 'submit';

export interface SaleState {
  step: SaleStep;
  items: OrderItem[];
  selectedMember: Member | null;
  selectedTable: Table | null;
  selectedSeats: number[];
  discountTier: number | null;
  scheduledTime: Date | null;
  isNonMember: boolean;
  skipSeating: boolean;
  searchQuery: string;
  activeCategory: CategoryId;
  customNotes: Map<string, string>;
  showModifierModal: boolean;
  showNoteModal: boolean;
  showScheduleModal: boolean;
  pendingProduct: Product | null;
  editingItemId: string | null;
}

export type SaleAction =
  | { type: 'SET_STEP'; payload: SaleStep }
  | { type: 'ADD_ITEM'; payload: { product: Product; modifiers?: SelectedModifier[]; qty?: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; delta: number } }
  | { type: 'SET_ITEM_NOTE'; payload: { itemId: string; note: string } }
  | { type: 'SELECT_MEMBER'; payload: Member }
  | { type: 'CLEAR_MEMBER' }
  | { type: 'SELECT_TABLE'; payload: { table: Table; seats: number[] } }
  | { type: 'CLEAR_TABLE' }
  | { type: 'SET_DISCOUNT'; payload: number | null }
  | { type: 'SET_SCHEDULED_TIME'; payload: Date | null }
  | { type: 'TOGGLE_NON_MEMBER' }
  | { type: 'TOGGLE_SKIP_SEATING' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: CategoryId }
  | { type: 'SHOW_MODIFIER_MODAL'; payload: Product }
  | { type: 'HIDE_MODIFIER_MODAL' }
  | { type: 'SHOW_NOTE_MODAL'; payload: string }
  | { type: 'HIDE_NOTE_MODAL' }
  | { type: 'SHOW_SCHEDULE_MODAL' }
  | { type: 'HIDE_SCHEDULE_MODAL' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

// ============================================
// DISCOUNT TYPES
// ============================================

export type DiscountTier = 10 | 15 | 20 | 25;

export const DISCOUNT_TIERS: DiscountTier[] = [10, 15, 20, 25];

// ============================================
// KEYBOARD TYPES
// ============================================

export const KEYBOARD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', 'Space', '⌫'],
] as const;

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface CategoryTileProps {
  category: Category;
  isActive: boolean;
  onSelect: (id: CategoryId) => void;
}

export interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onCardClick?: (product: Product) => void;
}

export interface OrderLineItemProps {
  item: OrderItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddNote?: () => void;
  onRemove?: () => void;
}

export interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  onSelect: (member: Member) => void;
}

export interface TableIconProps {
  table: Table;
  isSelected: boolean;
  onSelect: (table: Table) => void;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export interface MembersResponse {
  members: Member[];
  total: number;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  status: string;
}

export interface SubmitOrderResponse {
  success: boolean;
  orderId: string;
  receiptUrl?: string;
}
