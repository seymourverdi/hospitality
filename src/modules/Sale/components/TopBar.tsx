// City Club HMS - Top Bar Component
// Matches Figma design: Search, Kitchen Notice, Skip Seating toggle, Non-Member toggle, Member badge

'use client';

import * as React from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import type { Member } from '../types';

// Toggle Switch Component
interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}

export function Toggle({ enabled, onChange, className }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'w-12 h-6 rounded-full transition-colors relative',
        enabled ? 'bg-primary' : 'bg-white/20',
        'min-w-[48px]', // Touch target
        className
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
          enabled ? 'left-7' : 'left-1'
        )}
      />
    </button>
  );
}

interface TopBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  isNonMember: boolean;
  onNonMemberToggle: () => void;
  skipSeating: boolean;
  onSkipSeatingToggle: () => void;
  selectedMember: Member | null;
  showSkipSeating?: boolean;
  showNonMember?: boolean;
  kitchenNotice?: {
    message: string;
    active: boolean;
  };
  className?: string;
}

export function TopBar({
  searchValue,
  onSearchChange,
  isNonMember,
  onNonMemberToggle,
  skipSeating,
  onSkipSeatingToggle,
  selectedMember,
  showSkipSeating = true,
  showNonMember = true,
  kitchenNotice,
  className,
}: TopBarProps) {
  return (
    <div className={cn('flex items-center gap-3 pt-[17px] pb-3 px-3', className)}>
      {/* Search Input */}
      <div className="flex-1 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full h-10 pl-10 pr-4 rounded-lg',
            'bg-sale-card text-white placeholder:text-white/40 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-primary',
            'transition-shadow'
          )}
        />
      </div>

      {/* Kitchen Notice Banner */}
      {kitchenNotice?.active && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-xs flex-1 max-w-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{kitchenNotice.message}</span>
        </div>
      )}

      {/* Skip Seating Toggle */}
      {showSkipSeating && (
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm whitespace-nowrap">Skip Seating</span>
          <Toggle enabled={skipSeating} onChange={onSkipSeatingToggle} />
        </div>
      )}

      {/* Non-Member Toggle */}
      {showNonMember && (
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm whitespace-nowrap">Non-Member</span>
          <Toggle enabled={isNonMember} onChange={onNonMemberToggle} />
        </div>
      )}

      {/* Member Badge (when member selected and not non-member) */}
      {selectedMember && !isNonMember && (
        <span className="px-3 py-1.5 rounded-lg bg-sale-card text-white text-sm flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">
            {selectedMember.firstName.charAt(0)}
          </span>
          {selectedMember.name}
        </span>
      )}

      {/* Non-Member Badge (when non-member mode active) */}
      {isNonMember && (
        <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
          Non-Member
        </span>
      )}
    </div>
  );
}