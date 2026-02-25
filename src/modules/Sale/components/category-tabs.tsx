// City Club HMS - Category Tabs
// Horizontal scrollable category filter

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Simple category type for tabs
interface CategoryTab {
  id: string;
  name: string;
  slug: string;
  color: string;
}

// Mock categories - will be replaced with Supabase query
const mockCategories: CategoryTab[] = [
  { id: 'all', name: 'All', slug: 'all', color: '#6366F1' },
  { id: 'snacks', name: 'Snacks', slug: 'snacks', color: '#EAB308' },
  { id: 'starters', name: 'Starters', slug: 'starters', color: '#22C55E' },
  { id: 'salads', name: 'Salads', slug: 'salads', color: '#14B8A6' },
  { id: 'mains', name: 'Mains', slug: 'mains', color: '#A855F7' },
  { id: 'sides', name: 'Sides', slug: 'sides', color: '#6B7280' },
  { id: 'beverage', name: 'Beverage', slug: 'beverage', color: '#EC4899' },
  { id: 'coffee', name: 'Coffee', slug: 'coffee', color: '#92400E' },
  { id: 'pastries', name: 'Pastries', slug: 'pastries', color: '#F97316' },
  { id: 'dessert', name: 'Dessert', slug: 'dessert', color: '#D946EF' },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
  return (
    <ScrollArea className={cn('w-full whitespace-nowrap', className)}>
      <div className="flex gap-2 pb-2">
        {mockCategories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'inline-flex items-center justify-center px-4 py-2.5',
                'rounded-full text-sm font-semibold transition-all touch-target',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-background-secondary text-foreground hover:bg-background-tertiary'
              )}
              style={{
                backgroundColor: isActive ? category.color : undefined,
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export { mockCategories };
