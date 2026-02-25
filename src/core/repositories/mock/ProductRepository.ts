// City Club HMS - Mock Product Repository
// Uses mock data from Sale constants for development

import type { IProductRepository } from '../types';
import type { Product, CategoryId } from '@/modules/Sale/types';
import {
  PRODUCTS,
  getProductsByCategory,
  searchProducts as searchMockProducts,
} from '@/modules/Sale/constants';

export class MockProductRepository implements IProductRepository {
  async getProducts(categoryId?: CategoryId): Promise<Product[]> {
    // Simulate network delay
    await this.delay(100);
    return categoryId ? getProductsByCategory(categoryId) : PRODUCTS;
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.delay(50);
    return PRODUCTS.find((p) => p.id === id) || null;
  }

  async searchProducts(query: string): Promise<Product[]> {
    await this.delay(100);
    return searchMockProducts(query);
  }

  async getAvailability(productId: string): Promise<number | '∞'> {
    await this.delay(50);
    const product = PRODUCTS.find((p) => p.id === productId);
    return product?.available ?? 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
