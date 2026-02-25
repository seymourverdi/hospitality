// City Club HMS - Product Card Component
// Matches Figma design: cream/beige card with colored left accent bar matching category

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { CATEGORY_COLORS } from '../constants';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onCardClick?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAdd,
  onCardClick,
  className,
}: ProductCardProps) {
  const isSoldOut = product.soldOut || product.available === 0;

  // Get the category color for the accent bar
  const categoryColor = CATEGORY_COLORS[product.categoryId as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.all;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSoldOut) {
      onAdd(product);
    }
  };

  const handleCardClick = () => {
    if (onCardClick && !isSoldOut) {
      onCardClick(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-150 flex',
        'h-[173px]', // Figma height
        // Cream/beige background for normal state, dark for sold out
        isSoldOut ? 'bg-[#3E3E3E]' : 'bg-[#E8E4DC]',
        // Cursor and interaction
        !isSoldOut && onCardClick && 'cursor-pointer hover:shadow-card-hover hover:scale-[1.01]',
        'active:scale-[0.98]',
        className
      )}
    >
      {/* Left accent bar - color matches category */}
      <div
        className="w-2 flex-shrink-0"
        style={{ backgroundColor: isSoldOut ? '#666666' : categoryColor }}
      />

      {/* Card content */}
      <div className="flex-1 flex flex-col p-3">
        {/* Availability indicator - top, small gray text */}
        <div
          className={cn(
            'text-[11px] mb-1',
            isSoldOut ? 'text-white/50' : 'text-[#6B6B6B]'
          )}
        >
          Available: {product.available}
        </div>

        {/* Product name - bold, larger text */}
        <h3
          className={cn(
            'text-[15px] font-bold mb-2 line-clamp-2 leading-tight',
            isSoldOut ? 'text-white/50' : 'text-[#1A1A1A]'
          )}
        >
          {product.name}
        </h3>

        {/* Allergen badges - small gray rounded pills */}
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {product.allergens.map((allergen) => (
            <span
              key={allergen}
              className={cn(
                'px-2 py-0.5 rounded-md text-[10px] font-medium',
                isSoldOut
                  ? 'bg-white/10 text-white/50'
                  : 'bg-[#CACACA] text-[#4A4A4A]'
              )}
            >
              {allergen}
            </span>
          ))}
        </div>

        {/* Spacer to push price/button to bottom */}
        <div className="flex-1" />

        {/* Price and Add button row */}
        <div className="flex items-center justify-between">
          {/* Price - dark text, bold */}
          <span
            className={cn(
              'font-bold text-xl',
              isSoldOut ? 'text-white/50' : 'text-[#1A1A1A]'
            )}
          >
            ${Math.floor(product.price)}
          </span>

          {/* Add to Order / Sold Out button */}
          <button
            onClick={handleAddClick}
            disabled={isSoldOut}
            className={cn(
              'px-4 py-2 rounded-lg text-[12px] font-medium transition-colors',
              'min-h-[36px]', // Touch target
              isSoldOut
                ? 'bg-[#EF4444] text-white cursor-not-allowed'
                : 'bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] active:bg-[#4D4D4D]'
            )}
          >
            {isSoldOut ? 'Sold Out' : 'Add to Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Grid wrapper - 5 columns with 15px gap
interface ProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  className?: string;
}

export function ProductGrid({
  products,
  onAddProduct,
  onProductClick,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        // 5 columns grid with 15px gap to match Figma exactly
        'grid grid-cols-5 gap-[15px]',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAddProduct}
          onCardClick={onProductClick}
        />
      ))}
    </div>
  );
}
