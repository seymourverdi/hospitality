// City Club HMS - Display Filters
// Filter controls for kitchen display

'use client';

import * as React from 'react';
import { ChefHat, Wine, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { DisplayFilters } from '../types';

interface DisplayFiltersBarProps {
  filters: DisplayFilters;
  onFiltersChange: (filters: DisplayFilters) => void;
  className?: string;
}

export function DisplayFiltersBar({
  filters,
  onFiltersChange,
  className,
}: DisplayFiltersBarProps) {
  const routingOptions = [
    { value: 'all', label: 'All', icon: LayoutGrid },
    { value: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { value: 'bar', label: 'Bar', icon: Wine },
  ] as const;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-4',
        'border-b border-border bg-background/95 backdrop-blur',
        className
      )}
    >
      {/* Routing filter */}
      <div className="flex items-center gap-2">
        {routingOptions.map((option) => {
          const Icon = option.icon;
          const isActive = filters.routing === option.value;

          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'secondary'}
              size="sm"
              onClick={() =>
                onFiltersChange({ ...filters, routing: option.value })
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Show complete toggle */}
      <div className="flex items-center gap-2">
        {filters.showComplete ? (
          <Eye className="h-4 w-4 text-muted-foreground" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground">Show Complete</span>
        <Switch
          checked={filters.showComplete}
          onCheckedChange={(checked) =>
            onFiltersChange({ ...filters, showComplete: checked })
          }
        />
      </div>
    </div>
  );
}
