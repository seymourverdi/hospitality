"use client";

import React from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  disabled?: boolean;
};

export function PinNumpad({
  value,
  onChange,
  maxLength = 6,
  disabled = false,
}: Props) {
  function pushDigit(d: string) {
    if (disabled) return;
    if (value.length >= maxLength) return;
    onChange(value + d);
  }

  function backspace() {
    if (disabled) return;
    if (!value.length) return;
    onChange(value.slice(0, -1));
  }

  function clear() {
    if (disabled) return;
    onChange("");
  }

  const digitBtn =
    "h-14 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15 " +
    "text-white text-lg font-semibold transition select-none disabled:opacity-50";

  const actionBtn =
    "h-14 rounded-xl border border-white/10 bg-white/8 hover:bg-white/12 active:bg-white/15 " +
    "text-white/90 text-sm font-semibold transition select-none disabled:opacity-50";

  return (
    <div className="grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button
          key={d}
          type="button"
          className={digitBtn}
          onClick={() => pushDigit(d)}
          disabled={disabled}
        >
          {d}
        </button>
      ))}

      <button type="button" className={actionBtn} onClick={clear} disabled={disabled}>
        Clear
      </button>

      <button type="button" className={digitBtn} onClick={() => pushDigit("0")} disabled={disabled}>
        0
      </button>

      <button type="button" className={actionBtn} onClick={backspace} disabled={disabled}>
        Back
      </button>
    </div>
  );
}