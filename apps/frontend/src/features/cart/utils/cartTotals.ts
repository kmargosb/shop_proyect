import type { CartItem } from '../types';

export function getTotalItems(items: CartItem[]) {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

export function getTotalPrice(items: CartItem[]) {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}
