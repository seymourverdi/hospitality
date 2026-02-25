// City Club HMS - Custom Note Modal
// Matches Figma design: Text area with virtual keyboard, character counter

'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { AlphabetKeyboard } from '../components/AlphabetKeyboard';

const MAX_CHARACTERS = 500;

interface CustomNoteModalProps {
  isOpen: boolean;
  initialNote?: string;
  onClose: () => void;
  onSave: (note: string) => void;
}

export function CustomNoteModal({
  isOpen,
  initialNote = '',
  onClose,
  onSave,
}: CustomNoteModalProps) {
  const [note, setNote] = React.useState(initialNote);

  // Reset note when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
    }
  }, [isOpen, initialNote]);

  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setNote((prev) => prev.slice(0, -1));
    } else if (note.length < MAX_CHARACTERS) {
      setNote((prev) => prev + key);
    }
  };

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-sale-panel rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h3 className="text-white font-semibold">Add Custom Note</h3>
            <span className="text-white/40 text-sm">
              Members can see these custom notes on their Invoices
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Text Area */}
        <div className="px-6">
          <div className="bg-[#292929] rounded-xl p-4 min-h-[160px] max-h-[200px] overflow-y-auto">
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
              {note || (
                <span className="text-white/30">
                  Type your note here...
                </span>
              )}
            </p>
          </div>

          {/* Character counter */}
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => setNote('')}
              className="text-white/40 hover:text-white text-xs"
            >
              Clear
            </button>
            <span
              className={cn(
                'text-xs',
                note.length >= MAX_CHARACTERS
                  ? 'text-red-400'
                  : 'text-white/40'
              )}
            >
              {note.length}/{MAX_CHARACTERS} characters
            </span>
          </div>
        </div>

        {/* Virtual Keyboard */}
        <div className="p-6">
          <AlphabetKeyboard onKeyPress={handleKeyPress} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
