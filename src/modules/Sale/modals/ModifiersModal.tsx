'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn, formatCurrency } from '@/core/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import type { Product, SelectedModifier } from '../types'

type ModifierOption = {
  id: string
  name: string
  priceAdjustment: number
}

type ModifierGroup = {
  id: string
  name: string
  required: boolean
  minSelections: number
  maxSelections: number | null
  options: ModifierOption[]
}

type ModifierGroupsResponse = {
  ok: boolean
  groups?: ModifierGroup[]
  error?: string
}

interface ModifiersModalProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onApply: (modifiers: SelectedModifier[]) => void
}

export function ModifiersModal({
  isOpen,
  product,
  onClose,
  onApply,
}: ModifiersModalProps) {
  const [groups, setGroups] = React.useState<ModifierGroup[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedModifiers, setSelectedModifiers] = React.useState<Map<string, Set<string>>>(new Map())

  React.useEffect(() => {
    let cancelled = false

    async function loadGroups() {
      if (!product || !isOpen) {
        setGroups([])
        setSelectedModifiers(new Map())
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/sale/menu/items/${product.id}/modifier-groups`, {
          method: 'GET',
        })
        const data = (await res.json()) as ModifierGroupsResponse

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to load modifiers')
        }

        const nextGroups = data.groups ?? []

        if (!cancelled) {
          setGroups(nextGroups)

          const initialSelections = new Map<string, Set<string>>()

          nextGroups.forEach((group) => {
            if (group.required && group.maxSelections === 1 && group.options[0]) {
              initialSelections.set(group.id, new Set([group.options[0].id]))
            }
          })

          setSelectedModifiers(initialSelections)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load modifiers'
          setError(message)
          setGroups([])
          setSelectedModifiers(new Map())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadGroups()

    return () => {
      cancelled = true
    }
  }, [isOpen, product])

  const modifierTotal = React.useMemo(() => {
    let total = 0

    selectedModifiers.forEach((optionIds, groupId) => {
      const group = groups.find((item) => item.id === groupId)
      if (!group) return

      optionIds.forEach((optionId) => {
        const option = group.options.find((item) => item.id === optionId)
        if (option) {
          total += option.priceAdjustment
        }
      })
    })

    return total
  }, [groups, selectedModifiers])

  const isValid = React.useMemo(() => {
    return groups.every((group) => {
      if (!group.required) return true
      const selected = selectedModifiers.get(group.id)
      return !!selected && selected.size >= Math.max(group.minSelections || 1, 1)
    })
  }, [groups, selectedModifiers])

  const handleSingleSelect = (groupId: string, optionId: string) => {
    const next = new Map(selectedModifiers)
    next.set(groupId, new Set([optionId]))
    setSelectedModifiers(next)
  }

  const handleMultiSelect = (group: ModifierGroup, optionId: string, checked: boolean) => {
    const next = new Map(selectedModifiers)
    const current = new Set(next.get(group.id) ?? [])

    if (checked) {
      if (group.maxSelections && current.size >= group.maxSelections) {
        return
      }
      current.add(optionId)
    } else {
      current.delete(optionId)
    }

    next.set(group.id, current)
    setSelectedModifiers(next)
  }

  const handleApply = () => {
    const result: SelectedModifier[] = []

    selectedModifiers.forEach((optionIds, groupId) => {
      const group = groups.find((item) => item.id === groupId)
      if (!group) return

      optionIds.forEach((optionId) => {
        const option = group.options.find((item) => item.id === optionId)
        if (!option) return

        result.push({
          groupId,
          optionId,
          name: option.name,
          priceAdjustment: option.priceAdjustment,
        })
      })
    })

    onApply(result)
  }

  if (!product) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-h2">{product.name}</DialogTitle>

          {product.description ? (
            <DialogDescription className="text-muted-foreground">
              {product.description}
            </DialogDescription>
          ) : null}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-h3 font-semibold text-primary">
              {formatCurrency(Number(product.price))}
            </span>

            {modifierTotal > 0 && (
              <span className="text-sm text-muted-foreground">
                +{formatCurrency(modifierTotal)}
              </span>
            )}
          </div>

          {product.allergens && product.allergens.length > 0 ? (
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div className="flex gap-1 flex-wrap">
                {product.allergens.map((allergen) => (
                  <Badge key={allergen} variant="allergen">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading modifiers...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500">
              {error}
            </div>
          ) : groups.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No modifiers for this product
            </div>
          ) : (
            groups.map((group) => {
              const selected = selectedModifiers.get(group.id) ?? new Set()
              const isSingleSelect = group.maxSelections === 1

              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{group.name}</h3>
                    {group.required ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Optional
                      </Badge>
                    )}
                  </div>

                  {isSingleSelect ? (
                    <RadioGroup
                      value={Array.from(selected)[0] ?? ''}
                      onValueChange={(value) => handleSingleSelect(group.id, value)}
                    >
                      <div className="space-y-2">
                        {group.options.map((option) => (
                          <label
                            key={option.id}
                            className={cn(
                              'flex items-center justify-between rounded-lg border p-3 cursor-pointer',
                              'hover:bg-accent transition-colors'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={option.id} />
                              <span className="text-sm">{option.name}</span>
                            </div>

                            <span className="text-sm text-muted-foreground">
                              {option.priceAdjustment > 0
                                ? `+${formatCurrency(option.priceAdjustment)}`
                                : formatCurrency(0)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {group.options.map((option) => {
                        const checked = selected.has(option.id)

                        return (
                          <label
                            key={option.id}
                            className={cn(
                              'flex items-center justify-between rounded-lg border p-3 cursor-pointer',
                              'hover:bg-accent transition-colors'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                  handleMultiSelect(group, option.id, Boolean(value))
                                }
                              />
                              <span className="text-sm">{option.name}</span>
                            </div>

                            <span className="text-sm text-muted-foreground">
                              {option.priceAdjustment > 0
                                ? `+${formatCurrency(option.priceAdjustment)}`
                                : formatCurrency(0)}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  <Separator />
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Total add-ons: {formatCurrency(modifierTotal)}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleApply} disabled={!isValid || loading}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}