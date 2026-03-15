import type { IProductRepository } from "@/core/repositories/types";
import type { CategoryId, Product, ModifierGroup } from "@/modules/Sale/types";
import { ApiClient } from "./http";
import {
  type ApiMenuItem,
  type ApiModifierGroup,
  mapMenuItemToProduct,
  mapModifierGroup,
  toIdNumber,
} from "./mappers";

type MenuItemsResponse = {
  ok: true;
  items: ApiMenuItem[];
  page: { limit: number; nextCursor: number | null };
};

type ModifierGroupsResponse = {
  ok: true;
  groups: ApiModifierGroup[];
};

export class ApiProductRepository implements IProductRepository {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getProducts(categoryId?: CategoryId): Promise<Product[]> {
    void categoryId;

    const res = await this.api.get<MenuItemsResponse>(`/api/pos/menu/items?limit=200`);
    return res.items.map(mapMenuItemToProduct);
  }

  async getProductById(id: string): Promise<Product | null> {
    const all = await this.getProducts();
    return all.find((p) => p.id === id) ?? null;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim();
    if (!q) return this.getProducts();

    const res = await this.api.get<MenuItemsResponse>(
      `/api/pos/menu/items?search=${encodeURIComponent(q)}&limit=200`
    );
    return res.items.map(mapMenuItemToProduct);
  }

  async getAvailability(productId: string): Promise<number | "∞"> {
    void productId;
    return "∞";
  }

  async getModifierGroupsForProduct(productId: string): Promise<ModifierGroup[]> {
    const id = toIdNumber(productId);
    const res = await this.api.get<ModifierGroupsResponse>(`/api/pos/menu/items/${id}/modifier-groups`);
    return res.groups.map(mapModifierGroup);
  }
}