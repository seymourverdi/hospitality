import type {
  CategoryId,
  Product,
  ModifierGroup,
  ModifierOption,
  Order,
  OrderItem,
} from "@/modules/Sale/types";

export function toIdString(id: number | string): string {
  return String(id);
}

export function toIdNumber(id: string): number {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Invalid numeric id: "${id}"`);
  }
  return n;
}

export function moneyToNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function categoryNameToUiId(name: string | null | undefined): CategoryId {
  const s = String(name ?? "").trim().toLowerCase();

  if (!s) return "all";
  if (s.includes("snack")) return "snacks";
  if (s.includes("starter") || s.includes("appet")) return "starters";
  if (s.includes("salad")) return "salads";
  if (s.includes("main") || s.includes("entree")) return "mains";
  if (s.includes("bever") || s.includes("drink")) return "beverage";
  if (s.includes("coffee")) return "coffee";
  if (s.includes("pastr") || s.includes("bak")) return "pastries";
  if (s.includes("dessert") || s.includes("sweet")) return "dessert";
  if (s.includes("side")) return "sides";

  return "all";
}

export type ApiMenuItem = {
  id: number;
  categoryId: number;
  name: string;
  basePrice: string;
  isActive: boolean;
  hasModifiers: boolean;
  category?: { id: number; name: string } | null;
};

export type ApiModifierGroup = {
  id: number;
  name: string;
  isRequired: boolean;
  maxSelections: number;
  options: ApiModifierOption[];
};

export type ApiModifierOption = {
  id: number;
  name: string;
  priceDelta: string;
};

export function mapMenuItemToProduct(it: ApiMenuItem): Product {
  const uiCategoryId = categoryNameToUiId(it.category?.name);

  return {
    id: toIdString(it.id),
    name: it.name,
    price: moneyToNumber(it.basePrice),
    available: "∞",
    allergens: [],
    categoryId: uiCategoryId,
    soldOut: !it.isActive,
    hasRequiredModifiers: it.hasModifiers,
  };
}

export function mapModifierGroup(group: ApiModifierGroup): ModifierGroup {
  const options: ModifierOption[] = group.options.map((o) => ({
    id: toIdString(o.id),
    name: o.name,
    priceAdjustment: moneyToNumber(o.priceDelta),
  }));

  return {
    id: toIdString(group.id),
    name: group.name,
    required: group.isRequired,
    maxSelections: group.maxSelections,
    options,
  };
}

export function buildUiOrder(params: {
  id: string;
  items: OrderItem[];
  status: Order["status"];
  createdAt?: Date;
  submittedAt?: Date;
  tableId?: string;
  memberId?: string;
  seatNumbers?: number[];
  scheduledTime?: Date | null;
  discountTier?: number | null;
  isNonMember?: boolean;
}): Order {
  void params.submittedAt;

  const subtotal = params.items.reduce((sum, it) => sum + it.price, 0);
  const tax = 0;
  const total = subtotal + tax;

  return {
    id: params.id,
    status: params.status,
    items: params.items,
    subtotal,
    tax,
    total,
    createdAt: params.createdAt ?? new Date(),
    tableId: params.tableId,
    memberId: params.memberId,
    seatNumbers: params.seatNumbers,
    scheduledTime: params.scheduledTime ?? undefined,
    discountTier: params.discountTier ?? null,
    isNonMember: params.isNonMember ?? false,
  };
}