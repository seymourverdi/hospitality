import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ─── Get first active location ID ────────────────────────────────────────────

async function getLocationId(): Promise<number | null> {
  const loc = await prisma.restaurantLocation.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { id: 'asc' },
  })
  return loc?.id ?? null
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r
}
function endOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r
}
function startOfWeek(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0)
  const day = r.getDay()
  const diff = day === 0 ? -6 : 1 - day
  r.setDate(r.getDate() + diff); return r
}
function startOfMonth(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); r.setDate(1); return r
}
function startOfQuarter(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0)
  r.setMonth(Math.floor(r.getMonth() / 3) * 3, 1); return r
}

// ─── Revenue for a period (via Orders, avoiding nested aggregate filter) ──────

async function getRevenuePeriod(locationId: number, from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: {
      locationId,
      status: 'PAID',
      closedAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      totalAmount: true,
    },
  })

  const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  return { revenue, tickets: orders.length, orderIds: orders.map(o => o.id) }
}

// ─── Popular items ─────────────────────────────────────────────────────────────

async function getPopularItems(orderIds: number[], limit = 6) {
  if (orderIds.length === 0) return []

  const grouped = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: {
      orderId: { in: orderIds },
      status: 'ACTIVE',
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  })

  if (grouped.length === 0) return []

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: grouped.map(g => g.menuItemId) } },
    select: { id: true, name: true },
  })
  const nameMap = new Map(menuItems.map(m => [m.id, m.name]))

  return grouped.map(g => ({
    menuItemId: g.menuItemId,
    name: nameMap.get(g.menuItemId) ?? 'Unknown',
    count: Number(g._sum.quantity ?? 0),
  }))
}

// ─── Events (reservations) count ──────────────────────────────────────────────

async function getEventsCount(locationId: number, from: Date, to: Date) {
  return prisma.reservation.count({
    where: {
      locationId,
      reservationTime: { gte: from, lte: to },
    },
  })
}

// ─── Chart data: food vs beverage by day ──────────────────────────────────────

async function getChartData(orderIds: number[], from: Date, to: Date) {
  if (orderIds.length === 0) {
    // Fill empty chart for the range
    const result: { date: string; food: number; beverage: number }[] = []
    const cursor = new Date(from)
    while (cursor <= to) {
      result.push({ date: cursor.toISOString().substring(0, 10), food: 0, beverage: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }

  const items = await prisma.orderItem.findMany({
    where: {
      orderId: { in: orderIds },
      status: 'ACTIVE',
    },
    select: {
      finalPrice: true,
      menuItem: { select: { isAlcohol: true } },
      order: { select: { closedAt: true } },
    },
  })

  const byDay: Record<string, { food: number; beverage: number }> = {}
  for (const item of items) {
    const day = (item.order.closedAt ?? new Date()).toISOString().substring(0, 10)
    if (!byDay[day]) byDay[day] = { food: 0, beverage: 0 }
    if (item.menuItem.isAlcohol) byDay[day].beverage += Number(item.finalPrice)
    else byDay[day].food += Number(item.finalPrice)
  }

  const result: { date: string; food: number; beverage: number }[] = []
  const cursor = new Date(from)
  while (cursor <= to) {
    const key = cursor.toISOString().substring(0, 10)
    result.push({ date: key, food: byDay[key]?.food ?? 0, beverage: byDay[key]?.beverage ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

// ─── % change helper ──────────────────────────────────────────────────────────

function pct(curr: number, prev: number) {
  if (prev === 0) return { change: curr > 0 ? 100 : 0, positive: curr >= prev }
  const diff = Math.round(((curr - prev) / prev) * 1000) / 10
  return { change: Math.abs(diff), positive: curr >= prev }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const locationId = await getLocationId()
    if (!locationId) {
      return NextResponse.json({ ok: false, error: 'No location found in database' }, { status: 404 })
    }

    const now = new Date()

    // Current period boundaries
    const dayStart      = startOfDay(now)
    const dayEnd        = endOfDay(now)
    const weekStart     = startOfWeek(now)
    const monthStart    = startOfMonth(now)
    const quarterStart  = startOfQuarter(now)

    // Previous period boundaries
    const prevDayStart = new Date(dayStart);    prevDayStart.setDate(prevDayStart.getDate() - 1)
    const prevDayEnd   = endOfDay(prevDayStart)

    const prevWeekStart = new Date(weekStart);  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    const prevWeekEnd   = new Date(dayEnd);     prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)

    const prevMonthStart = new Date(monthStart); prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
    const prevMonthEnd   = new Date(dayEnd);     prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1)

    const prevQStart = new Date(quarterStart);   prevQStart.setMonth(prevQStart.getMonth() - 3)
    const prevQEnd   = new Date(dayEnd);         prevQEnd.setMonth(prevQEnd.getMonth() - 3)

    // Fetch all periods in parallel
    const [daily, weekly, monthly, quarterly, prevDaily, prevWeekly, prevMonthly, prevQuarterly] =
      await Promise.all([
        getRevenuePeriod(locationId, dayStart,     dayEnd),
        getRevenuePeriod(locationId, weekStart,    dayEnd),
        getRevenuePeriod(locationId, monthStart,   dayEnd),
        getRevenuePeriod(locationId, quarterStart, dayEnd),
        getRevenuePeriod(locationId, prevDayStart,   prevDayEnd),
        getRevenuePeriod(locationId, prevWeekStart,  prevWeekEnd),
        getRevenuePeriod(locationId, prevMonthStart, prevMonthEnd),
        getRevenuePeriod(locationId, prevQStart,     prevQEnd),
      ])

    const [popularDaily, popularWeekly, eventsDaily, chartData] = await Promise.all([
      getPopularItems(daily.orderIds),
      getPopularItems(weekly.orderIds),
      getEventsCount(locationId, dayStart, dayEnd),
      getChartData(monthly.orderIds, monthStart, dayEnd),
    ])

    const aovDaily  = daily.tickets  > 0 ? daily.revenue  / daily.tickets  : 0
    const aovPrevD  = prevDaily.tickets > 0 ? prevDaily.revenue / prevDaily.tickets : 0

    return NextResponse.json({
      ok: true,
      locationId,
      stats: {
        revenue: {
          daily:     { amount: daily.revenue,     ...pct(daily.revenue,     prevDaily.revenue) },
          weekly:    { amount: weekly.revenue,    ...pct(weekly.revenue,    prevWeekly.revenue) },
          monthly:   { amount: monthly.revenue,   ...pct(monthly.revenue,   prevMonthly.revenue) },
          quarterly: { amount: quarterly.revenue, ...pct(quarterly.revenue, prevQuarterly.revenue) },
        },
        tickets: {
          daily:  { count: daily.tickets,  ...pct(daily.tickets,  prevDaily.tickets) },
          weekly: { count: weekly.tickets, ...pct(weekly.tickets, prevWeekly.tickets) },
        },
        aov: {
          daily: { amount: Math.round(aovDaily * 100) / 100, ...pct(aovDaily, aovPrevD) },
        },
        events: {
          daily: { count: eventsDaily, positive: true },
        },
        popularItems: {
          daily:  popularDaily,
          weekly: popularWeekly,
        },
        chartData,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/stats failed:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to load stats' },
      { status: 500 }
    )
  }
}