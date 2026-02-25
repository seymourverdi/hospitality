// City Club HMS - Discount Chips Component
// Matches Figma design: colored "×10 Discount" pill buttons

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { DISCOUNT_TIERS } from '../constants';

// Percentage icon SVG component
function PercentageIcon({ className }: { className?: string }) {
  return (
    <svg
      width="7"
      height="7"
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.53308 0.100954C5.14768 0.311623 0.291487 5.1456 0.017879 5.68C-0.138093 5.98461 0.763775 6.98052 1.27086 6.81359C1.57332 6.71419 7.02728 1.40176 7.00293 1.01782C6.97002 0.498451 6.22723 -0.278874 5.53308 0.100954ZM2.52143 1.53047C2.60302 1.01885 2.41821 0.42378 1.63386 0.296132C0.849066 0.168449 0.474 0.685999 0.395183 1.1844C0.321257 1.64997 0.506524 2.24687 1.27103 2.41057C2.06169 2.57929 2.44031 2.04211 2.52143 1.53047ZM4.92851 4.85551C4.3664 5.42413 4.56158 6.03476 4.91454 6.39173C5.24406 6.72506 5.83096 6.92296 6.40975 6.39173C7.00882 5.84226 6.79966 5.21715 6.4377 4.85096C6.07573 4.48435 5.49017 4.28735 4.92851 4.85551Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Color mapping for each discount tier badge
const TIER_COLORS: Record<number, { bg: string; text: string; selectedBg: string }> = {
  10: { bg: 'bg-[#4ADE80]', text: 'text-black', selectedBg: 'bg-[#4ADE80]/20' },
  15: { bg: 'bg-[#60A5FA]', text: 'text-white', selectedBg: 'bg-[#60A5FA]/20' },
  20: { bg: 'bg-[#A78BFA]', text: 'text-white', selectedBg: 'bg-[#A78BFA]/20' },
  25: { bg: 'bg-[#F87171]', text: 'text-white', selectedBg: 'bg-[#F87171]/20' },
};

interface DiscountChipsProps {
  selectedDiscount: number | null;
  onSelect: (tier: number | null) => void;
  className?: string;
}

export function DiscountChips({
  selectedDiscount,
  onSelect,
  className,
}: DiscountChipsProps) {
  const handleClick = (tier: number) => {
    // Toggle off if already selected, otherwise select
    onSelect(selectedDiscount === tier ? null : tier);
  };

  return (
    <div className={cn('flex gap-[10px]', className)}>
      {DISCOUNT_TIERS.map((tier) => {
        const isSelected = selectedDiscount === tier;
        const defaultColors = { bg: 'bg-[#4ADE80]', text: 'text-black', selectedBg: 'bg-[#4ADE80]/20' };
        const colors = TIER_COLORS[tier] ?? defaultColors;

        return (
          <button
            key={tier}
            onClick={() => handleClick(tier)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-1 py-1.5 rounded-lg transition-all duration-150',
              'min-h-[36px]', // Touch target
              'active:scale-95',
              isSelected
                ? colors.selectedBg
                : 'bg-[#4A4A4A] hover:bg-[#555555]'
            )}
          >
            {/* Colored badge with percentage icon and number */}
            <span
              className={cn(
                'flex items-center gap-1 pl-[5px] pr-1.5 py-0.5 rounded text-[12px] font-bold',
                colors.bg,
                colors.text
              )}
            >
              <PercentageIcon />
              <span>{tier}</span>
            </span>
            {/* Discount label */}
            <span className={cn(
              'text-[10px] font-semibold',
              isSelected ? 'text-white' : 'text-white/60'
            )}>
              Discount
            </span>
          </button>
        );
      })}
    </div>
  );
}
