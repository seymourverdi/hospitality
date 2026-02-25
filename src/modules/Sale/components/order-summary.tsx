// City Club HMS - Order Summary
// Sidebar/sheet showing current order items

'use client';

import * as React from 'react';
import { Minus, Plus, Trash2, ChevronRight, Clock } from 'lucide-react';
import { cn, formatCurrency } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOrder, type ContextOrderItem } from '../context/order-context';

interface OrderSummaryProps {
  onItemTap?: (item: ContextOrderItem) => void;
  onCheckout?: () => void;
  className?: string;
}

export function OrderSummary({
  onItemTap,
  onCheckout,
  className,
}: OrderSummaryProps) {
  const { state, updateItem, removeItem, canProceed, nextStep } = useOrder();

  const handleIncrement = (item: ContextOrderItem) => {
    const newQty = item.qty + 1;
    const lineTotal = item.unitPrice * newQty;
    updateItem(item.id, { qty: newQty, lineTotal });
  };

  const handleDecrement = (item: ContextOrderItem) => {
    if (item.qty <= 1) {
      removeItem(item.id);
    } else {
      const newQty = item.qty - 1;
      const lineTotal = item.unitPrice * newQty;
      updateItem(item.id, { qty: newQty, lineTotal });
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-h3 font-semibold">Order Summary</h2>
        {state.member && (
          <p className="text-sm text-muted-foreground mt-1">
            {state.member.first_name} {state.member.last_name}
          </p>
        )}
        {state.isNonMember && (
          <Badge variant="warning" className="mt-1">
            Non-Member
          </Badge>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No items added</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap products to add them to order
            </p>
          </div>
        ) : (
          state.items.map((item: ContextOrderItem) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-background-tertiary"
            >
              <div className="flex items-start gap-3">
                {/* Quantity controls */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleIncrement(item)}
                    className="h-6 w-6 rounded bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold">{item.qty}</span>
                  <button
                    onClick={() => handleDecrement(item)}
                    className="h-6 w-6 rounded bg-background-secondary text-muted-foreground flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    {item.qty === 1 ? (
                      <Trash2 className="h-3 w-3" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Item details */}
                <button
                  onClick={() => onItemTap?.(item)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.modifiers.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.modifiers.map((m) => m.name).join(', ')}
                    </p>
                  )}
                  {item.note && (
                    <p className="text-xs text-warning mt-0.5 italic">
                      {item.note}
                    </p>
                  )}
                </button>

                {/* Price */}
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-border space-y-3">
        {state.scheduledTime && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/20">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm text-accent">
              Scheduled: {state.scheduledTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(state.subtotal)}</span>
          </div>
          {state.discountPercent > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount ({state.discountPercent}%)</span>
              <span>
                -{formatCurrency(state.subtotal * (state.discountPercent / 100))}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(state.taxAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(state.total)}</span>
          </div>
        </div>

        {/* Action button */}
        <Button
          onClick={() => {
            if (state.step === 'submit') {
              onCheckout?.();
            } else {
              nextStep();
            }
          }}
          disabled={!canProceed}
          className="w-full h-12"
          size="lg"
        >
          {state.step === 'items' && (
            <>
              Select Table
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
          {state.step === 'table' && (
            <>
              Review Order
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
          {state.step === 'submit' && 'Submit Order'}
        </Button>
      </div>
    </div>
  );
}
