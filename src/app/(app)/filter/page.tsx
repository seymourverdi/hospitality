// City Club HMS - Filter Page
// Allergen selection screen matching Figma design exactly

'use client';

import * as React from 'react';
import { X, Plus, Delete } from 'lucide-react';
import { cn } from '@/core/lib/utils';

// Allergen types matching Figma
const allergenTypes = [
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'nuts', name: 'Nuts', icon: '🥜' },
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'soy', name: 'Soy', icon: '🫘' },
  { id: 'egg', name: 'Egg', icon: '🥚' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
  { id: 'sesame', name: 'Sesame', icon: '🌱' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
  { id: 'corn', name: 'Corn', icon: '🌽' },
  { id: 'sulfites', name: 'Sulfites', icon: '⚗️' },
];

// Keyboard layout
const keyboardRows = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', 'Space', '⌫'],
];

// Allergen Tag Button
function AllergenTag({
  allergen,
  selected,
  onToggle,
}: {
  allergen: typeof allergenTypes[0];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        selected
          ? 'bg-primary text-black'
          : 'bg-white/10 text-white/60 hover:bg-white/20'
      )}
    >
      <span>{allergen.icon}</span>
      <span>{allergen.name}</span>
    </button>
  );
}

// Selected Allergen Chip
function SelectedChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-black text-xs font-medium">
      <span>{name}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-black/10 rounded-full p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// Virtual Keyboard Key
function KeyboardKey({
  label,
  onPress,
  isHighlighted,
}: {
  label: string;
  onPress: () => void;
  isHighlighted?: boolean;
}) {
  const isSpecial = label === 'Space' || label === '⌫';

  return (
    <button
      onClick={onPress}
      className={cn(
        'w-10 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
        isHighlighted
          ? 'bg-primary text-black'
          : 'bg-[#333] text-white/60 hover:bg-[#444]',
        isSpecial && 'text-xs'
      )}
    >
      {label === 'Space' ? 'Space' : label === '⌫' ? <Delete className="h-4 w-4" /> : label}
    </button>
  );
}

// Filter Modal Component
function FilterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedAllergens, setSelectedAllergens] = React.useState<string[]>(['dairy']);
  const [customAllergens, setCustomAllergens] = React.useState<string[]>(['Apple']);
  const [inputValue, setInputValue] = React.useState('');

  const toggleAllergen = (id: string) => {
    setSelectedAllergens(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const removeCustomAllergen = (name: string) => {
    setCustomAllergens(prev => prev.filter(a => a !== name));
  };

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (key === 'Space') {
      setInputValue(prev => prev + ' ');
    } else {
      setInputValue(prev => prev + key);
    }
  };

  const addCustomAllergen = () => {
    if (inputValue.trim() && !customAllergens.includes(inputValue.trim())) {
      setCustomAllergens(prev => [...prev, inputValue.trim()]);
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Select Allergens</h2>
          <span className="text-white/40 text-sm">Select allergens added to Product</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Allergen Tags */}
          <div className="flex flex-wrap gap-2">
            {allergenTypes.map((allergen) => (
              <AllergenTag
                key={allergen.id}
                allergen={allergen}
                selected={selectedAllergens.includes(allergen.id)}
                onToggle={() => toggleAllergen(allergen.id)}
              />
            ))}
          </div>

          {/* Custom Allergens */}
          {customAllergens.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customAllergens.map((name) => (
                <SelectedChip
                  key={name}
                  name={name}
                  onRemove={() => removeCustomAllergen(name)}
                />
              ))}
            </div>
          )}

          {/* Add Allergen Input */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#292929]">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/40">🏷️</span>
            </div>
            <input
              type="text"
              value={inputValue}
              readOnly
              placeholder="Add Allergen"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm focus:outline-none"
            />
            <button
              onClick={addCustomAllergen}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>

          {/* Virtual Keyboard */}
          <div className="space-y-2 pt-4">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map((key) => (
                  <KeyboardKey
                    key={key}
                    label={key}
                    onPress={() => handleKeyPress(key)}
                    isHighlighted={key === 'R'}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium">
            <X className="h-4 w-4" />
            Remove
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-medium"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FilterPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(true);

  return (
    <div className="h-screen flex flex-col bg-[#292929]">
      {/* Main Content - Empty background with modal */}
      <div className="flex-1 flex items-center justify-center">
        {!isModalOpen && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-lg bg-primary text-black font-medium"
          >
            Open Allergen Filter
          </button>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
