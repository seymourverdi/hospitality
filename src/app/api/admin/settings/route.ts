import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getLocationId(): Promise<number | null> {
  const loc = await prisma.restaurantLocation.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { id: 'asc' },
  })
  return loc?.id ?? null
}

const defaultStatsConfig = {
  daily: { revenue: true, tickets: true, avgOrderValue: true, events: false, popularItems: true, laborCost: true, foodCost: true, beverageCost: true },
  weekly: { revenue: true, tickets: true, avgOrderValue: true, events: false, popularItems: true, laborCost: true, foodCost: true, beverageCost: true },
}

const defaultSaleConfig = {
  showAllModifiersByDefault: true, showSkipSeating: true, showNonMember: true,
  noticeEnabled: true, noticeMessage: '',
  memberDiscounts: [{ value: 10, color: 'green' }, { value: 15, color: 'green' }, { value: 20, color: 'purple' }, { value: 25, color: 'red' }],
  nonMemberDiscounts: [{ value: 10, color: 'green' }, { value: 15, color: 'green' }, { value: 20, color: 'purple' }, { value: 25, color: 'red' }],
  nonMemberPriceIncrease: true, nonMemberPriceIncreasePercent: 10,
  autoGroupOrders: true, autoGroupMinutes: 3,
}

const defaultRsvpConfig = { allowGuestOverride: true, showTablesOption: true, allowAllDayMenu: true, allowSocialLunch: true, allowMixed: true }
const defaultDisplayConfig = {}
const defaultTablesConfig = {}
const defaultFilterConfig = {}
const defaultLogConfig = {}

export async function GET() {
  try {
    const locationId = await getLocationId()
    if (!locationId) {
      return NextResponse.json({
        ok: true,
        settings: { statsConfig: defaultStatsConfig, saleConfig: defaultSaleConfig, rsvpConfig: defaultRsvpConfig },
      })
    }

    const settings = await prisma.locationSettings.findUnique({
      where: { locationId },
    })

    if (!settings) {
      return NextResponse.json({
        ok: true,
        settings: { statsConfig: defaultStatsConfig, saleConfig: defaultSaleConfig, rsvpConfig: defaultRsvpConfig },
      })
    }

    return NextResponse.json({
      ok: true,
      settings: {
        statsConfig: settings.statsConfig,
        saleConfig: settings.saleConfig,
        rsvpConfig: settings.rsvpConfig,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/settings failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const locationId = await getLocationId()
    if (!locationId) {
      return NextResponse.json({ ok: false, error: 'No active location found' }, { status: 404 })
    }

    const body = await request.json() as {
      statsConfig?: unknown
      saleConfig?: unknown
      rsvpConfig?: unknown
    }

    await prisma.locationSettings.upsert({
      where: { locationId },
      create: {
        locationId,
        statsConfig: (body.statsConfig ?? defaultStatsConfig) as object,
        saleConfig: (body.saleConfig ?? defaultSaleConfig) as object,
        rsvpConfig: (body.rsvpConfig ?? defaultRsvpConfig) as object,
        displayConfig: defaultDisplayConfig,
        tablesConfig: defaultTablesConfig,
        filterConfig: defaultFilterConfig,
        logConfig: defaultLogConfig,
      },
      update: {
        ...(body.statsConfig !== undefined && { statsConfig: body.statsConfig as object }),
        ...(body.saleConfig !== undefined && { saleConfig: body.saleConfig as object }),
        ...(body.rsvpConfig !== undefined && { rsvpConfig: body.rsvpConfig as object }),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PUT /api/admin/settings failed', error)
    return NextResponse.json({ ok: false, error: 'Failed to save settings' }, { status: 500 })
  }
}