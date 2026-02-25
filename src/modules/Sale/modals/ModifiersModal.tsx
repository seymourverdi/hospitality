// City Club HMS - Modifiers Modal
// Matches Figma design: Cook Temperature (required), Add-Ons (optional), Custom Note button

'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import type { Product, ModifierGroup, ModifierOption, SelectedModifier } from '../types';

interface ModifierGroupSectionProps {
  group: ModifierGroup;
  selectedOptions: string[];
  onOptionToggle: (option: ModifierOption) => void;
}

function ModifierGroupSection({
  group,
  selectedOptions,
  onOptionToggle,
}: ModifierGroupSectionProps) {
  const isRadio = group.maxSelections === 1;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{group.name}</h3>
        <span
          className={cn(
            'px-2 py-1 rounded text-xs',
            group.required
              ? 'bg-red-500/20 text-red-400'
              : 'bg-white/10 text-white/60'
          )}
        >
          {group.required ? 'Required' : 'Optional'}
        </span>
      </div>

      <div className="space-y-2">
        {group.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => onOptionToggle(option)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                isSelected ? 'bg-[#292929]' : 'bg-[#222] hover:bg-[#292929]'
              )}
            >
              {/* Radio or Checkbox indicator */}
              <span
                className={cn(
                  'w-5 h-5 flex items-center justify-center',
                  isRadio
                    ? 'rounded-full border-2'
                    : 'rounded border',
                  isSelected
                    ? isRadio
                      ? 'border-primary'
                      : 'bg-primary border-primary'
                    : 'border-white/30'
                )}
              >
                {isSelected && isRadio && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
                {isSelected && !isRadio && (
                  <span className="text-black text-xs">✓</span>
                )}
              </span>

              {/* Option name */}
              <span
                className={cn(
                  'text-sm flex-1 text-left',
                  isSelected ? 'text-primary' : 'text-white'
                )}
              >
                {option.name}
              </span>

              {/* Price adjustment */}
              {option.priceAdjustment !== 0 && (
                <span className="text-white/40 text-sm">
                  {option.priceAdjustment > 0 ? '+' : ''}${option.priceAdjustment.toFixed(2)}
                </span>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <span className="text-white/40 text-xs">Selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ModifiersModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onApply: (modifiers: SelectedModifier[]) => void;
  onAddNote?: () => void;
}

export function ModifiersModal({
  isOpen,
  product,
  onClose,
  onApply,
  onAddNote,
}: ModifiersModalProps) {
  const [selectedModifiers, setSelectedModifiers] = React.useState<Map<string, string[]>>(
    new Map()
  );
  const [addOnSearch, setAddOnSearch] = React.useState('');

  // Reset state when product changes
  React.useEffect(() => {
    setSelectedModifiers(new Map());
    setAddOnSearch('');
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const modifierGroups = product.modifierGroups || [];

  // Calculate total price
  const basePrice = product.price;
  let modifierTotal = 0;
  selectedModifiers.forEach((optionIds, groupId) => {
    const group = modifierGroups.find((g) => g.id === groupId);
    if (group) {
      optionIds.forEach((optionId) => {
        const option = group.options.find((o) => o.id === optionId);
        if (option) {
          modifierTotal += option.priceAdjustment;
        }
      });
    }
  });
  const totalPrice = basePrice + modifierTotal;

  // Check if all required modifiers are selected
  const allRequiredSelected = modifierGroups
    .filter((g) => g.required)
    .every((g) => {
      const selected = selectedModifiers.get(g.id);
      return selected && selected.length > 0;
    });

  // Handle option toggle
  const handleOptionToggle = (group: ModifierGroup, option: ModifierOption) => {
    setSelectedModifiers((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(group.id) || [];

      if (group.maxSelections === 1) {
        // Radio behavior - replace selection
        newMap.set(group.id, [option.id]);
      } else {
        // Checkbox behavior - toggle
        if (current.includes(option.id)) {
          newMap.set(group.id, current.filter((id) => id !== option.id));
        } else if (current.length < group.maxSelections) {
          newMap.set(group.id, [...current, option.id]);
        }
      }

      return newMap;
    });
  };

  // Build selected modifiers array
  const buildSelectedModifiers = (): SelectedModifier[] => {
    const result: SelectedModifier[] = [];
    selectedModifiers.forEach((optionIds, groupId) => {
      const group = modifierGroups.find((g) => g.id === groupId);
      if (group) {
        optionIds.forEach((optionId) => {
          const option = group.options.find((o) => o.id === optionId);
          if (option) {
            result.push({
              groupId,
              optionId,
              name: option.name,
              priceAdjustment: option.priceAdjustment,
            });
          }
        });
      }
    });
    return result;
  };

  const handleApply = () => {
    onApply(buildSelectedModifiers());
    onClose();
  };

  // Filter optional add-ons by search
  const getFilteredOptions = (group: ModifierGroup) => {
    if (!addOnSearch.trim() || group.required) {
      return group.options;
    }
    return group.options.filter((opt) =>
      opt.name.toLowerCase().includes(addOnSearch.toLowerCase())
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-sale-panel rounded-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold">{product.name}</h2>
            <p className="text-white/40 text-sm">Customize your order</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modifier Groups - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {modifierGroups.map((group, index) => (
            <React.Fragment key={group.id}>
              {/* Add-ons search (only for optional groups) */}
              {!group.required && modifierGroups.some((g) => !g.required) && index === modifierGroups.findIndex((g) => !g.required) && (
                <div className="px-6 pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search add-ons"
                      value={addOnSearch}
                      onChange={(e) => setAddOnSearch(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#292929] text-white placeholder:text-white/40 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <ModifierGroupSection
                group={{ ...group, options: getFilteredOptions(group) }}
                selectedOptions={selectedModifiers.get(group.id) || []}
                onOptionToggle={(option) => handleOptionToggle(group, option)}
              />

              {index < modifierGroups.length - 1 && (
                <div className="border-t border-white/10" />
              )}
            </React.Fragment>
          ))}

          {/* Empty state if no modifier groups */}
          {modifierGroups.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-white/40 text-sm">No customization options available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          {/* Add Note button */}
          <button
            onClick={onAddNote}
            className="px-4 py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors"
          >
            Add a Custom Note
          </button>

          <div className="flex items-center gap-3">
            {/* Price display */}
            <span className="px-3 py-1.5 rounded-lg border border-dashed border-primary/50 text-primary text-sm">
              ${totalPrice.toFixed(2)}
            </span>

            {/* Cancel button */}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>

            {/* Apply button */}
            <button
              onClick={handleApply}
              disabled={!allRequiredSelected}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                allRequiredSelected
                  ? 'bg-primary text-black hover:bg-primary/90'
                  : 'bg-primary/50 text-black/50 cursor-not-allowed'
              )}
            >
              Apply to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
