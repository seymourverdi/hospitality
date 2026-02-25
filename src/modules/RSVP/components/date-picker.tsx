// City Club HMS - Date Picker for RSVP
// Horizontal scrollable date selector

'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function DatePicker({
  selectedDate,
  onDateChange,
  className,
}: DatePickerProps) {
  // Generate dates for next 14 days
  const dates = React.useMemo(() => {
    const result: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(newDate);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Month header */}
      <div className="flex items-center justify-between px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek('prev')}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">
          {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek('next')}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Date buttons */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {dates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => onDateChange(date)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[60px] py-3 px-2 rounded-xl',
                'transition-all touch-target',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected(date)
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : isToday(date)
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-background-secondary text-foreground hover:bg-background-tertiary'
              )}
            >
              <span className="text-xs font-medium uppercase">
                {formatDayName(date)}
              </span>
              <span className="text-lg font-bold">{formatDayNumber(date)}</span>
              {isToday(date) && (
                <span className="text-[10px] uppercase">Today</span>
              )}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
