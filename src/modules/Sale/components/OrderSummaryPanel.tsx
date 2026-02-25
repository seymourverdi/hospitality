// City Club HMS - Order Summary Panel Component
// Right sidebar matching Figma design exactly: 510px width, #404040 background

'use client';

import * as React from 'react';
import { Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { OrderItemsList } from './OrderLineItem';
import { DiscountPopover } from './DiscountPopover';
import type { OrderItem, Member } from '../types';

interface OrderSummaryPanelProps {
  items: OrderItem[];
  selectedMember: Member | null;
  isNonMember: boolean;
  skipSeating: boolean;
  currentStep: number;
  selectedDiscount: number | null;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  scheduledTime: Date | null;
  canProceed: boolean;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onDiscountChange: (tier: number | null) => void;
  onScheduleClick: () => void;
  onNextStep: () => void;  // Keep for compatibility
  onPrevStep: () => void;  // Keep for compatibility
  className?: string;
}

export function OrderSummaryPanel({
  items,
  selectedMember,
  isNonMember,
  skipSeating: _skipSeating,
  currentStep,
  selectedDiscount,
  subtotal: _subtotal,
  tax,
  total,
  itemCount,
  scheduledTime,
  canProceed,
  onIncrease,
  onDecrease,
  onDiscountChange,
  onScheduleClick,
  onNextStep,
  onPrevStep,
  className,
}: OrderSummaryPanelProps) {
  // These props are kept for API compatibility but no longer used in this component
  void _skipSeating;
  void _subtotal;
  // Format time for display
  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Current time display
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={cn(
        // Figma specs: wider panel, #404040 background, full height
        'w-[420px] xl:w-[510px] bg-[#404040] flex flex-col h-full',
        className
      )}
    >
      {/* Header - Figma: Inter Semi Bold 28px */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-[28px] leading-6">Order Summary</h2>
          <div className="flex items-center gap-2">
            {/* Current Time Badge */}
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-white/70 text-xs font-medium">
              {currentTime}
            </span>

            {/* Member/Non-Member Badge */}
            {isNonMember ? (
              <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                Non-Member
              </span>
            ) : selectedMember ? (
              <span className="px-3 py-1.5 rounded-lg bg-[#4ADE80] text-[#1a1a1a] text-xs font-semibold">
                {selectedMember.name}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Order Items List - scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <span className="text-sm">No items added</span>
            <span className="text-xs mt-1">Tap products to add them to order</span>
          </div>
        ) : (
          <OrderItemsList
            items={items}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />
        )}
      </div>

      {/* Schedule Option - matching Figma layout */}
      <div className="px-6 py-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/50" />
            <span className="text-white/70 text-sm">Schedule</span>
            <span className="text-white/40 text-xs">Optional</span>
          </div>
          <button
            onClick={onScheduleClick}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
              'min-h-[36px]', // Touch target
              scheduledTime
                ? 'bg-[#4ADE80]/20 text-[#4ADE80]'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            )}
          >
            {scheduledTime ? formatTime(scheduledTime) : 'Pick a Time'}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Section - Totals and Navigation */}
      <div className="px-6 py-3 border-t border-white/10">
        <div className="flex items-center justify-between h-[50px]">
          {/* Left side: Item count badge + Totals */}
          <div className="flex items-center gap-3">
            {/* Green circle with item count */}
            <div className="w-[36px] h-[36px] rounded-full bg-[#4ADE80] flex items-center justify-center flex-shrink-0">
              <span className="text-[#1a1a1a] text-[16px] font-bold">{itemCount}</span>
            </div>
            {/* Total and Tax */}
            <div className="flex flex-col">
              <span className="text-white text-[20px] font-bold leading-tight">
                ${total.toFixed(2)}
              </span>
              <span className="text-white/50 text-[12px]">
                + ${tax.toFixed(2)} Tax
              </span>
            </div>
          </div>

          {/* Right side: Discount + Navigation buttons */}
          <div className="flex items-center gap-2">
            {/* Discount Popover - only shows when there are items */}
            <DiscountPopover
              selectedDiscount={selectedDiscount}
              onSelect={onDiscountChange}
              hasItems={items.length > 0}
            />

            {/* Back button */}
            <button
              onClick={onPrevStep}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-1 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors',
                'min-h-[40px]',
                currentStep === 0
                  ? 'bg-[#5A5A5A] text-white/30 cursor-not-allowed'
                  : 'bg-[#5A5A5A] text-white hover:bg-[#6A6A6A] active:bg-[#4A4A4A]'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {/* Next button */}
            <button
              onClick={onNextStep}
              disabled={!canProceed}
              className={cn(
                'flex items-center gap-1 px-4 py-2 rounded-lg text-[14px] font-semibold transition-colors',
                'min-h-[40px]',
                canProceed
                  ? 'bg-[#4ADE80] text-[#1a1a1a] hover:bg-[#3FCF70] active:bg-[#35B560]'
                  : 'bg-[#4ADE80]/30 text-[#1a1a1a]/50 cursor-not-allowed'
              )}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
