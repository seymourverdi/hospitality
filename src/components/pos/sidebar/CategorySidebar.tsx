"use client";

type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
  activeCategoryId: number | null;
  setActiveCategoryId: (id: number | null) => void;
};

export default function CategorySidebar({
  categories,
  activeCategoryId,
  setActiveCategoryId,
}: Props) {
  return (
    <div className="w-[18%] bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`text-left px-4 py-3 rounded-xl transition ${
            activeCategoryId === null
              ? "bg-neutral-800 text-white"
              : "text-neutral-400 hover:bg-neutral-800"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`text-left px-4 py-3 rounded-xl transition ${
              activeCategoryId === cat.id
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}