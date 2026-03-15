'use client'

import * as React from 'react'
import { cn } from '@/core/lib/utils'
import { CategoryGrid } from '../components/CategoryTile'
import { ProductGrid } from '../components/ProductCard'
import { CATEGORIES } from '../constants'
import { useSale } from '../context/SaleContext'
import type { Product } from '../types'

interface SelectItemsScreenProps {
  className?: string
}

type ProductsResponse = {
  ok: boolean
  products?: Product[]
  error?: string
}

export function SelectItemsScreen({ className }: SelectItemsScreenProps) {
  const {
    state,
    setActiveCategory,
    addItem,
    showModifierModal,
  } = useSale()

  const { activeCategory, searchQuery } = state

  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError(null)

      try {
        const qs = new URLSearchParams()

        if (activeCategory && activeCategory !== 'all') {
          qs.set('category', activeCategory)
        }

        if (searchQuery.trim()) {
          qs.set('search', searchQuery.trim())
        }

        const url = `/api/sale/products${qs.toString() ? `?${qs.toString()}` : ''}`
        const res = await fetch(url, { method: 'GET' })
        const data = (await res.json()) as ProductsResponse

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to load products')
        }

        if (!cancelled) {
          setProducts(data.products ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load products'
          setError(message)
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [activeCategory, searchQuery])

  const handleAddProduct = (product: Product) => {
    if (product.hasRequiredModifiers || (product.modifierGroups && product.modifierGroups.length > 0)) {
      showModifierModal(product)
    } else {
      addItem(product)
    }
  }

  const handleProductClick = (product: Product) => {
    if (product.hasRequiredModifiers || (product.modifierGroups && product.modifierGroups.length > 0)) {
      showModifierModal(product)
    }
  }

  return (
    <div className={cn('flex-1 flex flex-col overflow-hidden bg-[#292929]', className)}>
      <div className="px-[15px] pt-[10px]">
        <CategoryGrid
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      <div className="mx-[15px] my-[15px] h-px bg-white/10" />

      <div className="flex-1 overflow-y-auto px-[15px] pb-[15px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-white/40 text-sm">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : products.length > 0 ? (
          <ProductGrid
            products={products}
            onAddProduct={handleAddProduct}
            onProductClick={handleProductClick}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-white/40 text-sm">No products found</p>
            <p className="text-white/30 text-xs mt-1">
              {searchQuery ? 'Try a different search term' : 'No items in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}