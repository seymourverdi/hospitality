// City Club HMS - Stats Dashboard Page
// Dashboard matching Figma design exactly

'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/core/lib/utils';

// Mock data matching Figma design
const statsData = {
  revenue: {
    daily: { amount: 3839.90, change: 15.8, positive: true },
    weekly: { amount: 12571.91, change: 12.3, positive: true },
    monthly: { amount: 39421.21, change: 18.2, positive: true },
    quarter: { amount: 92114.95, change: 1.9, positive: false },
  },
  tickets: {
    daily: { count: 129, change: 18.2, positive: true },
    weekly: { count: 659, change: 12.1, positive: true },
  },
  popularItems: [
    { rank: 13, name: 'Gotham Greens Salad' },
    { rank: 9, name: '[Side] Chicken' },
    { rank: 7, name: 'Classic Caesar Salad' },
    { rank: 4, name: 'Ricotta Gnudi' },
  ],
};

// Period badge component
function PeriodBadge({ period }: { period: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/60">
      {period}
    </span>
  );
}

// Change badge component
function ChangeBadge({ value, positive }: { value: number; positive: boolean }) {
  return (
    <span
      className={cn(
        'px-2 py-1 rounded text-xs font-semibold flex items-center gap-1',
        positive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      )}
    >
      {positive ? '↑' : '↓'} {value}%
    </span>
  );
}

// Revenue Card component matching Figma
function RevenueCard({
  title,
  period,
  amount,
  change,
  positive,
}: {
  title: string;
  period: string;
  amount: number;
  change: number;
  positive: boolean;
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-black">$</span>
          </div>
          <span className="text-white/80 text-sm font-medium">{title}</span>
          <PeriodBadge period={period} />
        </div>
        <button className="text-white/40 hover:text-white/60">
          <Info className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <ChangeBadge value={change} positive={positive} />
      </div>
    </div>
  );
}

// Tickets Card component matching Figma
function TicketsCard({
  period,
  count,
  change,
  positive,
}: {
  period: string;
  count: number;
  change: number;
  positive: boolean;
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-3 flex-1">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
          <span className="text-xs">🎫</span>
        </div>
        <span className="text-white/80 text-sm font-medium">Tickets</span>
        <PeriodBadge period={period} />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">{count}</span>
        <ChangeBadge value={change} positive={positive} />
      </div>
    </div>
  );
}

// Popular Items Card matching Figma
function PopularItemsCard({
  period,
  items,
}: {
  period: string;
  items: { rank: number; name: string }[];
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
          <span className="text-xs">🏆</span>
        </div>
        <span className="text-white/80 text-sm font-medium">Popular Items</span>
        <PeriodBadge period={period} />
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
              {item.rank}
            </span>
            <span className="text-white/90 text-sm">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { revenue, tickets, popularItems } = statsData;

  return (
    <div className="min-h-screen p-4 space-y-4">
      {/* Revenue Cards */}
      <RevenueCard
        title="Revenue"
        period="Daily"
        amount={revenue.daily.amount}
        change={revenue.daily.change}
        positive={revenue.daily.positive}
      />
      <RevenueCard
        title="Revenue"
        period="Weekly"
        amount={revenue.weekly.amount}
        change={revenue.weekly.change}
        positive={revenue.weekly.positive}
      />
      <RevenueCard
        title="Revenue"
        period="Monthly"
        amount={revenue.monthly.amount}
        change={revenue.monthly.change}
        positive={revenue.monthly.positive}
      />
      <RevenueCard
        title="Revenue"
        period="Quarter"
        amount={revenue.quarter.amount}
        change={revenue.quarter.change}
        positive={revenue.quarter.positive}
      />

      {/* Tickets Cards - Side by Side */}
      <div className="flex gap-4">
        <TicketsCard
          period="Daily"
          count={tickets.daily.count}
          change={tickets.daily.change}
          positive={tickets.daily.positive}
        />
        <TicketsCard
          period="Weekly"
          count={tickets.weekly.count}
          change={tickets.weekly.change}
          positive={tickets.weekly.positive}
        />
      </div>

      {/* Popular Items */}
      <PopularItemsCard period="Daily" items={popularItems} />
    </div>
  );
}
