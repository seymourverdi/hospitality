// City Club HMS - Member Selector
// Search and select member or toggle non-member

'use client';

import * as React from 'react';
import { Search, UserX, X } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useOrder } from '../context/order-context';
import type { Member } from '@/core/database.types';

// Mock members - will be replaced with Supabase query
const mockMembers: Member[] = [
  {
    id: '1',
    member_number: 'CC001',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '555-0101',
    avatar_url: null,
    notes: null,
    default_discount_percent: 15,
    dietary_restrictions: ['gluten-free'],
    favorite_items: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    member_number: 'CC002',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '555-0102',
    avatar_url: null,
    notes: 'VIP - Birthday next week',
    default_discount_percent: 20,
    dietary_restrictions: [],
    favorite_items: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    member_number: 'CC003',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'mchen@email.com',
    phone: '555-0103',
    avatar_url: null,
    notes: null,
    default_discount_percent: 10,
    dietary_restrictions: ['vegetarian', 'dairy-free'],
    favorite_items: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface MemberSelectorProps {
  className?: string;
}

export function MemberSelector({ className }: MemberSelectorProps) {
  const { state, dispatch } = useOrder();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return mockMembers.filter(
      (m) =>
        m.first_name.toLowerCase().includes(query) ||
        m.last_name.toLowerCase().includes(query) ||
        m.member_number.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectMember = (member: Member) => {
    dispatch({ type: 'SET_MEMBER', member });
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleClearMember = () => {
    dispatch({ type: 'SET_MEMBER', member: null });
  };

  const handleToggleNonMember = (checked: boolean) => {
    dispatch({ type: 'SET_NON_MEMBER', isNonMember: checked });
  };

  // If member is selected, show member card
  if (state.member) {
    const member = state.member;
    return (
      <div className={cn('p-4 rounded-xl bg-card border border-border', className)}>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback>
              {member.first_name[0]}
              {member.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {member.member_number}
            </p>
            {member.default_discount_percent > 0 && (
              <Badge variant="discount" className="mt-1">
                {member.default_discount_percent}% discount
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearMember}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {member.dietary_restrictions && member.dietary_restrictions.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {member.dietary_restrictions.map((restriction: string) => (
              <Badge key={restriction} variant="allergen">
                {restriction}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // If non-member is toggled
  if (state.isNonMember) {
    return (
      <div className={cn('p-4 rounded-xl bg-card border border-border', className)}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
            <UserX className="h-6 w-6 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Non-Member Guest</p>
            <Input
              placeholder="Guest name (optional)"
              value={state.guestName}
              onChange={(e) =>
                dispatch({
                  type: 'SET_NON_MEMBER',
                  isNonMember: true,
                  guestName: e.target.value,
                })
              }
              className="mt-2 h-10"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleNonMember(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Default: member search
  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearching(true);
          }}
          onFocus={() => setIsSearching(true)}
          className="pl-10"
        />
      </div>

      {/* Search results */}
      {isSearching && searchQuery && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {filteredMembers.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="flex items-center gap-3 w-full p-3 hover:bg-background-secondary transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.first_name[0]}
                      {member.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.member_number}
                    </p>
                  </div>
                  {member.default_discount_percent > 0 && (
                    <Badge variant="discount">
                      {member.default_discount_percent}%
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No members found
            </div>
          )}
        </div>
      )}

      {/* Non-member toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <UserX className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Non-Member</span>
        </div>
        <Switch
          checked={state.isNonMember}
          onCheckedChange={handleToggleNonMember}
        />
      </div>
    </div>
  );
}
