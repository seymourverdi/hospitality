# City Club HMS - Sale Screen Implementation

## 1) Sale Screen UI Breakdown from Figma

### Screen Structure (1920x1080 Desktop Layout)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (64px height)                                                   │
│ ┌─────────┬──────────────────────────────┬──────────┬──────────┬───────┐│
│ │ Search  │ Kitchen Notice (orange)      │Skip Seat │Non-Member│Member ││
│ └─────────┴──────────────────────────────┴──────────┴──────────┴───────┘│
├──────┬──────────────────────────────────────────────┬───────────────────┤
│      │ MAIN CONTENT AREA                            │ ORDER SUMMARY     │
│  S   │ ┌───────────────────────────────────────────┐│ (320px width)     │
│  I   │ │ CATEGORIES (2 rows x 5 columns)           ││ ┌───────────────┐ │
│  D   │ │ ┌─────┬─────┬─────┬─────┬─────┐          ││ │Order Summary  │ │
│  E   │ │ │All  │Snack│Start│Salad│Mains│          ││ │               │ │
│  B   │ │ └─────┴─────┴─────┴─────┴─────┘          ││ │ [Items List]  │ │
│  A   │ │ ┌─────┬─────┬─────┬─────┬─────┐          ││ │               │ │
│  R   │ │ │Bev  │Coff │Past │Dese│Sides│          ││ │ [Discounts]   │ │
│      │ │ └─────┴─────┴─────┴─────┴─────┘          ││ │               │ │
│  80  │ ├───────────────────────────────────────────┤│ │ [Schedule]    │ │
│  px  │ │ PRODUCT GRID (5 columns)                  ││ │               │ │
│      │ │ ┌────┬────┬────┬────┬────┐               ││ │ [Stepper]     │ │
│      │ │ │Card│Card│Card│Card│Card│               ││ │               │ │
│      │ │ └────┴────┴────┴────┴────┘               ││ │ [Total/Nav]   │ │
│      │ │ ...                                       ││ └───────────────┘ │
│      │ └───────────────────────────────────────────┘│                   │
├──────┴──────────────────────────────────────────────┴───────────────────┤
│ BOTTOM STEPPER BAR (included in Order Summary on desktop)               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Regions Enumerated:

1. **Sidebar Navigation** (80px width)
   - Logo/brand mark at top
   - Stats (chart icon)
   - Sale (dollar icon) - ACTIVE state
   - RSVP (calendar icon)
   - Display (screen icon)
   - Tables (grid icon)
   - Filter (filter icon)
   - Log (list icon)
   - Admin (gear icon) at bottom

2. **Top Bar** (64px height, dark #1a1a1a background)
   - Search input (340px max-width, 40px height)
   - Kitchen Notice banner (orange background, warning icon)
   - Skip Seating toggle
   - Non-Member toggle
   - Selected member badge (when applicable)

3. **Categories Section** (2 rows)
   - Grid: 5 columns per row
   - Tile size: 231px × 173px (auto-fill)
   - Gap: 15px
   - Each tile shows: icon, name, item count
   - Colors by category (see tokens)

4. **Product Grid**
   - Columns: 5 (responsive)
   - Card size: 231px × 173px
   - Gap: 15px between cards
   - Card contents: availability, name, allergen badges, price, action button

5. **Order Summary Panel** (320px width)
   - Header: "Order Summary" + time + member badge
   - Scrollable item list
   - Discount tier chips
   - Schedule option
   - Stepper progress
   - Total + navigation buttons

6. **Stepper** (integrated in Order Summary)
   - Steps: 1. Select Items → 2. Select Person → 3. Select Table → Submit Order
   - Dotted line connectors
   - Active state: green circle with number
   - Total badge (orange circle with item count)

### Reusable Components & Variants:

| Component | Variants |
|-----------|----------|
| `CategoryTile` | default, selected (white ring), disabled |
| `ProductCard` | default, sold-out (gray bg + red button), low-stock |
| `OrderLineItem` | standard, with-modifier, with-note |
| `AllergenBadge` | Dairy, Nuts, Gluten, etc. |
| `DiscountChip` | x10, x15, x20, x25 (selected/unselected) |
| `StepIndicator` | active, completed, pending |
| `Toggle` | on/off states |
| `KeyboardKey` | default, highlighted (green) |
| `MemberCard` | default, selected |
| `TableIcon` | empty, occupied, selected |
| `SeatIndicator` | available, occupied, selected |
| `ModifierOption` | radio (single select), checkbox (multi select) |

### States Identified:

1. **Empty States**
   - No products in category
   - No search results
   - Empty order summary
   - No members found

2. **Loading States**
   - Products loading skeleton
   - Members loading skeleton
   - Tables loading skeleton

3. **Interactive States**
   - Has items in order
   - Discount applied (chip highlighted)
   - Non-member mode (shows email input at step 2)
   - Skip seating mode (skips step 3)
   - Scheduled time selected
   - Modifier required (blocks progression)

---

## 2) Design Tokens Extracted for Sale

### Colors (CSS Variables)

```css
:root {
  /* Backgrounds */
  --bg-base: #292929;           /* Main app background */
  --bg-panel: #1a1a1a;          /* Sidebar, Order Summary */
  --bg-card: #333333;           /* Input fields, buttons */
  --bg-card-light: #F5E6C8;     /* Product card (cream) */
  --bg-card-soldout: #2a2a2a;   /* Sold out product card */

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-muted: rgba(255, 255, 255, 0.4);
  --text-dark: #1a1a1a;         /* On light backgrounds */
  --text-card: #374151;         /* On cream cards */

  /* Primary (Teal/Green) */
  --primary: #22C55E;           /* Primary action buttons */
  --primary-hover: #16A34A;

  /* Semantic */
  --destructive: #EF4444;       /* Sold out, errors */
  --warning: #F97316;           /* Kitchen notice, alerts */
  --success: #22C55E;           /* Completed, success */

  /* Category Colors */
  --cat-all: #6366F1;           /* Indigo */
  --cat-snacks: #EAB308;        /* Yellow */
  --cat-starters: #EF6B6B;      /* Coral/Red */
  --cat-salads: #22C55E;        /* Green */
  --cat-mains: #D4A574;         /* Tan/Beige */
  --cat-beverage: #14B8A6;      /* Teal */
  --cat-coffee: #14B8A6;        /* Teal (same as beverage) */
  --cat-pastries: #F472B6;      /* Pink */
  --cat-dessert: #22C55E;       /* Green */
  --cat-sides: #D4A574;         /* Tan/Beige */

  /* Allergen Badge */
  --badge-allergen: #E5E5E5;    /* Light gray background */
  --badge-text: #666666;        /* Gray text */

  /* Discount Chips */
  --discount-active: #22C55E;
  --discount-inactive: rgba(255, 255, 255, 0.1);
}
```

### Typography

```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Heading Styles */
--h1: 28px / 24px, Semi Bold (600);   /* Order Summary title */
--h2: 21px / 18px, Semi Bold (600);   /* Section headers */
--h3: 18px / 16px, Semi Bold (600);   /* Card titles */
--h4: 18px / 16px, Medium (500);      /* Subheaders */

/* Body Styles */
--body-lg: 42px / 36px, Bold (700);   /* Large stats */
--body-md: 18px / 16px, Regular (400);/* Standard body */
--body-sm: 14px / 12px, Regular (400);/* Small body */

/* Paragraph Styles */
--p1: 14px / 12px, Regular;           /* Standard paragraph */
--p2: 14px / 10px, Regular;           /* Compact paragraph */
--p3: 8px / 8px, Regular;             /* Tiny text */
--p4: 12px / 10px, Regular;           /* Small labels */

/* Specific Uses */
--product-name: 14px, Medium (500);
--product-price: 18px, Bold (700);
--badge-text: 10px, Medium (500);
--button-text: 12px, Medium (500);
```

### Spacing

```css
/* Base unit: 4px */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-15: 60px;

/* Component Specific */
--padding-card: 12px;
--padding-panel: 16px;
--gap-grid: 15px;
--gap-categories: 15px;
--sidebar-width: 80px;
--order-summary-width: 320px;
--topbar-height: 64px;
```

### Border Radius

```css
--radius-sm: 4px;    /* Badges, small buttons */
--radius-md: 8px;    /* Cards, inputs */
--radius-lg: 12px;   /* Large cards, panels */
--radius-xl: 16px;   /* Modals */
--radius-full: 9999px; /* Pills, circles */
```

### Shadows

```css
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.3);
--shadow-none: none; /* Most components use flat design */
```

### Tailwind Config Additions

```typescript
// tailwind.config.ts additions
{
  colors: {
    sale: {
      bg: '#292929',
      panel: '#1a1a1a',
      card: '#333333',
      cream: '#F5E6C8',
    },
    category: {
      all: '#6366F1',
      snacks: '#EAB308',
      starters: '#EF6B6B',
      salads: '#22C55E',
      mains: '#D4A574',
      beverage: '#14B8A6',
      coffee: '#14B8A6',
      pastries: '#F472B6',
      dessert: '#22C55E',
      sides: '#D4A574',
    }
  },
  spacing: {
    '15': '60px',
    'sidebar': '80px',
    'order-summary': '320px',
  },
  gridTemplateColumns: {
    'categories': 'repeat(5, minmax(0, 1fr))',
    'products': 'repeat(auto-fill, minmax(231px, 1fr))',
  }
}
```

---

## 3) Interactions + Micro-Interactions

### Add to Order
1. User taps "Add to Order" button on product card
2. If product has **required modifiers**: Modal slides up from bottom
3. If product has **optional modifiers only**: Item added immediately, toast appears
4. Order Summary updates with subtle scale animation on new item
5. Item count badge pulses briefly

### Remove Item / Change Quantity
1. Tap `-` button: Quantity decreases by 1
2. If quantity reaches 0: Item fades out with slide-left animation
3. Tap `+` button: Quantity increases by 1
4. Price updates immediately with number roll animation

### Open Modifiers Modal
1. Tap anywhere on product card (except Add to Order button)
2. Modal slides up from bottom (300ms ease-out)
3. Background dims to 60% black
4. Scroll within modal for long modifier lists

### Required Modifier Selection
1. Radio buttons for single-select groups (e.g., Cook Temperature)
2. Cannot proceed until all required modifiers selected
3. "Apply to Order" button stays disabled until requirements met
4. Red "Required" badge next to section header

### Optional Modifier Add/Remove
1. Checkboxes for multi-select items
2. Check adds item, uncheck removes
3. Price in top-right updates dynamically
4. Green checkmark animation on select

### Add Note
1. Tap "Add a Custom Note" button
2. Text area modal slides up
3. Virtual keyboard appears for tablet use
4. Character counter shows 0/500
5. Tap "Save Note" to confirm
6. Note icon appears on order line item

### Apply Discount Tiers
1. Tap discount chip (x10, x15, x20, x25)
2. Chip transitions to green with scale animation
3. Order total recalculates
4. Only one discount active at a time (tapping another deselects previous)

### Toggle Non-Member
1. Slide toggle to ON
2. Member selection step changes to email input
3. Order Summary badge changes to "Non-Member" (red)
4. Skip to payment flow on submit

### Toggle Skip Seating
1. Slide toggle to ON
2. Step 3 (Select Table) is removed from stepper
3. Flow goes directly from Person → Submit

### Proceed Through Stepper

**Step 1 → Step 2 (Select Items → Select Person)**
1. Tap "Next" button
2. Main content slides left, Person selection slides in from right
3. Keyboard appears for search
4. Stepper indicator updates (1 completes, 2 activates)

**Step 2 → Step 3 (Select Person → Select Table)**
1. Select member from list (row highlights)
2. Tap "Next" button
3. Floor plan view slides in
4. Stepper indicator updates

**Step 3 → Submit (Select Table → Final)**
1. Tap table on floor plan (table highlights green)
2. Select seat number(s)
3. "Submit Order" button activates
4. Tap to complete order

### Subtle Transitions

| Action | Animation |
|--------|-----------|
| Modal open | slide-up 300ms ease-out |
| Modal close | slide-down 200ms ease-in |
| Toast appear | fade-in + slide-up 200ms |
| Toast dismiss | fade-out 150ms |
| Selection highlight | scale(1.02) 150ms |
| Button press | scale(0.95) 100ms |
| Step complete | checkmark draws in 300ms |
| Quantity change | number roll 200ms |

---

## 4) Optix + Supabase Integration Plan (Sale only)

### Integration Boundary

```
┌─────────────────────┐     ┌─────────────────────┐
│   Optix GraphQL     │     │     Supabase        │
│   (System of Record)│     │   (Local Cache)     │
├─────────────────────┤     ├─────────────────────┤
│ • Products          │────▶│ • products_cache    │
│ • Modifiers         │     │ • modifiers_cache   │
│ • Members           │────▶│ • members_cache     │
│ • Charges/Orders    │◀────│ • draft_orders      │
│ • Pricing           │     │ • order_history     │
│ • Inventory         │     │ • app_settings      │
└─────────────────────┘     └─────────────────────┘
```

### Optix = System of Record For:
- **Products**: Name, price, availability, modifiers, allergens
- **Members**: Name, account, balance, discount tier
- **Charges/Orders**: Final submitted orders
- **Inventory**: Real-time stock counts

### Supabase = Local Persistence For:
- **Cached copies**: Products, members (for offline/fast access)
- **Draft orders**: In-progress orders before submission
- **App settings**: UI preferences, default values
- **Audit log**: Local history of actions
- **Sync metadata**: Last sync timestamps, conflict resolution

### Minimum GraphQL Queries/Mutations

```graphql
# Fetch Products with Modifiers
query GetProducts($locationId: ID!, $categoryId: ID) {
  products(locationId: $locationId, categoryId: $categoryId) {
    id
    name
    price
    description
    availableQuantity
    isAvailable
    allergens
    category {
      id
      name
      color
    }
    modifierGroups {
      id
      name
      required
      maxSelections
      modifiers {
        id
        name
        priceAdjustment
      }
    }
  }
}

# Search Members
query SearchMembers($query: String!, $limit: Int) {
  members(search: $query, first: $limit) {
    id
    firstName
    lastName
    accountNumber
    balance
    discountTier
    recentOrders {
      id
      createdAt
    }
  }
}

# Get Recent Members (for quick select)
query GetRecentMembers($limit: Int) {
  members(orderBy: LAST_ORDER_DESC, first: $limit) {
    id
    firstName
    lastName
    accountNumber
    balance
  }
}

# Create Charge/Order
mutation CreateCharge($input: CreateChargeInput!) {
  createCharge(input: $input) {
    id
    orderNumber
    total
    tax
    status
    lineItems {
      id
      productId
      quantity
      price
      modifiers
      notes
    }
  }
}

# Update Charge (add line items)
mutation UpdateCharge($id: ID!, $input: UpdateChargeInput!) {
  updateCharge(id: $id, input: $input) {
    id
    lineItems {
      id
      productId
      quantity
    }
  }
}

# Apply Discount
mutation ApplyDiscount($chargeId: ID!, $discountTier: Int!) {
  applyDiscount(chargeId: $chargeId, discountTier: $discountTier) {
    id
    discount
    total
  }
}

# Submit/Close Order
mutation SubmitCharge($id: ID!, $input: SubmitChargeInput!) {
  submitCharge(id: $id, input: $input) {
    id
    status
    receipt {
      url
    }
  }
}

# Non-Member Payment
mutation ProcessNonMemberPayment($chargeId: ID!, $email: String!) {
  processNonMemberPayment(chargeId: $chargeId, email: $email) {
    id
    status
    receiptSentTo
  }
}
```

### GraphQL Client Wrapper

```typescript
// src/core/optix/client.ts
import { GraphQLClient } from 'graphql-request';

const OPTIX_ENDPOINT = process.env.NEXT_PUBLIC_OPTIX_GRAPHQL_URL!;
const OPTIX_API_KEY = process.env.OPTIX_API_KEY!;

export const optixClient = new GraphQLClient(OPTIX_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${OPTIX_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Type-safe query wrapper
export async function optixQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await optixClient.request<T>(query, variables);
  } catch (error) {
    console.error('Optix query failed:', error);
    throw error;
  }
}

// Type-safe mutation wrapper
export async function optixMutation<T>(
  mutation: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await optixClient.request<T>(mutation, variables);
  } catch (error) {
    console.error('Optix mutation failed:', error);
    throw error;
  }
}
```

### Repository Interface (Swappable)

```typescript
// src/core/repositories/types.ts
export interface IProductRepository {
  getProducts(categoryId?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  searchProducts(query: string): Promise<Product[]>;
}

export interface IMemberRepository {
  searchMembers(query: string): Promise<Member[]>;
  getRecentMembers(limit?: number): Promise<Member[]>;
  getMemberById(id: string): Promise<Member | null>;
}

export interface IOrderRepository {
  createOrder(items: OrderItem[]): Promise<Order>;
  updateOrder(id: string, items: OrderItem[]): Promise<Order>;
  applyDiscount(orderId: string, tier: number): Promise<Order>;
  submitOrder(orderId: string, data: SubmitOrderData): Promise<Order>;
}

// Mock implementation for development
// src/core/repositories/mock/index.ts
export class MockProductRepository implements IProductRepository {
  async getProducts() { return mockProducts; }
  // ...
}

// Optix implementation for production
// src/core/repositories/optix/index.ts
export class OptixProductRepository implements IProductRepository {
  async getProducts() {
    return optixQuery<{products: Product[]}>(GET_PRODUCTS).then(r => r.products);
  }
  // ...
}
```

---

## 5) Codebase File Tree (Sale-only)

```
src/
├── app/
│   ├── (app)/
│   │   └── sale/
│   │       ├── page.tsx              # Main Sale page
│   │       └── loading.tsx           # Loading skeleton
│   ├── globals.css                   # Global styles + tokens
│   └── layout.tsx                    # Root layout
│
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       ├── radio-group.tsx
│       ├── checkbox.tsx
│       ├── switch.tsx
│       ├── scroll-area.tsx
│       ├── skeleton.tsx
│       └── index.ts
│
├── modules/
│   └── Sale/
│       ├── components/
│       │   ├── CategoryTile.tsx
│       │   ├── ProductCard.tsx
│       │   ├── ProductGrid.tsx
│       │   ├── OrderSummary.tsx
│       │   ├── OrderLineItem.tsx
│       │   ├── DiscountChips.tsx
│       │   ├── StepperNav.tsx
│       │   ├── TopBar.tsx
│       │   ├── AlphabetKeyboard.tsx
│       │   ├── MemberCard.tsx
│       │   ├── TableFloorPlan.tsx
│       │   ├── SeatSelector.tsx
│       │   └── index.ts
│       │
│       ├── screens/
│       │   ├── SaleSelectItemsScreen.tsx
│       │   ├── SaleSelectPersonScreen.tsx
│       │   ├── SaleSelectTableScreen.tsx
│       │   └── index.ts
│       │
│       ├── modals/
│       │   ├── ModifiersModal.tsx
│       │   ├── CustomNoteModal.tsx
│       │   ├── ScheduleModal.tsx
│       │   └── index.ts
│       │
│       ├── context/
│       │   └── SaleContext.tsx       # Sale flow state machine
│       │
│       ├── hooks/
│       │   ├── useProducts.ts
│       │   ├── useMembers.ts
│       │   ├── useOrder.ts
│       │   └── index.ts
│       │
│       ├── types.ts                  # Sale module types
│       └── constants.ts              # Mock data, config
│
├── core/
│   ├── optix/
│   │   ├── client.ts                 # GraphQL client
│   │   ├── queries.ts                # Query definitions
│   │   ├── mutations.ts              # Mutation definitions
│   │   └── types.ts                  # Optix types
│   │
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   │
│   ├── repositories/
│   │   ├── types.ts                  # Repository interfaces
│   │   ├── mock/
│   │   │   ├── ProductRepository.ts
│   │   │   ├── MemberRepository.ts
│   │   │   └── OrderRepository.ts
│   │   └── optix/
│   │       ├── ProductRepository.ts
│   │       ├── MemberRepository.ts
│   │       └── OrderRepository.ts
│   │
│   └── lib/
│       └── utils.ts
│
└── tailwind.config.ts                # Design tokens
```

---

## 6) Implementation Notes

### State Machine for Sale Flow

```typescript
type SaleStep = 'select-items' | 'select-person' | 'select-table' | 'submit';

type SaleState = {
  step: SaleStep;
  items: OrderItem[];
  selectedMember: Member | null;
  selectedTable: Table | null;
  selectedSeats: number[];
  discount: number | null;
  scheduledTime: Date | null;
  isNonMember: boolean;
  skipSeating: boolean;
  customNotes: Map<string, string>; // itemId -> note
};

type SaleAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; modifiers?: Modifier[] } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; delta: number } }
  | { type: 'SELECT_MEMBER'; payload: { member: Member } }
  | { type: 'SELECT_TABLE'; payload: { table: Table; seats: number[] } }
  | { type: 'APPLY_DISCOUNT'; payload: { tier: number | null } }
  | { type: 'SET_SCHEDULE'; payload: { time: Date | null } }
  | { type: 'ADD_NOTE'; payload: { itemId: string; note: string } }
  | { type: 'TOGGLE_NON_MEMBER' }
  | { type: 'TOGGLE_SKIP_SEATING' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };
```

### Touch-First Design Principles

1. **Minimum touch targets**: 44x44px
2. **No hover-dependent interactions**: All interactions work on tap
3. **Generous padding**: At least 12px on interactive elements
4. **Clear visual feedback**: Scale/color change on press
5. **Swipe gestures**: For dismissing modals (optional enhancement)

### Offline Considerations

1. Products cached in Supabase on sync
2. Draft orders stored locally
3. Member search falls back to cache
4. Sync queue for failed mutations
5. Visual indicator when offline
