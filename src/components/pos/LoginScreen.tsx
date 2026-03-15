"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { assertOk, clearPosToken, setPosToken } from "@/lib/pos/auth-client";

type PinResponse = {
  token: string;
  expiresAt: string;
  location: { id: number; code: string; name: string; timezone: string | null };
  terminal: { id: number; code: string | null; name: string; deviceType: string };
  user: { id: number; firstName: string; lastName: string; roleId: number };
};

type FormState = {
  locationCode: string;
  terminalCode: string;
  pin: string;
};

function onlyDigits(x: string): string {
  return x.replace(/\D+/g, "");
}

export default function LoginScreen() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    locationCode: "DEMO",
    terminalCode: "POS-1",
    pin: "",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      form.locationCode.trim().length > 0 &&
      form.terminalCode.trim().length > 0 &&
      form.pin.trim().length >= 4 &&
      !busy
    );
  }, [form.locationCode, form.terminalCode, form.pin, busy]);

  useEffect(() => {
    
    clearPosToken();
  }, []);

  async function submit() {
    if (!canSubmit) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          locationCode: form.locationCode.trim(),
          terminalCode: form.terminalCode.trim(),
          pinCode: form.pin.trim(),
        }),
      });

      const payload = await assertOk<PinResponse>(res);

      if (!payload.token || payload.token.trim().length === 0) {
        throw new Error("The server did not return a token.");
      }

      setPosToken(payload.token);
      router.replace("/pos");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login error";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function pressDigit(d: string) {
    setForm((s) => ({ ...s, pin: (s.pin + d).slice(0, 8) }));
  }

  function backspace() {
    setForm((s) => ({ ...s, pin: s.pin.slice(0, -1) }));
  }

  function clearPin() {
    setForm((s) => ({ ...s, pin: "" }));
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/40 p-6 shadow-2xl">
          <div className="mb-6">
            <div className="text-2xl font-semibold">Restaurant POS</div>
            <div className="mt-1 text-sm text-neutral-400">
              {form.locationCode.trim() || "—"} • {form.terminalCode.trim() || "—"}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block">
              <div className="mb-1 text-xs text-neutral-400">Location Code</div>
              <input
                value={form.locationCode}
                onChange={(e) =>
                  setForm((s) => ({ ...s, locationCode: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-neutral-950/40 px-4 py-3 text-sm outline-none focus:border-white/20"
                placeholder="DEMO"
                autoComplete="off"
                inputMode="text"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs text-neutral-400">Terminal Code</div>
              <input
                value={form.terminalCode}
                onChange={(e) =>
                  setForm((s) => ({ ...s, terminalCode: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-neutral-950/40 px-4 py-3 text-sm outline-none focus:border-white/20"
                placeholder="POS-1"
                autoComplete="off"
                inputMode="text"
              />
            </label>

            <div>
              <div className="mb-1 text-xs text-neutral-400">PIN</div>

              <input
                value={"•".repeat(form.pin.length)}
                onChange={(e) => {
                  const digits = onlyDigits(e.target.value);
                  setForm((s) => ({ ...s, pin: digits.slice(0, 8) }));
                }}
                className="w-full rounded-xl border border-white/10 bg-neutral-950/40 px-4 py-3 text-lg tracking-widest outline-none focus:border-white/20"
                placeholder="••••"
                autoComplete="off"
                inputMode="numeric"
              />

              <div className="mt-4 grid grid-cols-3 gap-3">
                {["1","2","3","4","5","6","7","8","9"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => pressDigit(d)}
                    disabled={busy}
                    className="h-12 rounded-xl border border-white/10 bg-white/5 text-base font-medium hover:bg-white/10 disabled:opacity-60"
                  >
                    {d}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={backspace}
                  disabled={busy}
                  className="h-12 rounded-xl border border-white/10 bg-white/5 text-base font-medium hover:bg-white/10 disabled:opacity-60"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => pressDigit("0")}
                  disabled={busy}
                  className="h-12 rounded-xl border border-white/10 bg-white/5 text-base font-medium hover:bg-white/10 disabled:opacity-60"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className="h-12 rounded-xl bg-emerald-600 text-base font-semibold hover:bg-emerald-500 disabled:opacity-60"
                >
                  Enter
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearPin}
                  disabled={busy || form.pin.length === 0}
                  className="text-xs text-neutral-400 hover:text-neutral-200 disabled:opacity-60"
                >
                  Clear PIN
                </button>
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm">
                  <div className="font-semibold">Error</div>
                  <div className="mt-1 text-red-100/90">{error}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
