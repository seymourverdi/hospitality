"use client";

type MenuItem = {
  id: number;
  name: string;
  basePrice: string | number;
};

type Order = {
  id: number;
};

type Props = {
  items: MenuItem[];
  order: Order | null;
  refreshOrder: () => Promise<void>;
};

export default function MenuArea({ items, order, refreshOrder }: Props) {
  async function addItem(menuItemId: number) {
    if (!order) return;

    await fetch(`/api/pos/orders/${order.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menuItemId,
        quantity: 1,
      }),
    });

    await refreshOrder();
  }

  return (
    <div className="w-[52%] p-6 overflow-y-auto bg-neutral-950">
      <div className="grid grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => addItem(item.id)}
            className="bg-neutral-900 rounded-2xl p-4 hover:bg-neutral-800 transition cursor-pointer"
          >
            <div className="text-lg font-semibold mb-2">
              {item.name}
            </div>

            <div className="text-xl font-bold text-emerald-500">
              {item.basePrice}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}