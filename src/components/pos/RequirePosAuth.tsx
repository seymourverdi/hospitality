"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { assertOk, clearPosToken, getPosToken, authFetch } from "@/lib/pos/auth-client";

type MeResponse = {
  ok: true;
  location: { id: number; code: string; name: string; timezone: string | null };
  terminal: { id: number; code: string | null; name: string; deviceType: string };
  user: { id: number; firstName: string; lastName: string; roleId: number };
};

function buildLoginUrl(pathname: string | null) {
  const next = pathname && pathname.startsWith("/") ? pathname : "/pos";
  return `/?next=${encodeURIComponent(next)}`;
}

export default function RequirePosAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      const token = getPosToken();
      if (!token) {
        clearPosToken();
        router.replace(buildLoginUrl(pathname) as Route);
        return;
      }

      try {
        const res = await authFetch("/api/me", { method: "GET" });
        await assertOk<MeResponse>(res);

        if (!alive) return;
        setReady(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unauthorized";
        const isUnauthorized = msg.toLowerCase().includes("unauthorized") || msg.includes("401");

        clearPosToken();
        if (!alive) return;

        if (isUnauthorized) {
          router.replace(buildLoginUrl(pathname) as Route);
          return;
        }

        router.replace(buildLoginUrl(pathname) as Route);
      }
    }

    setReady(false);
    void run();

    return () => {
      alive = false;
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 px-6 py-5 text-sm text-neutral-300">
            Checking the session...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}