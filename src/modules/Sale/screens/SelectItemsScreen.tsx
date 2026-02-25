// City Club HMS - Select Items Screen (Step 1)
// Categories + Product Grid view - matching Figma layout exactly

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { CategoryGrid } from '../components/CategoryTile';
import { ProductGrid } from '../components/ProductCard';
import { CATEGORIES, getProductsByCategory, searchProducts } from '../constants';
import { useSale } from '../context/SaleContext';
import type { Product } from '../types';

interface SelectItemsScreenProps {
  className?: string;
}

export function SelectItemsScreen({ className }: SelectItemsScreenProps) {
  const {
    state,
    setActiveCategory,
    addItem,
    showModifierModal,
  } = useSale();

  const { activeCategory, searchQuery } = state;

  // Get filtered products based on category and search
  const products = React.useMemo(() => {
    let filtered = getProductsByCategory(activeCategory);

    if (searchQuery.trim()) {
      // If searching, search across all products
      filtered = searchProducts(searchQuery);
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  // Handle adding a product
  const handleAddProduct = (product: Product) => {
    // If product has required modifiers, show modal
    if (product.hasRequiredModifiers || (product.modifierGroups && product.modifierGroups.length > 0)) {
      showModifierModal(product);
    } else {
      // Add directly to order
      addItem(product);
    }
  };

  // Handle clicking on product card (to view modifiers)
  const handleProductClick = (product: Product) => {
    if (product.modifierGroups && product.modifierGroups.length > 0) {
      showModifierModal(product);
    }
  };

  return (
    <div className={cn('flex-1 flex flex-col overflow-hidden bg-[#292929]', className)}>
      {/* Category Grid - 2 rows x 5 columns, matching Figma: 1216x361, gap 15px */}
      <div className="px-[15px] pt-[10px]">
        <CategoryGrid
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Divider line */}
      <div className="mx-[15px] my-[15px] h-px bg-white/10" />

      {/* Product Grid - scrollable area with 15px padding */}
      <div className="flex-1 overflow-y-auto px-[15px] pb-[15px]">
        {products.length > 0 ? (
          <ProductGrid
            products={products}
            onAddProduct={handleAddProduct}
            onProductClick={handleProductClick}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-white/40 text-sm">No products found</p>
            <p className="text-white/30 text-xs mt-1">
              {searchQuery ? 'Try a different search term' : 'No items in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
