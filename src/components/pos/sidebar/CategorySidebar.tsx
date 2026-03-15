import { Category } from "../PosScreen";

type Props = {
  categories: Category[];
  activeCategoryId: number | null;
  onSelect: (id: number) => void;
};

export default function CategorySidebar({
  categories,
  activeCategoryId,
  onSelect,
}: Props) {
  return (
    <div className="w-[18%] min-w-[220px] bg-neutral-900 border-r border-neutral-800 flex flex-col">
      <div className="p-4 border-b border-neutral-800 text-lg font-semibold">
        Categories
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {categories.map((cat) => {
          const active = cat.id === activeCategoryId;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
