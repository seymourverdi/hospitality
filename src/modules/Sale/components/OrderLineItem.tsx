// City Club HMS - Order Line Item Component
// Matches Figma design: dark rounded container, cream qty badge, name, green price, gray +/- controls

'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import type { OrderItem } from '../types';

interface OrderLineItemProps {
  item: OrderItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddNote?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function OrderLineItem({
  item,
  onIncrease,
  onDecrease,
  onAddNote: _onAddNote,
  onRemove: _onRemove,
  className,
}: OrderLineItemProps) {
  // Note: onAddNote and onRemove are available for future use
  void _onAddNote;
  void _onRemove;

  // Calculate line total (price * qty)
  const lineTotal = item.price * item.qty;

  return (
    <div
      className={cn(
        // Figma: dark rounded container with proper padding
        'flex items-center gap-3 px-4 py-3 bg-[#5A5A5A] rounded-[10px]',
        className
      )}
    >
      {/* Quantity Badge - cream/beige rounded pill */}
      <div className="min-w-[32px] h-[32px] rounded-full bg-[#E3E3E3] flex items-center justify-center flex-shrink-0">
        <span className="text-[#444444] text-[14px] font-bold">{item.qty}</span>
      </div>

      {/* Item Name + Modifier inline */}
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="text-white text-[14px] font-semibold truncate">
          {item.name}
        </span>
        {/* Modifier text inline (e.g., "Whole Milk", "Gluten Free") */}
        {item.modifierText && (
          <span className="text-white/50 text-[12px] flex-shrink-0">{item.modifierText}</span>
        )}
      </div>

      {/* Price Badge - green rounded pill */}
      <div className="px-2.5 py-1 rounded-full bg-[#4ADE80]/20 flex-shrink-0">
        <span className="text-[#4ADE80] text-[12px] font-semibold">
          ${lineTotal.toFixed(2)}
        </span>
      </div>

      {/* Quantity Controls - gray buttons with count in between */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Decrease button */}
        <button
          onClick={onDecrease}
          className={cn(
            'w-[32px] h-[32px] rounded-lg flex items-center justify-center transition-colors',
            'bg-[#6B6B6B] text-white hover:bg-[#7B7B7B] active:bg-[#5B5B5B]'
          )}
        >
          <Minus className="h-4 w-4 stroke-[2]" />
        </button>

        {/* Quantity display between buttons */}
        <span className="text-white text-[14px] font-semibold min-w-[16px] text-center">
          {item.qty}
        </span>

        {/* Increase button */}
        <button
          onClick={onIncrease}
          className={cn(
            'w-[32px] h-[32px] rounded-lg flex items-center justify-center transition-colors',
            'bg-[#6B6B6B] text-white hover:bg-[#7B7B7B] active:bg-[#5B5B5B]'
          )}
        >
          <Plus className="h-4 w-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}

// Order Items List wrapper
interface OrderItemsListProps {
  items: OrderItem[];
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onAddNote?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  className?: string;
}

export function OrderItemsList({
  items,
  onIncrease,
  onDecrease,
  onAddNote,
  onRemove,
  className,
}: OrderItemsListProps) {
  if (items.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <p className="text-white/40 text-sm">No items added</p>
        <p className="text-white/30 text-xs mt-1">
          Tap products to add them to order
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item) => (
        <OrderLineItem
          key={item.id}
          item={item}
          onIncrease={() => onIncrease(item.id)}
          onDecrease={() => onDecrease(item.id)}
          onAddNote={onAddNote ? () => onAddNote(item.id) : undefined}
          onRemove={onRemove ? () => onRemove(item.id) : undefined}
        />
      ))}
    </div>
  );
}
