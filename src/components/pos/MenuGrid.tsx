"use client";

type MenuItem = { id: number; name: string; basePrice: string; sku?: string | null; hasModifiers?: boolean };

export default function MenuGrid(props: {
  title: string;
  items: MenuItem[];
  onPickItem: (menuItemId: number) => void;
  busyItemId?: number | null;
}) {
  return (
    <main className="p-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-lg font-semibold">{props.title}</div>
          <div className="text-sm text-white/50">{props.items.length} items</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {props.items.map((it) => {
          const busy = props.busyItemId === it.id;

          return (
            <button
              key={it.id}
              onClick={() => props.onPickItem(it.id)}
              disabled={!!props.busyItemId}
              className={[
                "text-left rounded-2xl transition p-5 border",
                busy ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/10 hover:bg-white/15",
                "disabled:opacity-60",
              ].join(" ")}
            >
              <div className="text-base font-semibold">{it.name}</div>
              <div className="mt-1 text-sm text-white/60">${it.basePrice}</div>
              {busy ? <div className="mt-2 text-xs text-white/60">Adding...</div> : null}
            </button>
          );
        })}
      </div>
    </main>
  );
}
