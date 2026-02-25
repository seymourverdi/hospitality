// City Club HMS - Alphabet Keyboard Component
// Virtual keyboard for touch-first member search

'use client';

import * as React from 'react';
import { Delete } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { KEYBOARD_ROWS } from '../constants';

interface KeyboardKeyProps {
  label: string;
  onPress: () => void;
  isHighlighted?: boolean;
  className?: string;
}

function KeyboardKey({
  label,
  onPress,
  isHighlighted,
  className,
}: KeyboardKeyProps) {
  const displayWidth = label === 'Space' ? 'w-20' : 'w-10';

  return (
    <button
      onClick={onPress}
      className={cn(
        'h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
        'active:scale-95',
        'min-h-[40px]', // Touch target
        displayWidth,
        isHighlighted
          ? 'bg-primary text-black'
          : 'bg-sale-card text-white/60 hover:bg-[#444] active:bg-[#555]',
        className
      )}
    >
      {label === '⌫' ? (
        <Delete className="h-4 w-4" />
      ) : label === 'Space' ? (
        'Space'
      ) : (
        label
      )}
    </button>
  );
}

interface AlphabetKeyboardProps {
  onKeyPress: (key: string) => void;
  highlightedKey?: string;
  className?: string;
}

export function AlphabetKeyboard({
  onKeyPress,
  highlightedKey,
  className,
}: AlphabetKeyboardProps) {
  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      onKeyPress('BACKSPACE');
    } else if (key === 'Space') {
      onKeyPress(' ');
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {row.map((key) => (
            <KeyboardKey
              key={key}
              label={key}
              onPress={() => handleKeyPress(key)}
              isHighlighted={highlightedKey?.toUpperCase() === key.toUpperCase()}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
