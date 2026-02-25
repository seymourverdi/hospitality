// City Club HMS - Product Card
// Tappable product card for menu items

'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn, formatCurrency } from '@/core/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/core/database.types';

interface ProductCardProps {
  product: Product;
  categoryColor: string;
  isSelected?: boolean;
  quantity?: number;
  onTap: () => void;
  className?: string;
}

export function ProductCard({
  product,
  categoryColor,
  isSelected = false,
  quantity = 0,
  onTap,
  className,
}: ProductCardProps) {
  const isSoldOut =
    product.track_inventory &&
    product.available_count !== null &&
    product.available_count <= 0;

  const isLowStock =
    product.track_inventory &&
    product.available_count !== null &&
    product.low_stock_threshold !== null &&
    product.available_count <= product.low_stock_threshold &&
    product.available_count > 0;

  return (
    <button
      onClick={onTap}
      disabled={isSoldOut}
      className={cn(
        'relative flex flex-col p-3 rounded-xl transition-all touch-target',
        'bg-card border-2 text-left',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'border-primary shadow-md scale-[1.02]'
          : 'border-transparent hover:border-border',
        isSoldOut && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Quantity badge */}
      {quantity > 0 && (
        <Badge
          variant="count"
          className="absolute -top-2 -right-2 z-10"
          style={{ backgroundColor: categoryColor }}
        >
          {quantity}
        </Badge>
      )}

      {/* Sold out overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-destructive/90 z-10">
          <span className="text-sm font-bold text-white">SOLD OUT</span>
        </div>
      )}

      {/* Product image or placeholder */}
      <div
        className="aspect-square w-full rounded-lg mb-2 bg-background-tertiary"
        style={{
          backgroundImage: product.image_url
            ? `url(${product.image_url})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!product.image_url && (
          <div
            className="h-full w-full rounded-lg flex items-center justify-center"
            style={{ backgroundColor: categoryColor + '20' }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: categoryColor }}
            >
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{product.name}</p>
        <p className="text-sm font-semibold text-primary mt-1">
          {formatCurrency(Number(product.price))}
        </p>
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-1 mt-2">
        {/* Routing badge */}
        <Badge
          variant={product.routing === 'bar' ? 'bar' : 'kitchen'}
          className="text-[10px] px-1.5 py-0.5"
        >
          {product.routing === 'bar' ? 'BAR' : 'K'}
        </Badge>

        {/* Low stock warning */}
        {isLowStock && (
          <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
            <AlertTriangle className="h-3 w-3 mr-0.5" />
            {product.available_count}
          </Badge>
        )}

        {/* Allergens indicator */}
        {product.allergens && product.allergens.length > 0 && (
          <Badge variant="allergen" className="text-[10px] px-1.5 py-0.5">
            {product.allergens.length}
          </Badge>
        )}
      </div>
    </button>
  );
}
