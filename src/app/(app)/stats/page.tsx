'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/core/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type StatsConfig = {
  daily:  { revenue: boolean; tickets: boolean; avgOrderValue: boolean; events: boolean; popularItems: boolean; laborCost: boolean; foodCost: boolean; beverageCost: boolean }
  weekly: { revenue: boolean; tickets: boolean; avgOrderValue: boolean; events: boolean; popularItems: boolean; laborCost: boolean; foodCost: boolean; beverageCost: boolean }
}

type RevenuePeriod   = { amount: number; change: number; positive: boolean }
type TicketPeriod    = { count: number;  change: number; positive: boolean }
type AovPeriod       = { amount: number; change: number; positive: boolean }
type EventPeriod     = { count: number;  positive: boolean }
type PopularItem     = { menuItemId: number; name: string; count: number }
type ChartDay        = { date: string; food: number; beverage: number }

type StatsData = {
  revenue:      { daily: RevenuePeriod; weekly: RevenuePeriod; monthly: RevenuePeriod; quarterly: RevenuePeriod }
  tickets:      { daily: TicketPeriod;  weekly: TicketPeriod }
  aov:          { daily: AovPeriod }
  events:       { daily: EventPeriod;   weekly: EventPeriod }
  popularItems: { daily: PopularItem[]; weekly: PopularItem[] }
  chartData:    ChartDay[]
}

// ─── Mini components ──────────────────────────────────────────────────────────

function PeriodBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/50">
      {label}
    </span>
  )
}

function ChangeBadge({ change, positive }: { change: number; positive: boolean }) {
  return (
    <span className={cn(
      'px-2 py-1 rounded text-xs font-semibold flex items-center gap-1',
      positive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    )}>
      {positive ? '↑' : '↓'} {change.toFixed(1)}%
    </span>
  )
}

function CardWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#1a1a1a] rounded-2xl p-5', className)}>
      {children}
    </div>
  )
}

// ─── Revenue Card ─────────────────────────────────────────────────────────────

function RevenueCard({ title, period, data }: { title: string; period: string; data: RevenuePeriod }) {
  return (
    <CardWrapper>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-yellow-400/90 flex items-center justify-center">
            <span className="text-[10px] font-bold text-black">$</span>
          </div>
          <span className="text-white/80 text-sm font-medium">{title}</span>
          <PeriodBadge label={period} />
        </div>
        <button className="text-white/30 hover:text-white/60"><Info className="h-4 w-4" /></button>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">
          ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <ChangeBadge change={data.change} positive={data.positive} />
      </div>
    </CardWrapper>
  )
}

// ─── Tickets Card ─────────────────────────────────────────────────────────────

function TicketsCard({ period, data }: { period: string; data: TicketPeriod }) {
  return (
    <CardWrapper className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
          <span className="text-[10px]">🎫</span>
        </div>
        <span className="text-white/80 text-sm font-medium">Tickets</span>
        <PeriodBadge label={period} />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">{data.count.toLocaleString()}</span>
        <ChangeBadge change={data.change} positive={data.positive} />
      </div>
    </CardWrapper>
  )
}

// ─── AOV Card ─────────────────────────────────────────────────────────────────

function AovCard({ data }: { data: AovPeriod }) {
  return (
    <CardWrapper className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">Ø</span>
        </div>
        <span className="text-white/80 text-sm font-medium">AOV</span>
        <PeriodBadge label="Daily" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">
          ${data.amount.toFixed(0)}
        </span>
        <ChangeBadge change={data.change} positive={data.positive} />
      </div>
    </CardWrapper>
  )
}

// ─── Events Card ──────────────────────────────────────────────────────────────

function EventsCard({ data }: { data: EventPeriod }) {
  return (
    <CardWrapper className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <span className="text-[10px]">📅</span>
        </div>
        <span className="text-white/80 text-sm font-medium">Events</span>
        <PeriodBadge label="Daily" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">{data.count}</span>
        <span className="px-2 py-1 rounded text-xs font-semibold bg-white/10 text-white/50">—</span>
      </div>
    </CardWrapper>
  )
}

// ─── Popular Items Card ───────────────────────────────────────────────────────

function PopularItemsCard({ period, items }: { period: string; items: PopularItem[] }) {
  const max = items[0]?.count ?? 1
  return (
    <CardWrapper>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-[10px]">🏆</span>
          </div>
          <span className="text-white/80 text-sm font-medium">Popular Items</span>
          <PeriodBadge label={period} />
        </div>
        <button className="text-xs text-white/40 hover:text-white/70 transition">See All</button>
      </div>
      {items.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-4">No data</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.menuItemId} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 text-sm font-bold flex-shrink-0">
                {item.count}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90 truncate">{item.name}</p>
                <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all"
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardWrapper>
  )
}

// ─── Bar Chart Card ───────────────────────────────────────────────────────────

function BarChartCard({
  title, color, data, valueKey, total, change, positive,
}: {
  title: string
  color: string
  data: ChartDay[]
  valueKey: 'food' | 'beverage'
  total: number
  change: number
  positive: boolean
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  // Show last 7 days or all if fewer
  const visible = data.slice(-7)

  const dayLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    return ['S','M','T','W','T','F','S'][d.getDay()]
  }

  return (
    <CardWrapper>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-medium">{title}</span>
          <PeriodBadge label="Monthly" />
        </div>
        <button className="text-xs text-white/40 hover:text-white/70 transition">See All</button>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 h-16 mb-4">
        {visible.map((d, i) => {
          const val = d[valueKey]
          const height = max > 0 ? Math.max((val / max) * 100, val > 0 ? 8 : 2) : 2
          const isLast = i === visible.length - 1
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: isLast ? color : color + '66',
                  minHeight: '2px',
                }}
              />
              <span className="text-[9px] text-white/30">{dayLabel(d.date)}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">
          ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
        <ChangeBadge change={change} positive={positive} />
      </div>
    </CardWrapper>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-white/5 animate-pulse rounded-2xl', className)} />
}

// ─── Main page ────────────────────────────────────────────────────────────────

const DEFAULT_STATS_CONFIG: StatsConfig = {
  daily:  { revenue: true, tickets: true, avgOrderValue: true, events: false, popularItems: true, laborCost: false, foodCost: true, beverageCost: true },
  weekly: { revenue: true, tickets: true, avgOrderValue: true, events: false, popularItems: true, laborCost: false, foodCost: true, beverageCost: true },
}

export default function StatsPage() {
  const [stats, setStats]   = React.useState<StatsData | null>(null)
  const [cfg, setCfg]       = React.useState<StatsConfig>(DEFAULT_STATS_CONFIG)
  const [loading, setLoading] = React.useState(true)
  const [error, setError]   = React.useState<string | null>(null)

  React.useEffect(() => {
    void (async () => {
      try {
        const [statsRes, settingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/settings'),
        ])
        const statsJson    = await statsRes.json() as { ok: boolean; stats?: StatsData; error?: string }
        const settingsJson = await settingsRes.json() as { ok: boolean; settings?: { statsConfig: StatsConfig } }

        if (!statsJson.ok) throw new Error(statsJson.error ?? 'Failed to load stats')
        if (statsJson.stats) setStats(statsJson.stats)
        if (settingsJson.ok && settingsJson.settings?.statsConfig) setCfg(settingsJson.settings.statsConfig)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
        <div className="grid grid-cols-3 gap-4 pb-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="text-4xl">📊</span>
        <p className="text-white/40 text-sm">{error ?? 'No data available'}</p>
        <button
          className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white/70 hover:bg-white/20 transition"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  const { revenue, tickets, aov, events, popularItems, chartData } = stats
  const d = cfg.daily
  const w = cfg.weekly

  // Totals for chart cards (sum of current month)
  const foodTotal     = chartData.reduce((s, x) => s + x.food, 0)
  const beverageTotal = chartData.reduce((s, x) => s + x.beverage, 0)

  // Show revenue section if any revenue toggle is on
  const showRevenue = d.revenue || w.revenue

  return (
    <div className="min-h-screen p-4 space-y-4 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="bg-white/10 px-3 py-1.5 rounded-lg">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── Revenue cards ─────────────────────────────────────────────────── */}
      {showRevenue && (
        <div className="grid grid-cols-2 gap-3">
          {d.revenue  && <RevenueCard title="Revenue" period="Daily"    data={revenue.daily} />}
          {w.revenue  && <RevenueCard title="Revenue" period="Weekly"   data={revenue.weekly} />}
          {(d.revenue || w.revenue) && <RevenueCard title="Revenue" period="Monthly"  data={revenue.monthly} />}
          {(d.revenue || w.revenue) && <RevenueCard title="Revenue" period="Quarter"  data={revenue.quarterly} />}
        </div>
      )}

      {/* ── Tickets + AOV + Events row ────────────────────────────────────── */}
      {(d.tickets || w.tickets || d.avgOrderValue || d.events) && (
        <div className="flex gap-3 flex-wrap">
          {d.tickets      && <TicketsCard period="Daily"  data={tickets.daily} />}
          {w.tickets      && <TicketsCard period="Weekly" data={tickets.weekly} />}
          {d.avgOrderValue && <AovCard    data={aov.daily} />}
          {d.events        && <EventsCard data={events.daily} />}
        </div>
      )}

      {/* ── Popular Items ─────────────────────────────────────────────────── */}
      {(d.popularItems || w.popularItems) && (
        <div className={cn('grid gap-3', d.popularItems && w.popularItems ? 'grid-cols-2' : 'grid-cols-1')}>
          {d.popularItems && <PopularItemsCard period="Daily"  items={popularItems.daily} />}
          {w.popularItems && <PopularItemsCard period="Weekly" items={popularItems.weekly} />}
        </div>
      )}

      {/* ── Cost charts ───────────────────────────────────────────────────── */}
      {(d.foodCost || d.beverageCost) && (
        <div className={cn(
          'grid gap-3',
          d.foodCost && d.beverageCost ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          {d.foodCost && (
            <BarChartCard
              title="Food Cost"
              color="#a78bfa"
              data={chartData}
              valueKey="food"
              total={foodTotal}
              change={2.5}
              positive={false}
            />
          )}
          {d.beverageCost && (
            <BarChartCard
              title="Beverage Cost"
              color="#f472b6"
              data={chartData}
              valueKey="beverage"
              total={beverageTotal}
              change={3.7}
              positive={true}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {!showRevenue && !d.tickets && !w.tickets && !d.popularItems && !w.popularItems && !d.foodCost && !d.beverageCost && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-4xl">📊</span>
          <p className="text-white/40 text-sm">No stats widgets enabled</p>
          <p className="text-white/25 text-xs">Go to Admin → Settings → Stats to enable them</p>
        </div>
      )}
    </div>
  )
}