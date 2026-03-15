import { NextResponse } from 'next/server'

type SaleSubmitItem = {
  productId: string
  qty: number
  note?: string
  modifiers?: Array<{
    groupId: string
    optionId: string
    name: string
    priceAdjustment: number
  }>
}

type SaleSubmitBody = {
  tableId?: string
  seatNumbers?: number[]
  memberId?: string
  isNonMember?: boolean
  discountTier?: number | null
  scheduledTime?: string | null
  notes?: string
  items?: SaleSubmitItem[]
}

type OpenOrderResponse = {
  ok: boolean
  order?: {
    id: number
    tableId: number
    status: string
    orderType: string
  }
  error?: string
}

type AddItemResponse = {
  ok: boolean
  orderId?: number
  error?: string
}

function toPositiveInt(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) {
    return null
  }
  return n
}

function isAuthorized(request: Request): boolean {
  const expectedKey = process.env.SALE_API_KEY
  if (!expectedKey) {
    return true
  }

  const authHeader = request.headers.get('authorization') ?? ''
  const bearer = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''

  const headerKey = request.headers.get('x-sale-api-key')?.trim() ?? ''

  return bearer === expectedKey || headerKey === expectedKey
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const body = (await request.json()) as SaleSubmitBody

    const tableId = toPositiveInt(body.tableId)
    if (!tableId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'tableId is required',
        },
        { status: 400 }
      )
    }

    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'At least one item is required',
        },
        { status: 400 }
      )
    }

    const origin = new URL(request.url).origin

    const openOrderRes = await fetch(
      `${origin}/api/pos/tables/${tableId}/open-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderType: 'DINE_IN',
        }),
        cache: 'no-store',
      }
    )

    const openOrderData = (await openOrderRes.json()) as OpenOrderResponse

    if (!openOrderRes.ok || !openOrderData.ok || !openOrderData.order) {
      return NextResponse.json(
        {
          ok: false,
          error: openOrderData.error || 'Failed to open order',
        },
        { status: openOrderRes.status || 500 }
      )
    }

    const orderId = openOrderData.order.id
    const seatNumber =
      Array.isArray(body.seatNumbers) && body.seatNumbers.length > 0
        ? Number(body.seatNumbers[0])
        : null

    for (const item of items) {
      const menuItemId = toPositiveInt(item.productId)

      if (!menuItemId) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid productId: ${item.productId}`,
          },
          { status: 400 }
        )
      }

      const modifierOptionIds = Array.isArray(item.modifiers)
        ? item.modifiers
            .map((modifier) => toPositiveInt(modifier.optionId))
            .filter((value): value is number => value !== null)
        : []

      const addItemRes = await fetch(
        `${origin}/api/pos/orders/${orderId}/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            menuItemId,
            quantity: item.qty,
            seatNumber,
            comment: item.note ?? null,
            modifierOptionIds,
          }),
          cache: 'no-store',
        }
      )

      const addItemData = (await addItemRes.json()) as AddItemResponse

      if (!addItemRes.ok || !addItemData.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: addItemData.error || 'Failed to add order item',
          },
          { status: addItemRes.status || 500 }
        )
      }
    }

    return NextResponse.json({
      ok: true,
      orderId,
      tableId,
      submittedItemCount: items.length,
    })
  } catch (error) {
    console.error('POST /api/sale/submit-order failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to submit sale order',
      },
      { status: 500 }
    )
  }
}