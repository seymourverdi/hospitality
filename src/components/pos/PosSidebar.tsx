"use client";

import { useMemo } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  match?: "exact" | "prefix";
  enabled?: boolean;
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function isActivePath(pathname: string, href: string, match: "exact" | "prefix" = "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavButton({
  active,
  enabled,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  enabled: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => enabled && onClick()}
      className={cn(
        "w-full py-2 flex flex-col items-center gap-1 rounded-lg transition select-none",
        enabled ? "hover:text-zinc-100" : "opacity-40 cursor-not-allowed",
        active ? "text-zinc-50" : "text-zinc-300/70",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          active
            ? "border border-dashed border-zinc-200/70 bg-zinc-800/60"
            : "border border-transparent",
        )}
      >
        {icon}
      </div>
      <div className="text-[11px] font-medium tracking-wide">{label}</div>
    </button>
  );
}

function IconLogo() {
  return (
    <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-black text-lg">
      H
    </div>
  );
}

function icon(svg: React.ReactNode) {
  return <div className="w-[18px] h-[18px]">{svg}</div>;
}

function IconBars() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M5 20V10M12 20V4M19 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>,
  );
}

function IconSale() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M12 2v20M16 6.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.2 2.6 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>,
  );
}

function IconCard() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M4 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M2 11h20" stroke="currentColor" strokeWidth="2" />
    </svg>,
  );
}

function IconDisplay() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>,
  );
}

function IconTable() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M4 11h16M6 11V6h12v5M7 11v7M17 11v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>,
  );
}

function IconSliders() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M4 21V14M12 21V12M20 21V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>,
  );
}

function IconList() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>,
  );
}

function IconGear() {
  return icon(
    <svg viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>,
  );
}

export function PosSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = useMemo(
    () => [
      { key: "stats", label: "Stats", href: "/pos/stats", icon: <IconBars />, enabled: false },
      { key: "sale", label: "Sale", href: "/pos", icon: <IconSale />, match: "exact", enabled: true },
      { key: "rsvp", label: "Rsvp", href: "/pos/rsvp", icon: <IconCard />, enabled: false },
      { key: "display", label: "Display", href: "/pos/display", icon: <IconDisplay />, enabled: false },
      { key: "tables", label: "Tables", href: "/pos/tables", icon: <IconTable />, enabled: true },
      { key: "filter", label: "Filter", href: "/pos/filter", icon: <IconSliders />, enabled: false },
      { key: "log", label: "Log", href: "/pos/log", icon: <IconList />, enabled: false },
    ],
    [],
  );

  return (
    <aside className="w-20 min-w-20 bg-zinc-900 border-r border-zinc-800 h-screen flex flex-col items-center py-3">
      <IconLogo />

      <div className="mt-3 w-full flex flex-col gap-1 px-1">
        {navItems.map((it) => {
          const active = isActivePath(pathname, it.href, it.match ?? "prefix");
          const enabled = it.enabled !== false;
          return (
            <NavButton
              key={it.key}
              active={active}
              enabled={enabled}
              label={it.label}
              icon={it.icon}
              onClick={() => router.push(it.href as Route)}
            />
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="w-full px-1 pb-2">
        <NavButton
          active={isActivePath(pathname, "/admin", "prefix")}
          enabled={true}
          label="Admin"
          icon={<IconGear />}
          onClick={() => router.push("/admin" as Route)}
        />
      </div>
    </aside>
  );
}