import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

function categoryNameToUiId(name: string | null | undefined) {
  const s = String(name ?? '').trim().toLowerCase()

  if (!s) return 'all'
  if (s.includes('snack')) return 'snacks'
  if (s.includes('starter') || s.includes('appet')) return 'starters'
  if (s.includes('salad')) return 'salads'
  if (s.includes('main') || s.includes('entree') || s.includes('burger') || s.includes('pizza')) return 'mains'
  if (s.includes('bever') || s.includes('drink')) return 'beverage'
  if (s.includes('coffee')) return 'coffee'
  if (s.includes('pastr') || s.includes('bak')) return 'pastries'
  if (s.includes('dessert') || s.includes('sweet')) return 'dessert'
  if (s.includes('side')) return 'sides'

  return 'all'
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.trim() ?? ''
    const category = url.searchParams.get('category')?.trim() ?? 'all'

    const rows = await prisma.menuItem.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        modifierGroups: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { categoryId: 'asc' },
        { name: 'asc' },
      ],
    })

    const products = rows
      .map((row) => {
        const uiCategoryId = categoryNameToUiId(row.category?.name)

        return {
          id: String(row.id),
          name: row.name,
          description: row.description ?? '',
          price: Number(row.basePrice),
          available: '∞' as const,
          allergens: [] as string[],
          categoryId: uiCategoryId,
          soldOut: !row.isActive,
          hasRequiredModifiers: row.modifierGroups.length > 0,
          modifierGroups: [],
        }
      })
      .filter((row) => category === 'all' || row.categoryId === category)

    return NextResponse.json({
      ok: true,
      products,
    })
  } catch (error) {
    console.error('GET /api/sale/products failed', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load sale products',
      },
      { status: 500 },
    )
  }
}