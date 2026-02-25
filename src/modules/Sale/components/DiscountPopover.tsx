// City Club HMS - Discount Popover Component
// Shows discount tier buttons and custom discount input in a popover

'use client';

import * as React from 'react';
import { Percent } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DISCOUNT_TIERS } from '../constants';

// Percentage icon SVG component (reused from DiscountChips)
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

interface DiscountPopoverProps {
  selectedDiscount: number | null;
  onSelect: (tier: number | null) => void;
  hasItems: boolean;
  className?: string;
}

export function DiscountPopover({
  selectedDiscount,
  onSelect,
  hasItems,
  className,
}: DiscountPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState('');
  const [isPercentage, setIsPercentage] = React.useState(true);

  // Check if the current discount is a custom value (not one of the preset tiers)
  const isCustomDiscount = selectedDiscount !== null && !(DISCOUNT_TIERS as readonly number[]).includes(selectedDiscount);

  // Sync custom input with selected discount when it's a custom value
  React.useEffect(() => {
    if (isCustomDiscount && selectedDiscount !== null) {
      setCustomValue(selectedDiscount.toString());
    }
  }, [selectedDiscount, isCustomDiscount]);

  const handleTierClick = (tier: number) => {
    // Toggle off if already selected, otherwise select
    onSelect(selectedDiscount === tier ? null : tier);
    setCustomValue('');
  };

  const handleCustomSubmit = () => {
    const value = parseFloat(customValue);
    if (!isNaN(value) && value > 0) {
      if (isPercentage) {
        // Cap percentage at 100%
        onSelect(Math.min(value, 100));
      } else {
        // For dollar amounts, we'll pass negative to indicate it's a fixed amount
        // The context/reducer would need to handle this differently
        // For now, treat as percentage for simplicity
        onSelect(Math.min(value, 100));
      }
    }
  };

  const handleClearDiscount = () => {
    onSelect(null);
    setCustomValue('');
  };

  // Get display color for the trigger button
  const getTriggerColor = () => {
    if (!selectedDiscount) return null;
    if (TIER_COLORS[selectedDiscount]) return TIER_COLORS[selectedDiscount];
    // Custom discount - use a neutral purple color
    return { bg: 'bg-[#8B5CF6]', text: 'text-white', selectedBg: 'bg-[#8B5CF6]/20' };
  };

  const triggerColor = getTriggerColor();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={!hasItems}
          className={cn(
            'flex items-center justify-center rounded-lg transition-all duration-150',
            'min-h-[40px] min-w-[40px]',
            'active:scale-95',
            !hasItems
              ? 'bg-[#5A5A5A]/50 text-white/30 cursor-not-allowed'
              : selectedDiscount
                ? triggerColor?.selectedBg
                : 'bg-[#5A5A5A] text-white/70 hover:bg-[#6A6A6A]',
            className
          )}
        >
          {selectedDiscount ? (
            <span
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-[12px] font-bold',
                triggerColor?.bg,
                triggerColor?.text
              )}
            >
              <PercentageIcon />
              <span>{selectedDiscount}</span>
            </span>
          ) : (
            <Percent className="h-4 w-4" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-[320px] bg-[#3A3A3A] border-white/10 p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-semibold">Apply Discount</span>
          {selectedDiscount && (
            <button
              onClick={handleClearDiscount}
              className="text-red-400 text-xs hover:text-red-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Preset Discount Tiers - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {DISCOUNT_TIERS.map((tier) => {
            const isSelected = selectedDiscount === tier;
            const defaultColors = { bg: 'bg-[#4ADE80]', text: 'text-black', selectedBg: 'bg-[#4ADE80]/20' };
            const colors = TIER_COLORS[tier] ?? defaultColors;

            return (
              <button
                key={tier}
                onClick={() => handleTierClick(tier)}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-150',
                  'min-h-[40px]',
                  'active:scale-95',
                  isSelected
                    ? colors.selectedBg
                    : 'bg-[#4A4A4A] hover:bg-[#555555]'
                )}
              >
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

        {/* Divider */}
        <div className="h-px bg-white/10 mb-4" />

        {/* Custom Discount Input */}
        <div className="space-y-2">
          <span className="text-white/60 text-xs">Custom Discount</span>
          <div className="flex items-center gap-2">
            {/* Toggle between % and $ */}
            <div className="flex rounded-lg overflow-hidden bg-[#4A4A4A] flex-shrink-0">
              <button
                onClick={() => setIsPercentage(true)}
                className={cn(
                  'w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors',
                  isPercentage
                    ? 'bg-[#4ADE80] text-black'
                    : 'text-white/60 hover:text-white'
                )}
              >
                %
              </button>
              <button
                onClick={() => setIsPercentage(false)}
                className={cn(
                  'w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors',
                  !isPercentage
                    ? 'bg-[#4ADE80] text-black'
                    : 'text-white/60 hover:text-white'
                )}
              >
                $
              </button>
            </div>
            {/* Input */}
            <input
              type="number"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit();
                }
              }}
              placeholder={isPercentage ? 'Enter %' : 'Enter $'}
              className={cn(
                'flex-1 min-w-0 px-3 py-2 rounded-lg h-8',
                'bg-[#4A4A4A] text-white placeholder:text-white/40 text-sm',
                'focus:outline-none focus:ring-1 focus:ring-primary',
                'transition-shadow'
              )}
            />
            {/* Apply Button */}
            <button
              onClick={handleCustomSubmit}
              disabled={!customValue || parseFloat(customValue) <= 0}
              className={cn(
                'px-3 h-8 rounded-lg text-xs font-semibold transition-colors flex-shrink-0',
                customValue && parseFloat(customValue) > 0
                  ? 'bg-[#4ADE80] text-black hover:bg-[#3FCF70]'
                  : 'bg-[#4ADE80]/30 text-black/50 cursor-not-allowed'
              )}
            >
              Apply
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
