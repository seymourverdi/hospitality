"use client";

type Category = { id: number; name: string };

export default function CategorySidebar(props: {
  categories: Category[];
  activeCategoryId: number | null;
  onSelectCategory: (id: number) => void;
}) {
  return (
    <aside className="border-r border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs tracking-widest text-white/60">CATEGORIES</div>

      <div className="mt-3 space-y-2">
        {props.categories.map((c) => {
          const active = props.activeCategoryId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => props.onSelectCategory(c.id)}
              className={[
                "w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition",
                active ? "bg-white/10 border border-white/10" : "bg-transparent hover:bg-white/5",
              ].join(" ")}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
