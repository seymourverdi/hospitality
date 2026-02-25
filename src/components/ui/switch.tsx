// City Club HMS - Switch/Toggle Component
// For toggles like "Skip Seating" and "Non-Member"

'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/core/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    label?: string;
    labelPosition?: 'left' | 'right';
  }
>(({ className, label, labelPosition = 'left', ...props }, ref) => {
  const switchElement = (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted',
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0',
          'transition-transform duration-200',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  );

  if (!label) return switchElement;

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {labelPosition === 'left' && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      {switchElement}
      {labelPosition === 'right' && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </label>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
