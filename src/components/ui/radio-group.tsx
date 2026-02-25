// City Club HMS - Radio Group Component
// For single-select options (required modifiers like cook temperature)

'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/core/lib/utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-5 w-5 rounded-full border border-border bg-input',
        'ring-offset-background transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Radio option with label - for modifier options
interface RadioOptionProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
  description?: string;
  price?: number;
}

const RadioOption = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioOptionProps
>(({ label, description, price, className, id, value, ...props }, ref) => {
  const radioId = id || `radio-${value}`;

  return (
    <div className="flex items-start gap-3">
      <RadioGroupItem ref={ref} id={radioId} value={value} className={className} {...props} />
      <div className="flex-1 grid gap-0.5 leading-none">
        <label
          htmlFor={radioId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {label}
          {price !== undefined && price > 0 && (
            <span className="ml-2 text-muted-foreground">
              +${price.toFixed(2)}
            </span>
          )}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
});
RadioOption.displayName = 'RadioOption';

// Modifier card style - for prominent selection
interface ModifierCardProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
  isSelected?: boolean;
}

const ModifierCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ModifierCardProps
>(({ label, isSelected, className, value, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      value={value}
      className={cn(
        'flex items-center justify-center px-4 py-3 rounded-xl',
        'border-2 transition-all duration-200 touch-target',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'data-[state=unchecked]:border-border data-[state=unchecked]:bg-background-secondary',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary/10',
        'hover:bg-background-tertiary',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'text-sm font-semibold',
          'data-[state=checked]:text-primary'
        )}
      >
        {label}
      </span>
    </RadioGroupPrimitive.Item>
  );
});
ModifierCard.displayName = 'ModifierCard';

export { RadioGroup, RadioGroupItem, RadioOption, ModifierCard };
