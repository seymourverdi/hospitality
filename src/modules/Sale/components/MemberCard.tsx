// City Club HMS - Member Card Component
// Matches Figma design: balance badge, name, table indicator

'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import type { Member } from '../types';

interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  onSelect: (member: Member) => void;
  className?: string;
}

export function MemberCard({
  member,
  isSelected,
  onSelect,
  className,
}: MemberCardProps) {
  return (
    <button
      onClick={() => onSelect(member)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all text-left w-full',
        'min-h-[56px]', // Touch target
        'active:scale-[0.98]',
        isSelected
          ? 'bg-primary/20 border-2 border-primary'
          : 'bg-sale-panel hover:bg-[#222] border-2 border-transparent',
        className
      )}
    >
      {/* Balance Badge */}
      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-medium flex-shrink-0">
        ${member.balance}
      </span>

      {/* Member Name */}
      <span className="text-white text-sm flex-1 truncate">{member.name}</span>

      {/* Discount tier indicator (if applicable) */}
      {member.discountTier && (
        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-medium">
          {member.discountTier}%
        </span>
      )}

      {/* Table indicator */}
      <span className="text-white/40 text-xs">Table</span>
      <Users className="h-4 w-4 text-white/40 flex-shrink-0" />
    </button>
  );
}

// Member List Grid
interface MemberListProps {
  members: Member[];
  selectedMemberId: string | null;
  onSelectMember: (member: Member) => void;
  className?: string;
}

export function MemberList({
  members,
  selectedMemberId,
  onSelectMember,
  className,
}: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <p className="text-white/40 text-sm">No members found</p>
        <p className="text-white/30 text-xs mt-1">
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-3', className)}>
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          isSelected={selectedMemberId === member.id}
          onSelect={onSelectMember}
        />
      ))}
    </div>
  );
}
