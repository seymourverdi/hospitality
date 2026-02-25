// City Club HMS - Popular Items Component
// Top selling items for dashboard

'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PopularItem {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  count: number;
  revenue: number;
}

interface PopularItemsProps {
  items: PopularItem[];
  className?: string;
}

export function PopularItems({ items, className }: PopularItemsProps) {
  // Sort by count descending
  const sortedItems = [...items].sort((a, b) => b.count - a.count);
  const maxCount = sortedItems[0]?.count || 1;

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <h3 className="text-h4 font-semibold">Popular Items</h3>

        <div className="space-y-3">
          {sortedItems.slice(0, 5).map((item, index) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-4">
                    {index + 1}.
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: item.categoryColor + '20', color: item.categoryColor }}
                  >
                    {item.category}
                  </Badge>
                </div>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
