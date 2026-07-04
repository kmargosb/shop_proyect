import { apiFetch } from '@/shared/lib/api';
import { request } from '@/shared/lib/request';
import type { CartItem, CartResponse, CartResponseItem } from './types';

export const mapItems = (cart: CartResponse): CartItem[] =>
  (cart.items ?? [])
    .sort(
      (a: CartResponseItem, b: CartResponseItem) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((item: CartResponseItem) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product?.name ?? 'Producto',
      price: item.price,
      quantity: item.quantity,
      stock: item.variant?.stock ?? 0,
      image:
        item.product?.images?.find((img) => img.isPrimary)?.url ??
        item.product?.images?.[0]?.url ??
        null,
      size: item.variant?.size ?? null,
      color: item.variant?.color ?? null,
    }));

export async function getCart() {
  console.count('🌐 GET /cart');

  const res = await apiFetch('/cart');

  if (!res || !res.ok) {
    return null;
  }

  return res.json();
}

export async function getActiveCartId(
  _cartIdRef: React.MutableRefObject<string | null>,
): Promise<string | null> {
  const cart = await getCart();

  return cart?.id ?? null;
}

export async function fetchCart() {
  console.count('🛒 fetchCart()');

  console.trace('🛒 fetchCart called from');

  const cart = await getCart();

  if (!cart) {
    return [];
  }

  return mapItems(cart);
}

export async function addItemRequest(productId: string, variantId: string, quantity: number) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      productId,
      variantId,
      quantity,
    }),
  });
}

export async function removeItemRequest(itemId: string) {
  return apiFetch(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export async function updateQuantityRequest(
  productId: string,
  variantId: string,
  quantity: number,
) {
  return apiFetch('/cart/items/update', {
    method: 'POST',
    body: JSON.stringify({
      productId,
      variantId,
      quantity,
    }),
  });
}
