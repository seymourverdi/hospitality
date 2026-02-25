// City Club HMS - Order Stepper
// Visual step indicator for order flow

'use client';

import * as React from 'react';
import { Check, ShoppingCart, MapPin, Send } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import type { SaleStep } from '../types';

interface StepperProps {
  currentStep: SaleStep;
  onStepClick?: (step: SaleStep) => void;
  className?: string;
}

const steps: { id: SaleStep; label: string; icon: React.ElementType }[] = [
  { id: 'select-items', label: 'Select Items', icon: ShoppingCart },
  { id: 'select-table', label: 'Select Table', icon: MapPin },
  { id: 'submit', label: 'Submit Order', icon: Send },
];

export function Stepper({ currentStep, onStepClick, className }: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStepClick?.(step.id)}
              disabled={index > currentIndex}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'bg-primary text-primary-foreground',
                isCompleted && 'bg-success/20 text-success',
                !isActive && !isCompleted && 'text-muted-foreground',
                index > currentIndex && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  isActive && 'bg-primary-foreground/20',
                  isCompleted && 'bg-success'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 max-w-8',
                  isCompleted ? 'bg-success' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
