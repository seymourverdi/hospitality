// City Club HMS - Sale Module Constants
// Mock data and configuration matching Figma design exactly

import type { Category, Product, Member, ModifierGroup, CategoryId } from './types';

// ============================================
// CATEGORIES
// ============================================

// Category colors matching Figma design exactly
export const CATEGORY_COLORS = {
  all: '#80B5F0',       // Light Blue
  snacks: '#9571EF',    // Purple
  starters: '#E57881',  // Coral/Pink
  salads: '#94F2AF',    // Light Green
  mains: '#EFCE7D',     // Yellow/Gold
  beverage: '#5F97DF',  // Blue
  coffee: '#7445E8',    // Deep Purple
  pastries: '#DD505C',  // Red
  dessert: '#66C580',   // Green
  sides: '#E6B357',     // Orange/Gold
} as const;

export const CATEGORIES: Category[] = [
  // Row 1
  { id: 'all', name: 'All Items', count: 144, color: CATEGORY_COLORS.all, icon: 'all-items', row: 1 },
  { id: 'snacks', name: 'Snacks', count: 12, color: CATEGORY_COLORS.snacks, icon: 'snacks', row: 1 },
  { id: 'starters', name: 'Starters', count: 8, color: CATEGORY_COLORS.starters, icon: 'starters', row: 1 },
  { id: 'salads', name: 'Salads', count: 6, color: CATEGORY_COLORS.salads, icon: 'salads', row: 1 },
  { id: 'mains', name: 'Mains', count: 27, color: CATEGORY_COLORS.mains, icon: 'mains', row: 1 },
  // Row 2
  { id: 'beverage', name: 'Beverage', count: 78, color: CATEGORY_COLORS.beverage, icon: 'beverage', row: 2 },
  { id: 'coffee', name: 'Coffee', count: 18, color: CATEGORY_COLORS.coffee, icon: 'coffee', row: 2 },
  { id: 'pastries', name: 'Pastries', count: 12, color: CATEGORY_COLORS.pastries, icon: 'pastries', row: 2 },
  { id: 'dessert', name: 'Dessert', count: 5, color: CATEGORY_COLORS.dessert, icon: 'dessert', row: 2 },
  { id: 'sides', name: 'Sides', count: 23, color: CATEGORY_COLORS.sides, icon: 'sides', row: 2 },
];

// Helper to get category by ID
export function getCategoryById(id: CategoryId): Category | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

// Helper to get category color
export function getCategoryColor(id: CategoryId): string {
  return getCategoryById(id)?.color || '#6366F1';
}

// ============================================
// MODIFIER GROUPS
// ============================================

export const MILK_OPTIONS: ModifierGroup = {
  id: 'milk',
  name: 'Milk Choice',
  required: true,
  maxSelections: 1,
  options: [
    { id: 'whole', name: 'Whole Milk', priceAdjustment: 0 },
    { id: 'skim', name: 'Skim Milk', priceAdjustment: 0 },
    { id: 'oat', name: 'Oat Milk', priceAdjustment: 0.75 },
    { id: 'almond', name: 'Almond Milk', priceAdjustment: 0.75 },
    { id: 'soy', name: 'Soy Milk', priceAdjustment: 0.50 },
  ],
};

export const COOK_TEMP_OPTIONS: ModifierGroup = {
  id: 'cook-temp',
  name: 'Cook Temperature',
  required: true,
  maxSelections: 1,
  options: [
    { id: 'rare', name: 'Rare', priceAdjustment: 0 },
    { id: 'medium-rare', name: 'Medium Rare', priceAdjustment: 0 },
    { id: 'medium', name: 'Medium', priceAdjustment: 0 },
    { id: 'medium-well', name: 'Medium Well', priceAdjustment: 0 },
    { id: 'well-done', name: 'Well Done', priceAdjustment: 0 },
  ],
};

export const ADD_ONS_OPTIONS: ModifierGroup = {
  id: 'add-ons',
  name: 'Add-Ons',
  required: false,
  maxSelections: 5,
  options: [
    { id: 'extra-cheese', name: 'Extra Cheese', priceAdjustment: 1.00 },
    { id: 'avocado', name: 'Avocado', priceAdjustment: 1.50 },
    { id: 'no-bun', name: 'No Bun', priceAdjustment: 0 },
    { id: 'extra-sauce', name: 'Extra Sauce', priceAdjustment: 0.50 },
    { id: 'side-salad', name: 'Side Salad', priceAdjustment: 3.00 },
  ],
};

// ============================================
// PRODUCTS
// ============================================

export const PRODUCTS: Product[] = [
  // Coffee items
  {
    id: '1',
    name: 'Cappuccino',
    price: 5.00,
    available: 12,
    allergens: ['Dairy'],
    categoryId: 'coffee',
    modifierGroups: [MILK_OPTIONS],
    hasRequiredModifiers: true,
  },
  {
    id: '10',
    name: 'Cafe Latte',
    price: 5.00,
    available: 12,
    allergens: ['Dairy'],
    categoryId: 'coffee',
    modifierGroups: [MILK_OPTIONS],
    hasRequiredModifiers: true,
  },
  {
    id: '5',
    name: 'Affogato',
    price: 5.00,
    available: 0,
    allergens: ['Dairy', 'Nuts'],
    categoryId: 'coffee',
    soldOut: true,
  },

  // Salads
  {
    id: '2',
    name: 'Gotham Greens Salad with Chicken',
    price: 22.00,
    available: 8,
    allergens: ['Dairy', 'Nuts'],
    categoryId: 'salads',
  },
  {
    id: '7',
    name: 'Side Salad',
    price: 5.00,
    available: 12,
    allergens: [],
    categoryId: 'salads',
  },

  // Pastries
  {
    id: '3',
    name: 'Croissant Sandwich with Scrambled Eggs',
    price: 13.00,
    available: '∞',
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    categoryId: 'pastries',
  },
  {
    id: '4',
    name: 'Chocolate Croissant',
    price: 6.00,
    available: 6,
    allergens: ['Dairy', 'Gluten'],
    categoryId: 'pastries',
  },
  {
    id: '6',
    name: 'Seasonal Danish',
    price: 5.00,
    available: 12,
    allergens: ['Dairy', 'Nuts', 'Gluten'],
    categoryId: 'pastries',
  },
  {
    id: '12',
    name: 'Croissant',
    price: 5.00,
    available: 12,
    allergens: ['Dairy', 'Gluten'],
    categoryId: 'pastries',
  },

  // Mains
  {
    id: '8',
    name: 'Grilled Cheese',
    price: 12.00,
    available: 12,
    allergens: ['Dairy', 'Gluten'],
    categoryId: 'mains',
  },
  {
    id: '13',
    name: 'Ricotta Gnudi',
    price: 18.00,
    available: 8,
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    categoryId: 'mains',
  },
  {
    id: '14',
    name: 'Seared Halibut',
    price: 32.00,
    available: 5,
    allergens: ['Fish'],
    categoryId: 'mains',
    modifierGroups: [ADD_ONS_OPTIONS],
  },

  // Sides
  {
    id: '9',
    name: 'Side (Chicken)',
    price: 8.00,
    available: 12,
    allergens: [],
    categoryId: 'sides',
  },
  {
    id: '15',
    name: 'Side (Avocado)',
    price: 5.00,
    available: 12,
    allergens: [],
    categoryId: 'sides',
  },

  // Desserts
  {
    id: '11',
    name: 'Masa Tea Cake',
    price: 7.00,
    available: 10,
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    categoryId: 'dessert',
  },
];

// Filter products by category
export function getProductsByCategory(categoryId: CategoryId): Product[] {
  if (categoryId === 'all') {
    return PRODUCTS;
  }
  return PRODUCTS.filter(p => p.categoryId === categoryId);
}

// Search products by name
export function searchProducts(query: string): Product[] {
  if (!query.trim()) return PRODUCTS;
  const lowerQuery = query.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// MEMBERS
// ============================================

export const MEMBERS: Member[] = [
  { id: '1', name: 'Ryan Boykin', firstName: 'Ryan', lastName: 'Boykin', accountNumber: 'CC-1001', balance: 1024, discountTier: 15 },
  { id: '2', name: 'Steve Smith', firstName: 'Steve', lastName: 'Smith', accountNumber: 'CC-1002', balance: 821, discountTier: 10 },
  { id: '3', name: 'Stefan du Toit', firstName: 'Stefan', lastName: 'du Toit', accountNumber: 'CC-1003', balance: 847, discountTier: 20 },
  { id: '4', name: 'James Balog', firstName: 'James', lastName: 'Balog', accountNumber: 'CC-1004', balance: 393, discountTier: 10 },
  { id: '5', name: 'Eddie Zapata', firstName: 'Eddie', lastName: 'Zapata', accountNumber: 'CC-1005', balance: 483 },
  { id: '6', name: 'Jeremy Ciampa', firstName: 'Jeremy', lastName: 'Ciampa', accountNumber: 'CC-1006', balance: 423 },
  { id: '7', name: 'Erin Simms', firstName: 'Erin', lastName: 'Simms', accountNumber: 'CC-1007', balance: 248 },
  { id: '8', name: 'Amanda Warner', firstName: 'Amanda', lastName: 'Warner', accountNumber: 'CC-1008', balance: 281, discountTier: 15 },
  { id: '9', name: "Edward O'Neil", firstName: 'Edward', lastName: "O'Neil", accountNumber: 'CC-1009', balance: 942, discountTier: 25 },
  { id: '10', name: 'Grace Yoon', firstName: 'Grace', lastName: 'Yoon', accountNumber: 'CC-1010', balance: 587 },
];

// Search members by name
export function searchMembers(query: string): Member[] {
  if (!query.trim()) return MEMBERS;
  const lowerQuery = query.toLowerCase();
  return MEMBERS.filter(m =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.firstName.toLowerCase().includes(lowerQuery) ||
    m.lastName.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// INITIAL ORDER ITEMS (for demo)
// ============================================

export const INITIAL_ORDER_ITEMS = [
  {
    id: 'demo-1',
    productId: '3',
    name: 'Ham & Gruyere Croissant Sandwich',
    qty: 2,
    unitPrice: 7.10,
    price: 14.20,
    modifiers: [],
  },
  {
    id: 'demo-2',
    productId: '2',
    name: 'Gotham Greens Salad with Chicken',
    qty: 1,
    unitPrice: 22.19,
    price: 22.19,
    modifiers: [],
  },
  {
    id: 'demo-3',
    productId: '1',
    name: 'Cappuccino',
    qty: 2,
    unitPrice: 3.555,
    price: 7.11,
    modifiers: [{ groupId: 'milk', optionId: 'whole', name: 'Whole Milk', priceAdjustment: 0 }],
    modifierText: 'Whole Milk',
  },
  {
    id: 'demo-4',
    productId: '11',
    name: 'House Dessert',
    qty: 2,
    unitPrice: 4.015,
    price: 8.03,
    modifiers: [],
    modifierText: 'Gluten Free',
  },
];

// ============================================
// UI CONSTANTS
// ============================================

export const KEYBOARD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', 'Space', '⌫'],
] as const;

export const DISCOUNT_TIERS = [10, 15, 20, 25] as const;

export const TAX_RATE = 0.1157; // 11.57%

// ============================================
// KITCHEN NOTICE
// ============================================

export const KITCHEN_NOTICE = {
  message: 'Notice: short staffed in the Kitchen, longer than normal wait times for food items...',
  type: 'warning' as const,
  active: true,
};
