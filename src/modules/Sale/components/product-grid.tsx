// City Club HMS - Product Grid
// Responsive grid of product cards

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import type { Product } from '@/core/database.types';
import type { OrderItem } from '../types';

// Mock products - will be replaced with Supabase query
const mockProducts: Product[] = [
  {
    id: '1',
    category_id: 'snacks',
    name: 'Truffle Fries',
    description: 'Hand-cut fries with truffle oil and parmesan',
    price: 12.00,
    image_url: null,
    track_inventory: true,
    available_count: 8,
    low_stock_threshold: 5,
    routing: 'kitchen',
    prep_time_minutes: 10,
    allergens: ['dairy'],
    dietary_tags: ['vegetarian'],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    category_id: 'starters',
    name: 'Lobster Bisque',
    description: 'Creamy lobster soup with cognac',
    price: 18.00,
    image_url: null,
    track_inventory: false,
    available_count: null,
    low_stock_threshold: null,
    routing: 'kitchen',
    prep_time_minutes: 8,
    allergens: ['shellfish', 'dairy'],
    dietary_tags: [],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    category_id: 'salads',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons, caesar dressing',
    price: 15.00,
    image_url: null,
    track_inventory: false,
    available_count: null,
    low_stock_threshold: null,
    routing: 'kitchen',
    prep_time_minutes: 5,
    allergens: ['dairy', 'gluten'],
    dietary_tags: [],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    category_id: 'mains',
    name: 'Wagyu Steak',
    description: 'A5 Japanese Wagyu, 8oz',
    price: 85.00,
    image_url: null,
    track_inventory: true,
    available_count: 3,
    low_stock_threshold: 5,
    routing: 'kitchen',
    prep_time_minutes: 25,
    allergens: [],
    dietary_tags: [],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    category_id: 'mains',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter',
    price: 38.00,
    image_url: null,
    track_inventory: false,
    available_count: null,
    low_stock_threshold: null,
    routing: 'kitchen',
    prep_time_minutes: 18,
    allergens: ['fish'],
    dietary_tags: ['gluten-free'],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    category_id: 'beverage',
    name: 'House Red Wine',
    description: 'Glass of house red',
    price: 14.00,
    image_url: null,
    track_inventory: false,
    available_count: null,
    low_stock_threshold: null,
    routing: 'bar',
    prep_time_minutes: 2,
    allergens: [],
    dietary_tags: ['vegan'],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    category_id: 'coffee',
    name: 'Espresso',
    description: 'Double shot espresso',
    price: 5.00,
    image_url: null,
    track_inventory: false,
    available_count: null,
    low_stock_threshold: null,
    routing: 'bar',
    prep_time_minutes: 3,
    allergens: [],
    dietary_tags: ['vegan', 'gluten-free'],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    category_id: 'dessert',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center',
    price: 16.00,
    image_url: null,
    track_inventory: true,
    available_count: 0,
    low_stock_threshold: 3,
    routing: 'kitchen',
    prep_time_minutes: 15,
    allergens: ['dairy', 'eggs', 'gluten'],
    dietary_tags: [],
    is_daily_special: false,
    available_start_time: null,
    available_end_time: null,
    is_active: true,
    is_visible_mobile: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Category colors map
const categoryColors: Record<string, string> = {
  all: '#6366F1',
  snacks: '#EAB308',
  starters: '#22C55E',
  salads: '#14B8A6',
  mains: '#A855F7',
  sides: '#6B7280',
  beverage: '#EC4899',
  coffee: '#92400E',
  pastries: '#F97316',
  dessert: '#D946EF',
};

interface ProductGridProps {
  activeCategory: string;
  orderItems: OrderItem[];
  onProductTap: (product: Product) => void;
  isLoading?: boolean;
  className?: string;
}

export function ProductGrid({
  activeCategory,
  orderItems,
  onProductTap,
  isLoading = false,
  className,
}: ProductGridProps) {
  // Filter products by category
  const filteredProducts = React.useMemo(() => {
    if (activeCategory === 'all') return mockProducts;
    return mockProducts.filter((p) => p.category_id === activeCategory);
  }, [activeCategory]);

  // Get quantity for each product
  const getQuantity = (productId: string) => {
    return orderItems
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.qty, 0);
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3', className)}>
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3', className)}>
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryColor={categoryColors[product.category_id] || '#6366F1'}
          quantity={getQuantity(product.id)}
          isSelected={getQuantity(product.id) > 0}
          onTap={() => onProductTap(product)}
        />
      ))}
    </div>
  );
}

export { mockProducts };
