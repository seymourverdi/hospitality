// City Club HMS - Stats Card Component
// Revenue and metric cards for dashboard

'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/core/lib/utils';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  className,
}: StatsCardProps) {
  const displayValue =
    typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <Card className={cn('p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg bg-background-tertiary',
              iconColor
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-h1 font-bold">{displayValue}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}% from yesterday
          </p>
        )}
      </div>
    </Card>
  );
}

// Revenue card variant with gradient
interface RevenueCardProps {
  title: string;
  amount: number;
  periodLabel?: string;
  className?: string;
}

export function RevenueCard({
  title,
  amount,
  periodLabel = 'Today',
  className,
}: RevenueCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden p-5',
        'bg-gradient-to-br from-primary/20 to-primary/5',
        'border-primary/30',
        className
      )}
    >
      <div className="relative z-10 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-h1 font-bold text-foreground">
          {formatCurrency(amount)}
        </p>
        <p className="text-sm text-muted-foreground">{periodLabel}</p>
      </div>
      {/* Decorative gradient */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
    </Card>
  );
}
