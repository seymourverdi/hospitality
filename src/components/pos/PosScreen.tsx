"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma } from "@prisma/client";
import { authFetch, assertOk, clearPosToken } from "@/lib/pos/auth-client";
import { getSelectedTableId, setSelectedTableId, clearSelectedTableId } from "@/lib/pos/pos-state";

import CategorySidebar from "@/components/pos/CategorySidebar";
import MenuGrid from "@/components/pos/MenuGrid";
import OrderPanel from "@/components/pos/OrderPanel";
import RequirePosAuth from "@/components/pos/RequirePosAuth";

type Category = { id: number; name: string };
type MenuItem = { id: number; name: string; basePrice: string; sku?: string | null };

type CategoriesResponse = { ok: true; categories: Category[] };
type MenuItemsResponse = { ok: true; items: MenuItem[] };

type OpenOrderResponse = {
  ok: true;
  reused: boolean;
  order: { id: number; tableId: number; status: string; orderType: string };
};

type PaymentSummary = {
  approvedAmount: string;
  approvedTipAmount: string;
  remaining: string;
  isPaid: boolean;
};

type OrderView = {
  id: number;
  status: string;
  tableId: number | null;
  table?: { id: number; name: string } | null;
  totals: {
    subtotalAmount: string;
    discountAmount: string;
    serviceChargeAmount: string;
    taxAmount: string;
    totalAmount: string;
  };
  paymentSummary: PaymentSummary;
  items: Array<{
    id: number;
    menuItemId: number;
    quantity: number;
    finalPrice: string;
    status?: string;
    kdsStatus?: string;
    menuItem: { id: number; name: string; sku?: string | null };
    modifiers?: Array<{
      id: number;
      modifierOptionId: number;
      priceDelta: string | null;
      option: { id: number; name: string; group: { id: number; name: string } };
    }>;
  }>;
};

type OrderDetailsResponse = {
  ok: true;
  order: Omit<OrderView, "paymentSummary">;
  paymentSummary: PaymentSummary;
};

type AddItemResponse = {
  ok: true;
  item: { id: number };
  totals?: unknown;
};

function money(s: string): string {
  try {
    return new Prisma.Decimal(s).toDecimalPlaces(2).toString();
  } catch {
    return s;
  }
}

export default function PosScreen() {
  return (
    <RequirePosAuth>
      <PosScreenInner />
    </RequirePosAuth>
  );
}

function PosScreenInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [order, setOrder] = useState<OrderView | null>(null);

  const [loading, setLoading] = useState(true);
  const [busyAdd, setBusyAdd] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCategory = useMemo(() => {
    if (!activeCategoryId) return null;
    return categories.find((c) => c.id === activeCategoryId) || null;
  }, [categories, activeCategoryId]);

  async function loadCategories(): Promise<Category[]> {
    const res = await authFetch("/api/pos/menu/categories", { method: "GET" });
    const data = await assertOk<CategoriesResponse>(res);
    setCategories(data.categories);
    return data.categories;
  }

  async function loadMenu(categoryId: number) {
    const qs = new URLSearchParams({ categoryId: String(categoryId) });
    const res = await authFetch(`/api/pos/menu/items?${qs.toString()}`, { method: "GET" });
    const data = await assertOk<MenuItemsResponse>(res);
    setMenuItems(data.items);
  }

  async function loadOrder(id: number) {
    const res = await authFetch(`/api/pos/orders/${id}`, { method: "GET" });
    const data = await assertOk<OrderDetailsResponse>(res);

    setOrder({
      ...data.order,
      paymentSummary: data.paymentSummary,
    });
  }

  async function openOrderForSelectedTable(): Promise<number> {
    const stored = getSelectedTableId();

    const urlTableIdRaw = searchParams.get("tableId");
    const urlTableId = urlTableIdRaw ? Number(urlTableIdRaw) : Number.NaN;

    const tableId = stored ?? (Number.isInteger(urlTableId) && urlTableId > 0 ? urlTableId : null);

    if (!tableId) {
      router.replace("/pos/tables");
      throw new Error("No table selected");
    }

    if (!stored) {
      setSelectedTableId(tableId);
    }

    const urlOrderIdRaw = searchParams.get("orderId");
    const urlOrderId = urlOrderIdRaw ? Number(urlOrderIdRaw) : Number.NaN;

    if (Number.isInteger(urlOrderId) && urlOrderId > 0) {
      try {
        await loadOrder(urlOrderId);
        return urlOrderId;
      } catch {
        // ignore and fallback to open-order
      }
    }

    const res = await authFetch(`/api/pos/tables/${tableId}/open-order`, { method: "POST" });
    const data = await assertOk<OpenOrderResponse>(res);
    return data.order.id;
  }

  async function bootstrap() {
    setLoading(true);
    setError(null);

    try {
      const cats = await loadCategories();
      const firstCategoryId = cats[0]?.id ?? null;

      if (firstCategoryId) {
        setActiveCategoryId(firstCategoryId);
        await loadMenu(firstCategoryId);
      } else {
        setActiveCategoryId(null);
        setMenuItems([]);
      }

      const oid = await openOrderForSelectedTable();
      setOrderId(oid);
      await loadOrder(oid);

      if (searchParams.get("tableId") || searchParams.get("orderId")) {
        router.replace("/pos");
      }

      setLoading(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      setLoading(false);

      if (msg.toLowerCase().includes("unauthorized")) {
        clearPosToken();
        clearSelectedTableId();
        router.replace("/");
      }
    }
  }

  useEffect(() => {
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeCategoryId) return;
    void loadMenu(activeCategoryId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId]);

  async function addItem(menuItemId: number) {
    if (!orderId) return;
    setBusyAdd(menuItemId);
    setError(null);

    try {
      const res = await authFetch(`/api/pos/orders/${orderId}/items`, {
        method: "POST",
        body: JSON.stringify({ menuItemId, quantity: 1 }),
      });

      await assertOk<AddItemResponse>(res);
      await loadOrder(orderId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);

      if (msg.toLowerCase().includes("unauthorized")) {
        clearPosToken();
        clearSelectedTableId();
        router.replace("/");
      }
    } finally {
      setBusyAdd(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/70">
          Loading POS…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 w-[360px]">
          <div className="text-lg font-semibold">Error</div>
          <div className="mt-2 text-sm text-white/70">{error}</div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3 text-sm font-semibold"
              onClick={() => router.replace("/pos/tables")}
              type="button"
            >
              Select table
            </button>

            <button
              className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3 text-sm font-semibold"
              onClick={() => void bootstrap()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerTableName = order?.table?.name || (order?.tableId ? `Table ${order.tableId}` : "—");
  const total = order ? money(order.totals.totalAmount) : "0.00";

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-white/60">Active table</div>
            <div className="text-xl font-semibold">{headerTableName}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-white/60">Total</div>
              <div className="text-xl font-semibold">${total}</div>
            </div>

            <button
              className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3 text-sm font-semibold"
              onClick={() => {
                clearSelectedTableId();
                router.replace("/pos/tables");
              }}
              type="button"
            >
              Change table
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[260px_1fr_360px] gap-0 min-h-[calc(100vh-73px)]">
        <CategorySidebar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(id) => setActiveCategoryId(id)}
        />

        <MenuGrid
          title={activeCategory?.name ?? "Menu"}
          items={menuItems}
          onPickItem={(id) => void addItem(id)}
          busyItemId={busyAdd}
        />

        <OrderPanel
          order={order}
          onRefresh={() => {
            if (orderId) {
              void loadOrder(orderId);
              return;
            }
            void bootstrap();
          }}
        />
      </div>
    </div>
  );
}