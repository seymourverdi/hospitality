// City Club HMS - Select Person Screen (Step 2)
// Virtual keyboard + Member list for member selection

'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { AlphabetKeyboard } from '../components/AlphabetKeyboard';
import { MemberList } from '../components/MemberCard';
import { useSale } from '../context/SaleContext';
import type { Member } from '../types';

interface SelectPersonScreenProps {
  className?: string;
}

export function SelectPersonScreen({ className }: SelectPersonScreenProps) {
  const {
    state,
    setSearchQuery,
    selectMember,
  } = useSale();

  const { searchQuery, selectedMember, isNonMember } = state;

  const [localSearch, setLocalSearch] = React.useState(searchQuery);
  const [allMembers, setAllMembers]   = React.useState<Member[]>([]);
  const [loadError, setLoadError]     = React.useState(false);

  // Load members from DB on mount
  React.useEffect(() => {
    void (async () => {
      try {
        const res  = await fetch('/api/sale/members', { cache: 'no-store' });
        const data = await res.json() as { ok: boolean; members?: Member[] };
        if (data.ok && data.members) setAllMembers(data.members);
        else setLoadError(true);
      } catch { setLoadError(true); }
    })();
  }, []);

  // Filter locally by search
  const filteredMembers = React.useMemo(() => {
    const q = localSearch.toLowerCase().trim();
    if (!q) return allMembers;
    return allMembers.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      m.accountNumber.toLowerCase().includes(q)
    );
  }, [allMembers, localSearch]);

  // Find highlighted key
  const highlightedKey = React.useMemo(() => {
    if (!localSearch) return filteredMembers[0]?.firstName?.[0]?.toUpperCase();
    const nextMatch = filteredMembers[0];
    if (nextMatch && nextMatch.name.length > localSearch.length) {
      return nextMatch.name[localSearch.length]?.toUpperCase();
    }
    return undefined;
  }, [localSearch, filteredMembers]);

  // Handle keyboard key press
  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setLocalSearch(prev => prev.slice(0, -1));
    } else {
      setLocalSearch(prev => prev + key);
    }
  };

  // Sync local search to context
  React.useEffect(() => {
    setSearchQuery(localSearch);
  }, [localSearch, setSearchQuery]);

  // If non-member mode, show email input instead
  if (isNonMember) {
    return (
      <div className={cn('flex-1 flex flex-col bg-sale-bg p-4', className)}>
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto">
          <h2 className="text-white text-xl font-semibold mb-2">Non-Member Order</h2>
          <p className="text-white/60 text-sm mb-6 text-center">
            Enter the guest's email address for receipt delivery
          </p>

          {/* Email input */}
          <input
            type="email"
            placeholder="guest@example.com"
            className={cn(
              'w-full h-12 px-4 rounded-lg',
              'bg-sale-card text-white placeholder:text-white/40',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              'text-center text-lg'
            )}
          />

          <p className="text-white/30 text-xs mt-4 text-center">
            A receipt will be sent to this email after order completion
          </p>
        </div>

        {/* Virtual Keyboard for email */}
        <div className="mt-auto pt-4">
          <AlphabetKeyboard onKeyPress={handleKeyPress} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 flex flex-col bg-sale-bg p-4', className)}>
      {/* Search Input Display */}
      <div className="mb-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-sale-card">
          <span className="text-white/40 text-sm">Search:</span>
          <span className="text-white text-lg flex-1">
            {localSearch || <span className="text-white/30">Type a name...</span>}
          </span>
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="text-white/40 hover:text-white text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Virtual Keyboard */}
      <AlphabetKeyboard
        onKeyPress={handleKeyPress}
        highlightedKey={highlightedKey}
        className="mb-6"
      />

      {/* Member List */}
      <div className="flex-1 overflow-y-auto">
        {loadError ? (
          <div className="flex items-center justify-center py-10 text-red-400/70 text-sm">Failed to load members</div>
        ) : allMembers.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-white/20 text-sm">Loading…</div>
        ) : (
          <MemberList
            members={filteredMembers}
            selectedMemberId={selectedMember?.id || null}
            onSelectMember={selectMember}
          />
        )}
      </div>

      {/* Add Guest Option */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-white/40" />
            <span className="text-white/60 text-sm">Add Guest Name</span>
            <span className="text-white/30 text-xs">Optional</span>
          </div>
          <button className="px-4 py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors">
            Guest Name...
          </button>
        </div>
      </div>
    </div>
  );
}