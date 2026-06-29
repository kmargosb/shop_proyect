import type { CartItem, OptimisticCartItem } from '../types';

export function applyLocalChange(items: CartItem[], itemId: string, delta: number): CartItem[] {
  return items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)),
    };
  });
}

export function addLocalItem(
  items: CartItem[],
  productId: string,
  variantId: string,
  quantity: number,
  optimisticItem: OptimisticCartItem,
): CartItem[] {
  const existing = items.find((i) => i.productId === productId && i.variantId === variantId);

  if (existing) {
    return items.map((i) =>
      i.id === existing.id
        ? {
            ...i,
            quantity: Math.min(i.stock, i.quantity + quantity),
          }
        : i,
    );
  }

  return [
    ...items,
    {
      id: `optimistic-${Date.now()}`,
      ...optimisticItem,
    },
  ];
}
