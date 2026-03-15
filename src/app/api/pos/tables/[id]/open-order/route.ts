import { NextResponse } from 'next/server'
import {
  openOrderForTable,
  OpenOrderError,
} from '@/modules/pos/server/orders/open-order-for-table'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(_: Request, context: RouteContext) {
  try {
    const params = await context.params
    const result = await openOrderForTable(params.id)

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (error) {
    if (error instanceof OpenOrderError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: error.statusCode },
      )
    }

    console.error('Open order failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    )
  }
}