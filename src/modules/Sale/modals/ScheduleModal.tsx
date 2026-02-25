// City Club HMS - Schedule Modal
// Time picker for scheduling orders

'use client';

import * as React from 'react';
import { Clock, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/core/lib/utils';

interface ScheduleModalProps {
  isOpen: boolean;
  initialTime?: Date | null;
  onClose: () => void;
  onSchedule: (time: Date | null) => void;
}

export function ScheduleModal({
  isOpen,
  initialTime,
  onClose,
  onSchedule,
}: ScheduleModalProps) {
  // Parse initial time or use current time + 30 min
  const getDefaultTime = () => {
    if (initialTime) {
      return {
        hour: initialTime.getHours() % 12 || 12,
        minute: Math.floor(initialTime.getMinutes() / 15) * 15,
        period: initialTime.getHours() >= 12 ? 'PM' : 'AM',
      };
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return {
      hour: now.getHours() % 12 || 12,
      minute: Math.floor(now.getMinutes() / 15) * 15,
      period: now.getHours() >= 12 ? 'PM' : 'AM',
    };
  };

  const [selectedTime, setSelectedTime] = React.useState(getDefaultTime);

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTime(getDefaultTime());
    }
  }, [isOpen, initialTime]);

  const adjustHour = (delta: number) => {
    setSelectedTime((prev) => {
      let newHour = prev.hour + delta;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      return { ...prev, hour: newHour };
    });
  };

  const adjustMinute = (delta: number) => {
    setSelectedTime((prev) => {
      let newMinute = prev.minute + delta * 15;
      if (newMinute >= 60) newMinute = 0;
      if (newMinute < 0) newMinute = 45;
      return { ...prev, minute: newMinute };
    });
  };

  const togglePeriod = () => {
    setSelectedTime((prev) => ({
      ...prev,
      period: prev.period === 'AM' ? 'PM' : 'AM',
    }));
  };

  const handleSchedule = () => {
    const now = new Date();
    let hours = selectedTime.hour;
    if (selectedTime.period === 'PM' && hours !== 12) hours += 12;
    if (selectedTime.period === 'AM' && hours === 12) hours = 0;

    const scheduledDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      selectedTime.minute
    );

    // If the time is in the past, assume tomorrow
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    onSchedule(scheduledDate);
    onClose();
  };

  const handleClear = () => {
    onSchedule(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-sale-panel rounded-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-white font-semibold">Schedule Order</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Time Picker */}
        <div className="p-6">
          <p className="text-white/60 text-sm text-center mb-6">
            Select a time for this order to be prepared
          </p>

          <div className="flex items-center justify-center gap-4">
            {/* Hour */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => adjustHour(1)}
                className="w-12 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
              <span className="text-white text-4xl font-bold my-2 w-12 text-center">
                {selectedTime.hour.toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => adjustHour(-1)}
                className="w-12 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* Separator */}
            <span className="text-white text-4xl font-bold">:</span>

            {/* Minute */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => adjustMinute(1)}
                className="w-12 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
              <span className="text-white text-4xl font-bold my-2 w-12 text-center">
                {selectedTime.minute.toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => adjustMinute(-1)}
                className="w-12 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* AM/PM */}
            <div className="flex flex-col items-center ml-2">
              <button
                onClick={togglePeriod}
                className={cn(
                  'w-14 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                  selectedTime.period === 'AM'
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                AM
              </button>
              <div className="h-2" />
              <button
                onClick={togglePeriod}
                className={cn(
                  'w-14 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                  selectedTime.period === 'PM'
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="flex gap-2 mt-6 justify-center">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  const now = new Date();
                  now.setMinutes(now.getMinutes() + mins);
                  setSelectedTime({
                    hour: now.getHours() % 12 || 12,
                    minute: Math.floor(now.getMinutes() / 15) * 15,
                    period: now.getHours() >= 12 ? 'PM' : 'AM',
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-xs hover:bg-white/20 transition-colors"
              >
                +{mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg text-red-400 text-sm hover:bg-red-500/10 transition-colors"
          >
            Clear Schedule
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
