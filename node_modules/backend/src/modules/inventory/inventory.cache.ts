import { redis } from "@/lib/redis";

const STOCK_KEY = (productId: string) => `product:stock:${productId}`;

export const InventoryCache = {
  async getStock(productId: string): Promise<number | null> {
    const value = await redis.get(STOCK_KEY(productId));

    if (!value) return null;

    return Number(value);
  },

  async setStock(productId: string, stock: number) {
    await redis.set(STOCK_KEY(productId), stock);
  },

  async decrementStock(productId: string, quantity: number) {
    await redis.decrby(STOCK_KEY(productId), quantity);
  },

  async incrementStock(productId: string, quantity: number) {
    await redis.incrby(STOCK_KEY(productId), quantity);
  },

  async deleteStock(productId: string) {
    await redis.del(STOCK_KEY(productId));
  },
};
