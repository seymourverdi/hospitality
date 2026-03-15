import { NextResponse } from 'next/server'
import { openOrderForTable } from '@/modules/pos/server/orders/open-order-for-table'

type RouteContext = {
  params: {
    id: string
  }
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const result = await openOrderForTable(params.id)

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
        },
        { status: result.status }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        orderId: result.orderId,
        reused: result.reused,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to open order',
      },
      { status: 500 }
    )
  }
}