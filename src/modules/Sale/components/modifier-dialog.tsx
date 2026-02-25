// City Club HMS - Modifier Dialog
// Full-screen dialog for selecting product modifiers

'use client';

import * as React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { cn, formatCurrency } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Product, Modifier, ModifierOption } from '@/core/database.types';
import type { SelectedModifier } from '../types';

// Mock modifiers - will be replaced with Supabase query
const mockModifiers: (Modifier & { options: ModifierOption[] })[] = [
  {
    id: 'temp',
    name: 'Cook Temperature',
    description: 'How would you like it cooked?',
    requirement: 'required',
    min_selections: 1,
    max_selections: 1,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'rare', modifier_id: 'temp', name: 'Rare', price_adjustment: 0, is_default: false, sort_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'med-rare', modifier_id: 'temp', name: 'Medium Rare', price_adjustment: 0, is_default: true, sort_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'medium', modifier_id: 'temp', name: 'Medium', price_adjustment: 0, is_default: false, sort_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'med-well', modifier_id: 'temp', name: 'Medium Well', price_adjustment: 0, is_default: false, sort_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'well', modifier_id: 'temp', name: 'Well Done', price_adjustment: 0, is_default: false, sort_order: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
  },
  {
    id: 'sides',
    name: 'Side Selection',
    description: 'Choose your side',
    requirement: 'required',
    min_selections: 1,
    max_selections: 1,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'fries', modifier_id: 'sides', name: 'French Fries', price_adjustment: 0, is_default: true, sort_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'salad', modifier_id: 'sides', name: 'House Salad', price_adjustment: 0, is_default: false, sort_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'truffle-fries', modifier_id: 'sides', name: 'Truffle Fries', price_adjustment: 5, is_default: false, sort_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'asparagus', modifier_id: 'sides', name: 'Grilled Asparagus', price_adjustment: 4, is_default: false, sort_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
  },
  {
    id: 'addons',
    name: 'Add-ons',
    description: 'Enhance your meal',
    requirement: 'optional',
    min_selections: 0,
    max_selections: null,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'bacon', modifier_id: 'addons', name: 'Bacon', price_adjustment: 3, is_default: false, sort_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'egg', modifier_id: 'addons', name: 'Fried Egg', price_adjustment: 2, is_default: false, sort_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'mushrooms', modifier_id: 'addons', name: 'Sautéed Mushrooms', price_adjustment: 4, is_default: false, sort_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'onions', modifier_id: 'addons', name: 'Caramelized Onions', price_adjustment: 2, is_default: false, sort_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
  },
];

// Map of product IDs to their modifier IDs
const productModifierMap: Record<string, string[]> = {
  '4': ['temp', 'sides', 'addons'], // Wagyu Steak
  '5': ['sides'], // Grilled Salmon
};

interface ModifierDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (modifiers: SelectedModifier[], notes: string) => void;
  initialModifiers?: SelectedModifier[];
  initialNotes?: string;
}

export function ModifierDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
  initialModifiers = [],
  initialNotes = '',
}: ModifierDialogProps) {
  const [selectedModifiers, setSelectedModifiers] = React.useState<Map<string, Set<string>>>(
    new Map()
  );
  const [notes, setNotes] = React.useState(initialNotes);

  // Get modifiers for this product
  const productModifiers = React.useMemo(() => {
    if (!product) return [];
    const modifierIds = productModifierMap[product.id] || [];
    return mockModifiers.filter((m) => modifierIds.includes(m.id));
  }, [product]);

  // Initialize selections from initial modifiers
  React.useEffect(() => {
    if (open) {
      const newSelections = new Map<string, Set<string>>();
      initialModifiers.forEach((mod) => {
        if (!newSelections.has(mod.groupId)) {
          newSelections.set(mod.groupId, new Set());
        }
        newSelections.get(mod.groupId)?.add(mod.optionId);
      });
      // Set defaults for required modifiers
      productModifiers.forEach((modifier) => {
        if (!newSelections.has(modifier.id)) {
          const defaultOption = modifier.options.find((o) => o.is_default);
          if (defaultOption) {
            newSelections.set(modifier.id, new Set([defaultOption.id]));
          }
        }
      });
      setSelectedModifiers(newSelections);
      setNotes(initialNotes);
    }
  }, [open, initialModifiers, initialNotes, productModifiers]);

  // Calculate modifier total
  const modifierTotal = React.useMemo(() => {
    let total = 0;
    selectedModifiers.forEach((optionIds, modifierId) => {
      const modifier = productModifiers.find((m) => m.id === modifierId);
      if (modifier) {
        optionIds.forEach((optionId) => {
          const option = modifier.options.find((o) => o.id === optionId);
          if (option) {
            total += Number(option.price_adjustment);
          }
        });
      }
    });
    return total;
  }, [selectedModifiers, productModifiers]);

  // Check if required modifiers are satisfied
  const isValid = React.useMemo(() => {
    return productModifiers.every((modifier) => {
      if (modifier.requirement === 'required') {
        const selected = selectedModifiers.get(modifier.id);
        return selected && selected.size >= (modifier.min_selections || 1);
      }
      return true;
    });
  }, [productModifiers, selectedModifiers]);

  const handleSingleSelect = (modifierId: string, optionId: string) => {
    const newSelections = new Map(selectedModifiers);
    newSelections.set(modifierId, new Set([optionId]));
    setSelectedModifiers(newSelections);
  };

  const handleMultiSelect = (modifierId: string, optionId: string, checked: boolean) => {
    const newSelections = new Map(selectedModifiers);
    const current = newSelections.get(modifierId) || new Set();

    if (checked) {
      current.add(optionId);
    } else {
      current.delete(optionId);
    }

    newSelections.set(modifierId, current);
    setSelectedModifiers(newSelections);
  };

  const handleConfirm = () => {
    const modifiers: SelectedModifier[] = [];
    selectedModifiers.forEach((optionIds, modifierId) => {
      const modifier = productModifiers.find((m) => m.id === modifierId);
      if (modifier) {
        optionIds.forEach((optionId) => {
          const option = modifier.options.find((o) => o.id === optionId);
          if (option) {
            modifiers.push({
              groupId: modifier.id,
              optionId: option.id,
              name: option.name,
              priceAdjustment: Number(option.price_adjustment),
            });
          }
        });
      }
    });
    onConfirm(modifiers, notes);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-h2">{product.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {product.description}
          </DialogDescription>
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
          {/* Allergens */}
          {product.allergens && product.allergens.length > 0 && (
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
          )}
        </DialogHeader>

        {/* Modifiers */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {productModifiers.map((modifier) => {
            const isRequired = modifier.requirement === 'required';
            const isSingleSelect = modifier.max_selections === 1;
            const selected = selectedModifiers.get(modifier.id) || new Set();

            return (
              <div key={modifier.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{modifier.name}</h3>
                  {isRequired ? (
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
                    value={Array.from(selected)[0] || ''}
                    onValueChange={(value) => handleSingleSelect(modifier.id, value)}
                    className="space-y-2"
                  >
                    {modifier.options.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 transition-colors cursor-pointer',
                          selected.has(option.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background-secondary hover:border-muted-foreground'
                        )}
                        onClick={() => handleSingleSelect(modifier.id, option.id)}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <label
                          htmlFor={option.id}
                          className="flex-1 text-sm font-medium cursor-pointer"
                        >
                          {option.name}
                        </label>
                        {Number(option.price_adjustment) > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatCurrency(Number(option.price_adjustment))}
                          </span>
                        )}
                        {selected.has(option.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {modifier.options.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 transition-colors cursor-pointer',
                          selected.has(option.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background-secondary hover:border-muted-foreground'
                        )}
                        onClick={() =>
                          handleMultiSelect(modifier.id, option.id, !selected.has(option.id))
                        }
                      >
                        <Checkbox
                          checked={selected.has(option.id)}
                          onCheckedChange={(checked) =>
                            handleMultiSelect(modifier.id, option.id, checked === true)
                          }
                        />
                        <label className="flex-1 text-sm font-medium cursor-pointer">
                          {option.name}
                        </label>
                        {Number(option.price_adjustment) > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{formatCurrency(Number(option.price_adjustment))}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Special instructions */}
          <div className="space-y-2">
            <Separator />
            <h3 className="text-sm font-semibold">Special Instructions</h3>
            <Input
              placeholder="Add notes for the kitchen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="flex-1"
          >
            Add to Order
            {modifierTotal > 0 && (
              <span className="ml-2">+{formatCurrency(modifierTotal)}</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
