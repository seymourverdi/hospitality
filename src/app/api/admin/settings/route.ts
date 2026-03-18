import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Default locationId = 1 (single-location setup). In multi-location you'd pass locationId in query/body.
const LOCATION_ID = 1

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
    const settings = await prisma.locationSettings.findUnique({
      where: { locationId: LOCATION_ID },
    })

    if (!settings) {
      return NextResponse.json({
        ok: true,
        settings: {
          statsConfig: defaultStatsConfig,
          saleConfig: defaultSaleConfig,
          rsvpConfig: defaultRsvpConfig,
        },
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
    const body = await request.json() as {
      statsConfig?: unknown
      saleConfig?: unknown
      rsvpConfig?: unknown
    }

    await prisma.locationSettings.upsert({
      where: { locationId: LOCATION_ID },
      create: {
        locationId: LOCATION_ID,
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
