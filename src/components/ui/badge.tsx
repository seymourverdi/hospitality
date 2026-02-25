// City Club HMS - Badge/Pill Component
// For routing indicators, status tags, allergens, count badges

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        // Default - Muted background
        default: 'bg-muted text-muted-foreground',
        // Primary - Teal
        primary: 'bg-primary text-primary-foreground',
        // Secondary
        secondary: 'bg-secondary text-secondary-foreground',
        // Destructive - Red
        destructive: 'bg-destructive text-destructive-foreground',
        // Success - Green
        success: 'bg-success text-success-foreground',
        // Warning - Orange
        warning: 'bg-warning text-warning-foreground',
        // Outline
        outline: 'border border-border text-foreground bg-transparent',

        // Routing badges
        kitchen: 'bg-green-500 text-white',
        bar: 'bg-blue-500 text-white',

        // Status badges
        incoming: 'bg-gray-600 text-white',
        fired: 'bg-orange-500 text-white',
        complete: 'bg-green-500 text-white',
        scheduled: 'bg-blue-500 text-white',
        cancelled: 'bg-red-500 text-white',

        // Discount badges
        discount: 'bg-green-600 text-white',

        // Allergen badge
        allergen: 'bg-red-500/20 text-red-400 border border-red-500/30',

        // Count badge (for item counts)
        count: 'bg-background-tertiary text-foreground',

        // Member badge
        member: 'bg-primary/20 text-primary',
        nonMember: 'bg-destructive/20 text-destructive',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
        // Count badge sizes
        count: 'min-w-[24px] h-6 px-2 text-xs',
        'count-sm': 'min-w-[20px] h-5 px-1.5 text-[10px]',
        'count-lg': 'min-w-[28px] h-7 px-2.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Numeric value for count badges */
  count?: number;
}

function Badge({ className, variant, size, count, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {count !== undefined ? count : children}
    </span>
  );
}

export { Badge, badgeVariants };
